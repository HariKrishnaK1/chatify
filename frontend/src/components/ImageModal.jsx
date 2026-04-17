import { XIcon } from "lucide-react";

function ImageModal({ imageUrl, onClose }) {
  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity">
      <div className="relative max-w-5xl w-full mx-4 flex items-center justify-center h-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-full transition-colors z-[60]"
        >
          <XIcon className="w-6 h-6" />
        </button>
        <img
          src={imageUrl}
          alt="Enlarged"
          className="max-h-[90vh] max-w-full object-contain rounded-lg shadow-2xl"
        />
      </div>
    </div>
  );
}

export default ImageModal;
