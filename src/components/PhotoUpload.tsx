import React, { useRef } from 'react';
import { Camera, Upload, Trash2, Image as ImageIcon } from 'lucide-react';

interface PhotoUploadProps {
  photoUrl: string;
  onChange: (photoUrl: string) => void;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ photoUrl, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = React.useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');

    if (!file.type.startsWith('image/')) {
      setUploadError('कृपया केवळ फोटो फाईल निवडा.');
      return;
    }

    // Read and resize image through canvas for clean base64 storage
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const scale = Math.min(MAX_WIDTH / img.width, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          onChange(compressedDataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 bg-sky-50/50 border border-sky-200 rounded-xl p-4">
      {/* Photo frame */}
      <div className="w-32 h-40 border-2 border-dashed border-sky-400 rounded-lg overflow-hidden bg-white flex flex-col items-center justify-center relative shadow-2xs group">
        {photoUrl ? (
          <>
            <img
              src={photoUrl}
              alt="अर्जदार पासपोर्ट फोटो"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full opacity-90 hover:opacity-100 shadow transition-opacity"
              title="फोटो हटवा"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <div className="text-center p-3 text-slate-400">
            <ImageIcon className="w-8 h-8 mx-auto mb-1 text-sky-600" />
            <span className="text-xs font-semibold text-slate-600 block">पासपोर्ट फोटो</span>
          </div>
        )}
      </div>

      {/* Upload Controls */}
      <div className="flex-1 space-y-2 text-center sm:text-left">
        <div>
          <h4 className="text-base font-bold text-[#0f294a]">अर्जदाराचा पासपोर्ट साईझ फोटो</h4>
          <p className="text-sm text-slate-600 mt-0.5">
            कृपया आपला स्पष्ट चेहरा असलेला अलिकडचा पासपोर्ट फोटो अपलोड करा.
          </p>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          id="photo-upload-input"
        />

        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#133b6e] hover:bg-[#0d2c54] text-white rounded-lg text-sm font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            फोटो निवडा
          </button>

          {photoUrl && (
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex items-center gap-1 px-3 py-2 bg-sky-100 hover:bg-sky-200 text-[#0f294a] rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              काढून टाका
            </button>
          )}
        </div>

        {uploadError && (
          <p className="text-xs text-rose-700 font-bold">{uploadError}</p>
        )}
      </div>
    </div>
  );
};
