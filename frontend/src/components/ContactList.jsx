import { useEffect } from "react";
import { Search } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useAuthStore } from "../store/useAuthStore";
function ContactList() {
  const { getAllContacts, allContacts, setSelectedUser, isUsersLoading, searchTerm } =
    useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  if (isUsersLoading && allContacts.length === 0) return <UsersLoadingSkeleton />;

  const sortedContacts = [...allContacts].sort((a, b) => 
    a.fullName.localeCompare(b.fullName)
  );

  const filteredContacts = sortedContacts.filter(contact => 
    contact.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredContacts.length === 0 && searchTerm) {
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
      {filteredContacts.map((contact) => (
        <div
          key={contact._id}
          className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
          onClick={() => setSelectedUser(contact)}
        >
          <div className="flex items-center gap-3">
            <div
              className={`avatar ${
                onlineUsers.includes(contact._id) ? "online" : ""
              }`}
            >
              <div className="size-12 rounded-full">
                <img src={contact.profilePic || "/avatar.png"} />
              </div>
            </div>
            <h4 className="text-slate-200 font-medium truncate">
              {contact.fullName}
            </h4>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ContactList;
