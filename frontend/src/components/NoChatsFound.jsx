import { MessageCircleIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

function NoChatsFound() {
  const { setActiveTab } = useChatStore();

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <div className="absolute inset-0 bg-slate-700/50 rounded-full animate-[spin_4s_linear_infinite] border-t-2 border-cyan-500/50"></div>
        <div className="relative z-10 w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center shadow-inner">
          <MessageCircleIcon className="w-8 h-8 text-cyan-400" />
        </div>
      </div>
      <div className="space-y-2">
        <h4 className="text-slate-200 font-semibold text-lg">No active messages</h4>
        <p className="text-slate-400 text-sm px-6 max-w-[250px] mx-auto leading-relaxed">
          Your inbox is perfectly quiet. Break the ice and say hello!
        </p>
      </div>
      <button
        onClick={() => setActiveTab("contacts")}
        className="px-6 py-2.5 mt-2 text-sm font-medium text-white bg-cyan-600 rounded-full hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
      >
        Discover Contacts
      </button>
    </div>
  );
}
export default NoChatsFound;