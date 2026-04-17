import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { XIcon, MailIcon, CalendarIcon } from "lucide-react";

function UserProfilePanel({ onClose, onImageClick }) {
  const { selectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  if (!selectedUser) return null;
  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="w-80 bg-slate-800/95 backdrop-blur-xl border-l border-slate-700/50 flex flex-col h-full right-0 top-0 absolute z-40 transform transition-transform duration-300">
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-800/50">
        <h3 className="font-medium text-slate-200">Contact Info</h3>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-700 text-slate-400 transition-colors">
          <XIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col items-center p-6 border-b border-slate-700/50">
        <div 
          className="w-32 h-32 rounded-full overflow-hidden mb-4 cursor-pointer ring-4 ring-slate-700/50 hover:ring-cyan-500/50 transition-all relative group"
          onClick={() => onImageClick(selectedUser.profilePic || "/avatar.png")}
        >
          <img
            src={selectedUser.profilePic || "/avatar.png"}
            alt={selectedUser.fullName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center text-xs text-white">
            View Image
          </div>
        </div>
        <h2 className="text-xl font-semibold text-slate-200">{selectedUser.fullName}</h2>
        <p className={`text-sm ${isOnline ? "text-cyan-400" : "text-slate-400"}`}>
          {isOnline ? "Online" : "Offline"}
        </p>
      </div>
      <div className="p-6 space-y-6">
        <div>
          <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Bio</h4>
          <div className="text-slate-200 bg-slate-900/30 p-4 rounded-lg border border-slate-700/30 text-sm leading-relaxed">
            {selectedUser.about || "No bio available."}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Email</h4>
          <div className="flex items-center gap-3 text-slate-300 bg-slate-900/30 p-3 rounded-lg border border-slate-700/30">
            <MailIcon className="w-5 h-5 text-cyan-500/70" />
            <span className="truncate">{selectedUser.email}</span>
          </div>
        </div>
        
        <div>
          <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Joined</h4>
          <div className="flex items-center gap-3 text-slate-300 bg-slate-900/30 p-3 rounded-lg border border-slate-700/30">
            <CalendarIcon className="w-5 h-5 text-cyan-500/70" />
            <span>{new Date(selectedUser.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfilePanel;
