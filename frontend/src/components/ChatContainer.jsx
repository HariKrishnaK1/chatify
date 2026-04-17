import { useState, useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import ImageModal from "./ImageModal";
import UserProfilePanel from "./UserProfilePanel";
import ForwardModal from "./ForwardModal";
import { Check, CheckCheck, Trash2, Copy, Forward, CheckSquare, X, Reply, ArrowDown } from "lucide-react";

function ChatContainer() {
  const {
    selectedUser,
    messages,
    typingUsers,
    getMessagesByUserId,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
    deleteMessage,
    page,
    hasMoreMessages,
    setReplyingTo,
    markMessagesAsRead,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  
  const [modalImage, setModalImage] = useState(null);
  const [showProfileInfo, setShowProfileInfo] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  // Custom Menu & Selection State
  const [activeMenuMsg, setActiveMenuMsg] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState([]);
  const [showForwardModal, setShowForwardModal] = useState(false);
  
  // Global click to close context menu cleanly
  useEffect(() => {
    const handleGlobalClick = () => setActiveMenuMsg(null);
    if (activeMenuMsg) {
       const timer = setTimeout(() => {
          window.addEventListener("click", handleGlobalClick);
       }, 0);
       return () => {
          clearTimeout(timer);
          window.removeEventListener("click", handleGlobalClick);
       };
    }
  }, [activeMenuMsg]);

  // reset states when selected user changes
  useEffect(() => {
    setShowProfileInfo(false);
    setIsSelecting(false);
    setSelectedMessageIds([]);
    setActiveMenuMsg(null);
  }, [selectedUser?._id]);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessagesByUserId(selectedUser._id);
      subscribeToMessages();
      markMessagesAsRead(selectedUser._id);
    }

    return () => unsubscribeFromMessages();
  }, [
    selectedUser?._id,
    getMessagesByUserId,
    subscribeToMessages,
    unsubscribeFromMessages,
    markMessagesAsRead,
  ]);

  useEffect(() => {
    if (messageEndRef.current && !isSelecting && page === 1) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isSelecting, page]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    
    // Scroll to bottom arrow check
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 150);

    if (scrollTop === 0 && !isMessagesLoading && hasMoreMessages) {
      const currentScrollHeight = e.target.scrollHeight;
      getMessagesByUserId(selectedUser._id, page + 1).then(() => {
        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight - currentScrollHeight;
          }
        }, 0);
      });
    }
  };

  const handleContextMenu = (e, msg) => {
    e.preventDefault();
    if (msg.text === "This message was deleted") return;
    setActiveMenuMsg(msg);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setActiveMenuMsg(null);
  };

  const toggleSelection = (id) => {
    setSelectedMessageIds(prev => prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]);
  };
  
  const handleBulkDelete = (forEveryone) => {
     selectedMessageIds.forEach(id => deleteMessage(id, forEveryone));
     setIsSelecting(false);
     setSelectedMessageIds([]);
  };

  const startSelecting = (msgId) => {
    setIsSelecting(true);
    setSelectedMessageIds([msgId]);
    setActiveMenuMsg(null);
  };

  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
  };

  return (
    <div className="relative flex-1 flex flex-col overflow-hidden">
      {isSelecting ? (
        <div className="flex justify-between items-center bg-cyan-900/40 border-b border-cyan-800/50 shrink-0 h-16 sm:h-20 px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSelecting(false)} className="text-slate-300 hover:text-white p-2">
              <X className="w-5 h-5" />
            </button>
            <span className="text-cyan-100 font-medium text-lg">{selectedMessageIds.length} Selected</span>
          </div>
          <div className="flex items-center gap-3">
             <button 
                disabled={selectedMessageIds.length === 0}
                onClick={() => handleBulkDelete(false)}
                className="flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/20 rounded-lg transition disabled:opacity-50"
             >
                <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">Delete</span>
             </button>
             <button 
                disabled={selectedMessageIds.length === 0}
                onClick={() => setShowForwardModal(true)}
                className="flex items-center gap-2 px-3 py-2 text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition disabled:opacity-50"
             >
                <Forward className="w-4 h-4" /> <span className="hidden sm:inline">Forward</span>
             </button>
          </div>
        </div>
      ) : (
        <ChatHeader onProfileClick={() => setShowProfileInfo(true)} />
      )}

      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 px-3 sm:px-6 overflow-y-auto py-4 sm:py-8 relative scrollbar-hide"
      >
        {isMessagesLoading && page > 1 && (
           <div className="flex justify-center my-4"><span className="loading loading-spinner loading-sm text-cyan-500"></span></div>
        )}
        
        {messages.length > 0 ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg, index) => {
              const showDateDivider = index === 0 || new Date(msg.createdAt).toDateString() !== new Date(messages[index - 1].createdAt).toDateString();
              return (
              <div key={msg._id} className="flex flex-col">
                {showDateDivider && (
                  <div className="flex justify-center my-6">
                    <span className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 text-slate-400 text-[11px] font-medium uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                      {formatMessageDate(msg.createdAt)}
                    </span>
                  </div>
                )}
                <div
                  className={`flex w-full ${msg.senderId === authUser._id ? "justify-end" : "justify-start"} items-center gap-2 group`}
                >
                {/* Selection Checkbox */}
                {isSelecting && msg.text !== "This message was deleted" && (
                  <input 
                    type="checkbox" 
                    checked={selectedMessageIds.includes(msg._id)}
                    onChange={() => toggleSelection(msg._id)}
                    className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/50 cursor-pointer"
                  />
                )}

                <div className={`chat ${msg.senderId === authUser._id ? "chat-end" : "chat-start"} flex-1`}>
                  <div className="chat-bubble-container flex flex-col relative w-fit max-w-full">
                    <div
                      onContextMenu={(e) => handleContextMenu(e, msg)}
                      onClick={() => {
                        if (isSelecting && msg.text !== "This message was deleted") toggleSelection(msg._id);
                      }}
                      className={`chat-bubble relative pr-8 ${
                        msg.senderId === authUser._id
                          ? "bg-cyan-600 text-slate-200"
                          : "bg-slate-800 text-slate-200"
                      } ${msg.text === "This message was deleted" ? "italic text-slate-400 bg-transparent border border-slate-700/50 cursor-not-allowed" : isSelecting ? "cursor-pointer" : ""}`}
                    >
                      {msg.replyTo && (
                        <div className={`mb-1.5 px-3 py-1.5 rounded-md text-xs border-l-4 overflow-hidden ${msg.senderId === authUser._id ? "bg-cyan-800/40 border-cyan-400 text-cyan-50" : "bg-slate-900/60 border-slate-500 text-slate-300"}`}>
                          <div className="font-semibold mb-0.5 opacity-80">{msg.replyTo.senderId === authUser._id ? "You" : selectedUser.fullName}</div>
                          <div className="truncate opacity-80 max-w-[200px] sm:max-w-xs">{msg.replyTo.text || "Photo"}</div>
                        </div>
                      )}

                      {msg.image && (
                        <img
                          src={msg.image}
                          alt="Shared"
                          className="rounded-lg h-48 object-cover mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={(e) => {
                            if(!isSelecting) {
                              e.stopPropagation();
                              setModalImage(msg.image);
                            }
                          }}
                        />
                      )}
                      {msg.text && <p>{msg.text}</p>}

                      {msg.text !== "This message was deleted" && (
                         <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleContextMenu(e, msg);
                            }}
                            className="absolute -right-5 top-1/2 -translate-y-1/2 p-1 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white transition-opacity cursor-pointer z-10"
                         >
                            <svg className="w-5 h-5 pointer-events-none" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/></svg>
                         </div>
                      )}

                      <div className="text-[10px] mt-0.5 opacity-60 flex items-center justify-end gap-1 select-none">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {msg.senderId === authUser._id && msg.text !== "This message was deleted" && (
                          <span>
                            {msg.read ? (
                              <CheckCheck className="w-[14px] h-[14px] text-emerald-400" />
                            ) : (
                              <Check className="w-[14px] h-[14px] text-slate-400" />
                            )}
                          </span>
                        )}
                      </div>

                      {/* Anchored Context Menu */}
                      {activeMenuMsg?._id === msg._id && (
                        <div 
                          onClick={(e) => e.stopPropagation()}
                          className={`absolute top-full mt-2 ${msg.senderId === authUser._id ? "right-0" : "left-0"} bg-slate-800 border border-slate-700 rounded-lg shadow-2xl py-2 z-[60] min-w-[200px]`}
                        >
                          {activeMenuMsg.text && (
                            <button
                              onClick={() => handleCopy(activeMenuMsg.text)}
                              className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-3"
                            >
                              <Copy className="w-4 h-4" /> Copy Text
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setReplyingTo(activeMenuMsg);
                              setActiveMenuMsg(null);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-3"
                          >
                            <Reply className="w-4 h-4" /> Reply
                          </button>
                          <button
                            onClick={() => {
                              setShowForwardModal(true);
                              setSelectedMessageIds([activeMenuMsg._id]);
                              setActiveMenuMsg(null);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-3"
                          >
                            <Forward className="w-4 h-4" /> Forward
                          </button>

                          <button
                            onClick={() => startSelecting(activeMenuMsg._id)}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-3"
                          >
                            <CheckSquare className="w-4 h-4" /> Select Messages
                          </button>
                          
                          <div className="h-px bg-slate-700/50 my-1"></div>

                          <button
                            onClick={() => {
                              deleteMessage(activeMenuMsg._id, false);
                              setActiveMenuMsg(null);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300 flex items-center gap-3"
                          >
                            <Trash2 className="w-4 h-4" /> Delete for me
                          </button>

                          {activeMenuMsg.senderId === authUser._id && (
                            <button
                              onClick={() => {
                                deleteMessage(activeMenuMsg._id, true);
                                setActiveMenuMsg(null);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-slate-700 hover:text-red-400 flex items-center gap-3"
                            >
                              <Trash2 className="w-4 h-4" /> Delete for everyone
                            </button>
                          )}
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              </div>
              </div>
            )})}
            
            {typingUsers.includes(selectedUser._id) && (
              <div className="chat chat-start">
                <div className="chat-bubble bg-slate-800 text-slate-400 text-sm italic">
                  Typing...
                </div>
              </div>
            )}

            {/* scroll target */}
            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading && page === 1 ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>

      {showScrollButton && (
        <button 
          onClick={() => messageEndRef.current?.scrollIntoView({ behavior: "smooth" })}
          className="absolute bottom-24 right-5 sm:right-8 bg-cyan-600 hover:bg-cyan-500 text-white p-2.5 rounded-full shadow-2xl z-[70] transition-all opacity-90 hover:opacity-100"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
      )}

      {!isSelecting && <MessageInput />}
      
      {showProfileInfo && (
        <UserProfilePanel 
          onClose={() => setShowProfileInfo(false)} 
          onImageClick={(imgUrl) => setModalImage(imgUrl)}
        />
      )}

      {/* Image viewer modal */}
      <ImageModal imageUrl={modalImage} onClose={() => setModalImage(null)} />
      
      {/* Forward Modal */}
      {showForwardModal && (
        <ForwardModal 
          messagesToForward={
            selectedMessageIds.length > 0 
              ? messages.filter(m => selectedMessageIds.includes(m._id))
              : activeMenuMsg ? [activeMenuMsg] : []
          } 
          onClose={() => setShowForwardModal(false)}
          onForwardComplete={() => {
            setShowForwardModal(false);
            setIsSelecting(false);
            setSelectedMessageIds([]);
          }}
        />
      )}
    </div>
  );
}

export default ChatContainer;
