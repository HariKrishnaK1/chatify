import { MessageCircleIcon } from "lucide-react";

const NoConversationPlaceholder = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center p-6 bg-slate-900/30">
      <div className="relative mb-10 w-32 h-32 flex items-center justify-center">
        {/* Animated pulses */}
        <div className="absolute inset-0 bg-cyan-500/20 rounded-full animate-ping opacity-75"></div>
        <div className="absolute inset-2 bg-cyan-400/20 rounded-full animate-pulse"></div>
        <div className="relative z-10 w-20 h-20 bg-gradient-to-tr from-cyan-500 to-cyan-400 rounded-full flex items-center justify-center shadow-2xl shadow-cyan-500/40">
          <MessageCircleIcon className="w-10 h-10 text-white" />
        </div>
      </div>
      <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-400 mb-4 tracking-tight">
        Welcome to Chatify
      </h3>
      <p className="text-slate-400 max-w-sm text-sm sm:text-base leading-relaxed">
        Select a contact from the sidebar to spark a conversation or dive back into your historical threads. The world is waiting!
      </p>
    </div>
  );
};

export default NoConversationPlaceholder;
