import { useState, useRef, useEffect } from "react";
import useKeyboardSound from "../hooks/useKeyboardSound";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import { ImageIcon, XIcon, SendIcon, X, SmileIcon } from "lucide-react";
import EmojiPicker from 'emoji-picker-react';

function MessageInput() {
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const { sendMessage, isSoundEnabled, selectedUser, replyingTo, setReplyingTo, drafts, setDraft } = useChatStore();
  const { socket, authUser } = useAuthStore();
  
  // Load draft when user changes
  useEffect(() => {
    if (selectedUser?._id) {
       setText(drafts[selectedUser._id] || "");
       setShowEmojiPicker(false);
    }
  }, [selectedUser?._id]);

  // Click outside to close emoji picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Save draft whenever text changes
  const updateLocalText = (val) => {
     setText(val);
     if (selectedUser?._id) {
        setDraft(selectedUser._id, val);
     }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    if (isSoundEnabled) playRandomKeyStrokeSound();

    sendMessage({
      text: text.trim(),
      image: imagePreview,
    });

    // clear typing & drafts when sent
    clearTimeout(typingTimeoutRef.current);
    setIsTyping(false);
    socket?.emit("stopTyping", { receiverId: selectedUser._id });

    setText("");
    setDraft(selectedUser._id, "");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleTyping = (e) => {
    updateLocalText(e.target.value);
    if (isSoundEnabled) playRandomKeyStrokeSound();

    if (!isTyping) {
      setIsTyping(true);
      socket?.emit("typing", { receiverId: selectedUser._id });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket?.emit("stopTyping", { receiverId: selectedUser._id });
    }, 2000);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEmojiClick = (emojiObject) => {
    updateLocalText(text + emojiObject.emoji);
  };

  return (
    <div className="p-4 border-t border-slate-700/50 relative">
      {replyingTo && (
        <div className="max-w-3xl mx-auto mb-3 flex items-center justify-between bg-slate-800/80 border border-slate-700/50 rounded-lg p-2.5">
          <div className="flex flex-col overflow-hidden border-l-4 border-cyan-500 pl-3">
             <span className="text-xs font-semibold text-cyan-400 mb-0.5">Replying to {replyingTo.senderId === authUser?._id ? "yourself" : selectedUser.fullName}</span>
             <span className="text-sm text-slate-300 truncate">{replyingTo.text || "Photo"}</span>
          </div>
          <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-white p-1" type="button">
             <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {imagePreview && (
        <div className="max-w-3xl mx-auto mb-3 flex items-center">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-slate-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-slate-700"
              type="button"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSendMessage}
        className="max-w-3xl mx-auto flex items-center space-x-2 sm:space-x-4 h-12"
      >
        <div className="relative h-full" ref={emojiPickerRef}>
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className={`bg-slate-800/50 text-slate-400 hover:text-slate-200 rounded-lg px-3 transition-colors h-full flex items-center justify-center ${
              showEmojiPicker ? "text-cyan-400" : ""
            }`}
          >
            <SmileIcon className="w-5 h-5" />
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-14 left-0 z-[100] shadow-2xl">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                theme="dark"
                searchPosition="none"
                skinTonesDisabled
              />
            </div>
          )}
        </div>

        <input
          type="text"
          value={text}
          onChange={handleTyping}
          className="flex-1 h-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-shadow"
          placeholder="Type your message..."
        />

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`bg-slate-800/50 text-slate-400 hover:text-slate-200 rounded-lg px-3 transition-colors h-full flex items-center justify-center ${
            imagePreview ? "text-cyan-400" : ""
          }`}
        >
          <ImageIcon className="w-5 h-5" />
        </button>
        
        <button
          type="submit"
          disabled={!text.trim() && !imagePreview}
          className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg px-4 h-full font-medium hover:from-cyan-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}

export default MessageInput;
