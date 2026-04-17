import { useChatStore } from "../store/useChatStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";
import MyProfilePanel from "../components/MyProfilePanel";
import { useState } from "react";
import { Search } from "lucide-react";

function ChatPage() {
  const { activeTab, selectedUser, searchTerm, setSearchTerm } = useChatStore();
  const [showMyProfile, setShowMyProfile] = useState(false);
  return (
    <div className="relative w-full max-w-6xl h-screen sm:h-[calc(100vh-6rem)] sm:min-h-[700px] shadow-2xl rounded-none sm:rounded-2xl overflow-hidden">
      <BorderAnimatedContainer>
        {/* LEFT SIDE */}
        <div className={`w-full md:w-80 bg-slate-800/50 backdrop-blur-sm flex-col relative transition-all duration-300 ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
          <ProfileHeader onProfileClick={() => setShowMyProfile(true)} />
          <ActiveTabSwitch />

          <div className="px-4 pt-4 pb-2">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/40 border border-slate-700/50 rounded-full py-2 pl-9 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-2">
            {activeTab === "chats" ? <ChatsList /> : <ContactList />}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className={`flex-1 flex-col bg-slate-900/50 backdrop-blur-sm transition-all duration-300 ${selectedUser ? 'flex' : 'hidden md:flex'}`}>
          {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
        </div>

        {showMyProfile && (
          <MyProfilePanel onClose={() => setShowMyProfile(false)} />
        )}
      </BorderAnimatedContainer>
    </div>
  );
}

export default ChatPage;
