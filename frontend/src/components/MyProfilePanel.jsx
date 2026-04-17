import { useState, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { XIcon, MailIcon, CalendarIcon, LogOutIcon, CameraIcon, UserIcon, CheckIcon } from "lucide-react";

function MyProfilePanel({ onClose }) {
  const { authUser, logout, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const fileInputRef = useRef(null);
  const [aboutText, setAboutText] = useState(authUser.about || "");
  const [isUpdatingBio, setIsUpdatingBio] = useState(false);

  if (!authUser) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  const currentImage = selectedImg || authUser.profilePic || "/avatar.png";

  return (
    <>
      <div className="w-80 bg-slate-800/95 backdrop-blur-xl border-r border-slate-700/50 flex flex-col h-full left-0 top-0 absolute z-[50] transform transition-transform duration-300 shadow-2xl">
        <div className="flex items-center gap-4 p-4 border-b border-slate-700/50 bg-slate-800/50">
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-700 text-slate-400 transition-colors">
            <XIcon className="w-5 h-5" />
          </button>
          <h3 className="font-semibold text-slate-200">Profile</h3>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col items-center p-8 bg-slate-800/20">
            <div 
              className="w-36 h-36 rounded-full overflow-hidden mb-6 cursor-pointer ring-4 ring-slate-700/50 hover:ring-cyan-500/50 transition-all relative group shadow-xl"
              onClick={() => setShowImageModal(true)}
            >
              <img
                src={currentImage}
                alt={authUser.fullName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-opacity flex-col gap-2">
                 <CameraIcon className="w-8 h-8 text-white/80" />
                 <span className="text-white/90 text-[10px] font-medium px-2 text-center uppercase tracking-wider">Change Photo</span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h4 className="text-xs font-medium text-cyan-500/70 uppercase tracking-wider mb-2">Your Name</h4>
              <div className="flex items-center text-slate-200 font-medium bg-slate-900/30 p-3.5 rounded-lg border border-slate-700/30">
                <span className="truncate text-lg">{authUser.fullName}</span>
              </div>
              <p className="text-xs text-slate-500 mt-2 italic px-1">This is your public name that your contacts will see.</p>
            </div>

            <div>
              <h4 className="text-xs font-medium text-cyan-500/70 uppercase tracking-wider mb-2">About (Email)</h4>
              <div className="flex items-center gap-3 text-slate-400 bg-slate-900/10 p-3.5 rounded-lg border border-slate-700/20">
                <MailIcon className="w-4 h-4" />
                <span className="truncate text-sm">{authUser.email}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium text-cyan-500/70 uppercase tracking-wider mb-2">Bio</h4>
              <div className="relative group">
                <textarea
                  value={aboutText}
                  onChange={(e) => setAboutText(e.target.value)}
                  maxLength={150}
                  className="w-full bg-slate-900/30 text-slate-200 p-3.5 rounded-lg border border-slate-700/30 focus:border-cyan-500/50 focus:outline-none transition-all resize-none h-24 text-sm"
                  placeholder="Tell us about yourself..."
                />
                <button
                  onClick={async () => {
                    setIsUpdatingBio(true);
                    await updateProfile({ about: aboutText });
                    setIsUpdatingBio(false);
                  }}
                  disabled={isUpdatingBio || aboutText === authUser.about}
                  className="absolute bottom-3 right-3 p-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white rounded-md transition-all shadow-lg shadow-cyan-900/20"
                >
                  {isUpdatingBio ? <span className="loading loading-spinner loading-xs"></span> : <CheckIcon className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 text-right">{aboutText.length}/150 characters</p>
            </div>

            <div>
              <h4 className="text-xs font-medium text-cyan-500/70 uppercase tracking-wider mb-2">Joined</h4>
              <div className="flex items-center gap-3 text-slate-300 bg-slate-900/30 p-3.5 rounded-lg border border-slate-700/30">
                <CalendarIcon className="w-5 h-5 text-slate-400" />
                <span>{new Date(authUser.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
            
            {/* Logout container pinned towards bottom */}
            <div className="pt-6 border-t border-slate-700/50 mt-8">
              <button 
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 hover:bg-red-500/10 text-red-500 p-3 rounded-lg font-medium transition-colors border border-transparent hover:border-red-500/20"
              >
                <LogOutIcon className="w-5 h-5" /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {showImageModal && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm transition-opacity">
           <div className="relative max-w-5xl w-full mx-4 flex flex-col items-center justify-center h-full gap-4">
             <div className="flex gap-4 absolute top-4 right-4 z-50">
               <button
                 onClick={() => fileInputRef.current?.click()}
                 className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full transition-colors border border-slate-600 shadow-lg font-medium"
               >
                 <CameraIcon className="w-5 h-5" /> Change Photo
               </button>
               <button
                 onClick={() => setShowImageModal(false)}
                 className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full transition-colors border border-slate-600 shadow-lg"
               >
                 <XIcon className="w-6 h-6" />
               </button>
             </div>
             
             <img
               src={currentImage}
               alt="Enlarged Profile"
               className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl ring-4 ring-slate-800"
             />
             <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={(e) => {
                  handleImageUpload(e);
                  setShowImageModal(false);
                }}
                className="hidden"
             />
           </div>
         </div>
      )}
    </>
  );
}

export default MyProfilePanel;
