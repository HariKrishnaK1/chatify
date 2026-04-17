import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  typingUsers: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  hasMoreMessages: false,
  replyingTo: null,
  searchTerm: "",
  drafts: {}, // { [userId]: text }
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,

  setSearchTerm: (term) => set({ searchTerm: term }),
  setDraft: (userId, text) => set((state) => ({ 
    drafts: { ...state.drafts, [userId]: text } 
  })),
  setReplyingTo: (msg) => set({ replyingTo: msg }),

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/message/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/message/chats");
      set({ chats: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (userId, page = 1) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/message/${userId}?page=${page}`);
      set((state) => ({ 
        messages: page === 1 ? res.data : [...res.data, ...state.messages],
        page: page,
        hasMoreMessages: res.data.length === 20
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages, replyingTo } = get();
    const { authUser } = useAuthStore.getState();

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      isOptimistic: true, // flag to identify optimistic messages (optional)
      read: false,
      replyTo: replyingTo ? { ...replyingTo } : null,
    };
      // immediately update the ui by adding the message
    set((state) => ({ 
      messages: [...state.messages, optimisticMessage],
      replyingTo: null
    }));

    try {
      const socket = useAuthStore.getState().socket;
      const payload = { ...messageData, replyTo: replyingTo?._id, socketId: socket?.id };
      const res = await axiosInstance.post(
        `/message/send/${selectedUser._id}`,
        payload
      );
      set((state) => {
        const newChats = [...state.chats];
        const chatIndex = newChats.findIndex(c => c._id === selectedUser._id);
        if (chatIndex !== -1) {
          const chatToUpdate = { ...newChats[chatIndex], lastMessage: res.data };
          newChats.splice(chatIndex, 1);
          newChats.unshift(chatToUpdate);
        }
        
        return { 
          messages: state.messages.map(msg => msg._id === tempId ? res.data : msg),
          chats: newChats
        };
      });
    } catch (error) {
      // remove optimistic message on failure
      set((state) => ({ 
        messages: state.messages.filter(msg => msg._id !== tempId) 
      }));
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  markMessagesAsRead: async (senderId) => {
    try {
      const socket = useAuthStore.getState().socket;
      await axiosInstance.put(`/message/read/${senderId}`, { socketId: socket?.id });
      // Optimistically update UI
      set((state) => {
        const newMessages = state.messages.map((msg) =>
          msg.senderId === senderId && !msg.read ? { ...msg, read: true } : msg
        );

        const newChats = state.chats.map((chat) => {
          if (chat._id === senderId) {
            return {
              ...chat,
              unreadCount: 0,
              lastMessage: chat.lastMessage ? { ...chat.lastMessage, read: true } : chat.lastMessage
            };
          }
          return chat;
        });

        return { messages: newMessages, chats: newChats };
      });

      // Emit socket event to notify sender
      socket.emit("messagesRead", { senderId });
    } catch (error) {
      console.error(error);
    }
  },

  deleteMessage: async (messageId, forEveryone) => {
    try {
      await axiosInstance.delete(`/message/${messageId}`, { data: { forEveryone } });
      if (forEveryone) {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg._id === messageId
              ? { ...msg, isDeletedForEveryone: true, text: "This message was deleted", image: null }
              : msg
          ),
        }));
      } else {
        set((state) => ({
          messages: state.messages.filter((msg) => msg._id !== messageId),
        }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },

  forwardMessages: async (messagesToForward, receiverIds) => {
    try {
      const promises = [];
      receiverIds.forEach((receiverId) => {
        messagesToForward.forEach((msg) => {
          promises.push(
            axiosInstance.post(`/message/send/${receiverId}`, {
              text: msg.text,
              image: msg.image,
            })
          );
        });
      });
      const results = await Promise.all(promises);
      
      const { selectedUser } = get();
      if (selectedUser && receiverIds.includes(selectedUser._id)) {
        const newMessagesForCurrentChat = results
          .map(res => res.data)
          .filter(msg => msg.receiverId === selectedUser._id || msg.senderId === selectedUser._id);
          
        set(state => ({
          messages: [...state.messages, ...newMessagesForCurrentChat]
        }));
      }

      toast.success("Messages forwarded successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to forward messages");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, isSoundEnabled } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const { authUser } = useAuthStore.getState();
      const isSoundEnabled = get().isSoundEnabled;

      set((state) => {
        // Match if it's from the selected partner OR if it's from ME to the selected partner (other tab sync)
        const isFromSelected = newMessage.senderId === state.selectedUser?._id;
        const isFromMeToSelected = newMessage.senderId === authUser?._id && newMessage.receiverId === state.selectedUser?._id;
        
        // Update sidebar "last message" AND increment unreadCount if not active
        const partnerId = newMessage.senderId === authUser?._id ? newMessage.receiverId : newMessage.senderId;
        const newChats = [...state.chats];
        const chatIndex = newChats.findIndex(c => c._id === partnerId);
        
        if (chatIndex !== -1) {
          const chatToUpdate = { 
            ...newChats[chatIndex], 
            lastMessage: newMessage,
            unreadCount: !isFromSelected && newMessage.senderId !== authUser?._id 
              ? (newChats[chatIndex].unreadCount || 0) + 1 
              : (newChats[chatIndex].unreadCount || 0)
          };
          newChats.splice(chatIndex, 1);
          newChats.unshift(chatToUpdate);
        }
        
        // Prevent duplicates (optimistic messages vs socket messages)
        const isDuplicate = state.messages.some(msg => msg._id === newMessage._id);
        
        const newMessages = (isFromSelected || isFromMeToSelected) && !isDuplicate 
          ? [...state.messages, newMessage] 
          : state.messages;

        // Mark as read message immediately if chat is open AND it's from the partner
        if (isFromSelected) {
          setTimeout(() => get().markMessagesAsRead(newMessage.senderId), 0);
        }

        return { chats: newChats, messages: newMessages };
      });

      // Only play sound for INCOMING messages, not self-syncs
      if (isSoundEnabled && newMessage.senderId !== authUser?._id) {
        const notificationSound = new Audio("/sounds/notification.mp3");
        notificationSound.currentTime = 0;
        notificationSound.play().catch((e) => console.log("Audio play failed:", e));
      }
    });

    socket.on("typing", (userId) => {
      if (userId === selectedUser._id && !get().typingUsers.includes(userId)) {
        set((state) => ({ typingUsers: [...state.typingUsers, userId] }));
      }
    });

    socket.on("stopTyping", (userId) => {
      set((state) => ({ typingUsers: state.typingUsers.filter((id) => id !== userId) }));
    });

    socket.on("messagesRead", ({ readerId }) => {
      const { authUser } = useAuthStore.getState();
      if (readerId === selectedUser?._id) {
        set((state) => {
          const newMessages = state.messages.map((msg) =>
            msg.receiverId === readerId ? { ...msg, read: true } : msg
          );

          const newChats = state.chats.map((chat) => {
            if (chat._id === readerId && chat.lastMessage && chat.lastMessage.senderId === authUser?._id) {
              return {
                ...chat,
                lastMessage: { ...chat.lastMessage, read: true }
              };
            }
            return chat;
          });

          return { messages: newMessages, chats: newChats };
        });
      }
    });

    socket.on("messageDeleted", ({ messageId, forEveryone }) => {
      if (forEveryone) {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg._id === messageId
              ? { ...msg, isDeletedForEveryone: true, text: "This message was deleted", image: null }
              : msg
          ),
        }));
      } else {
        set((state) => ({
          messages: state.messages.filter((msg) => msg._id !== messageId),
        }));
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("typing");
    socket.off("stopTyping");
    socket.off("messagesRead");
    socket.off("messageDeleted");
  },
}));
