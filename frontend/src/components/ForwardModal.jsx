import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { XIcon, SendIcon } from "lucide-react";

function ForwardModal({ messagesToForward, onClose, onForwardComplete }) {
  const { allContacts, getAllContacts, forwardMessages } = useChatStore();
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isForwarding, setIsForwarding] = useState(false);

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  const filteredContacts = allContacts.filter((c) =>
    c.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleContact = (contactId) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId]
    );
  };

  const handleForward = async () => {
    if (selectedContacts.length === 0) return;
    setIsForwarding(true);
    await forwardMessages(messagesToForward, selectedContacts);
    setIsForwarding(false);
    onForwardComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700/50 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/80">
          <h2 className="text-lg font-semibold text-slate-200">Forward to...</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-700/50">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredContacts.map((contact) => (
            <div
              key={contact._id}
              onClick={() => toggleContact(contact._id)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700/50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedContacts.includes(contact._id)}
                readOnly
                className="w-5 h-5 rounded border-slate-500 text-cyan-500 focus:ring-cyan-500/50 bg-slate-900"
              />
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                <img
                  src={contact.profilePic || "/avatar.png"}
                  alt={contact.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-slate-200 font-medium truncate">{contact.fullName}</span>
            </div>
          ))}
          {filteredContacts.length === 0 && (
            <div className="text-center p-6 text-slate-500">No contacts found.</div>
          )}
        </div>

        <div className="p-4 border-t border-slate-700/50 bg-slate-800/80 flex justify-end">
          <button
            onClick={handleForward}
            disabled={selectedContacts.length === 0 || isForwarding}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
              selectedContacts.length > 0 && !isForwarding
                ? "bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/20"
                : "bg-slate-700 text-slate-400 cursor-not-allowed"
            }`}
          >
            {isForwarding ? "Sending..." : "Forward"}
            {!isForwarding && <SendIcon className="w-4 h-4 ml-1" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForwardModal;
