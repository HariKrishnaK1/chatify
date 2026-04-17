import { useEffect } from "react";
import { Search } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";

function ChatsList() {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser, typingUsers, searchTerm } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();
  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading && chats.length === 0) return <UsersLoadingSkeleton />;
  
  const filteredChats = chats.filter(chat => 
    chat.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (chats.length === 0) return <NoChatsFound />;
  
  if (filteredChats.length === 0 && searchTerm) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-800/20 rounded-xl border border-slate-700/30 border-dashed">
        <Search className="w-10 h-10 text-slate-600 mb-3 opacity-50" />
        <p className="text-slate-400 text-sm font-medium">No results found for "{searchTerm}"</p>
        <p className="text-slate-500 text-xs mt-1">Try a different name or email</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {filteredChats.map((chat) => (
        <div
          key={chat._id}
          className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
          onClick={() => setSelectedUser(chat)}
        >
          <div className="flex items-center gap-3">
            <div
              className={`avatar ${
                onlineUsers.includes(chat._id) ? "online" : ""
              }`}
            >
              <div className="size-12 rounded-full">
                <img
                  src={chat.profilePic || "/avatar.png"}
                  alt={chat.fullName}
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-slate-200 font-medium truncate">
                {chat.fullName}
              </h4>
              {typingUsers.includes(chat._id) ? (
                <p className="text-sm font-medium text-green-400 animate-pulse mt-0.5">
                  Typing...
                </p>
              ) : chat.lastMessage && (
                <p className={`text-sm truncate mt-0.5 ${chat.lastMessage.read || chat.lastMessage.senderId !== authUser._id ? "text-slate-400" : "text-slate-300 font-medium"}`}>
                  {chat.lastMessage.senderId === authUser._id && "You: "}
                  {chat.lastMessage.image ? "📷 Photo" : chat.lastMessage.text}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ChatsList;
