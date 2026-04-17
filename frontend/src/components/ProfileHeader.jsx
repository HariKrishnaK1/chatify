import { VolumeOffIcon, Volume2Icon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

function ProfileHeader({ onProfileClick }) {
  const { authUser } = useAuthStore();
  const { isSoundEnabled, toggleSound } = useChatStore();

  return (
    <div className="p-6 border-b border-slate-700/50 shrink-0 h-20 flex flex-col justify-center">
      <div className="flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer hover:bg-slate-700/30 p-2 rounded-lg transition-colors -ml-2 select-none"
          onClick={onProfileClick}
        >
          {/* AVATAR */}
          <div className="avatar online">
            <div className="w-10 rounded-full overflow-hidden ring-2 ring-slate-700/30 group">
              <img
                src={authUser.profilePic || "/avatar.png"}
                alt="User image"
                className="size-full object-cover"
              />
            </div>
          </div>

          {/* USERNAME & ONLINE TEXT */}
          <div>
            <h3 className="text-slate-200 font-medium text-base max-w-[150px] truncate">
              {authUser.fullName}
            </h3>
            <p className="text-slate-400 text-xs">Online</p>
          </div>
        </div>

        {/*   BUTTONS */}
        <div className="flex gap-4 items-center pl-2">
          {/* SOUND TOGGLE BTN */}
          <button
            className="text-slate-400 hover:text-slate-200 transition-colors p-2 hover:bg-slate-700/50 rounded-full"
            onClick={() => {
              //play click sound before toggling
              mouseClickSound.currentTime = 0; //reset to start
              mouseClickSound
                .play()
                .catch((error) => console.log("Audio play failed:", error));
              toggleSound();
            }}
          >
            {isSoundEnabled ? (
              <Volume2Icon className="size-5" />
            ) : (
              <VolumeOffIcon className="size-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;
