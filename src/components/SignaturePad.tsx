import React, { useRef, useState, useEffect } from 'react';
import { PenTool, RotateCcw, Upload, Check, Trash2 } from 'lucide-react';

interface SignaturePadProps {
  signatureUrl: string;
  onChange: (url: string) => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ signatureUrl, onChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [mode, setMode] = useState<'draw' | 'upload'>('draw');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-dpi crisp rendering
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [mode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      // Prevent scrolling when drawing on touch screens
      e.preventDefault();
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onChange(dataUrl);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setHasDrawn(false);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 450;
        const scale = Math.min(MAX_WIDTH / img.width, 1);
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          onChange(canvas.toDataURL('image/jpeg', 0.85));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bhagwa-texture-soft border border-[#e9bd92] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <div>
          <h4 className="text-sm sm:text-base font-bold text-[#5c1d05] flex items-center gap-1.5">
            <PenTool className="w-4 h-4 text-[#c2410c]" />
            अर्जदाराची स्वाक्षरी
          </h4>
          <p className="text-xs sm:text-sm text-[#431407]">
            खालील बॉक्समध्ये बोटाने / माऊसने स्वाक्षरी करा किंवा स्वाक्षरीचा फोटो अपलोड करा.
          </p>
        </div>

        {/* Toggle Mode */}
        <div className="flex items-center gap-1 bg-[#ffedd5] p-0.5 rounded-lg text-xs border border-[#df9c5c]">
          <button
            type="button"
            onClick={() => setMode('draw')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
              mode === 'draw' ? 'bg-white text-[#5c1d05] shadow-xs' : 'text-[#9a3412] hover:text-[#431407]'
            }`}
          >
            स्वाक्षरी करा
          </button>
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
              mode === 'upload' ? 'bg-white text-[#5c1d05] shadow-xs' : 'text-[#9a3412] hover:text-[#431407]'
            }`}
          >
            अपलोड करा
          </button>
        </div>
      </div>

      {mode === 'draw' ? (
        <div>
          <div className="relative border-2 border-dashed border-[#d97724] rounded-xl bg-white overflow-hidden shadow-2xs">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-32 cursor-crosshair touch-none"
            />
            {!hasDrawn && !signatureUrl && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-sm text-[#a1785a]">
                येथे स्वाक्षरी करा
              </div>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between text-xs sm:text-sm">
            <span className="text-[#431407]">
              {signatureUrl ? (
                <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                  <Check className="w-4 h-4" /> स्वाक्षरी नोंदवली गेली आहे
                </span>
              ) : (
                'माउस अथवा बोटाने स्वाक्षरी पूर्ण करा'
              )}
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1 px-3 py-1 bg-[#ffedd5] hover:bg-[#fed7aa] text-[#5c1d05] rounded-md transition-colors font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> पुसून टाका
            </button>
          </div>
        </div>
      ) : (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          <div className="border-2 border-dashed border-[#d97724] rounded-xl p-4 bg-white text-center">
            {signatureUrl ? (
              <div className="space-y-2">
                <img
                  src={signatureUrl}
                  alt="अर्जदार स्वाक्षरी"
                  className="max-h-24 max-w-xs mx-auto object-contain border border-[#e7b587] p-1 rounded bg-[#fff8f0]"
                />
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-medium cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> स्वाक्षरी काढा
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-[#431407]">
                  कागदावर स्वाक्षरी करून त्याचा स्पष्ट फोटो काढून येथे अपलोड करा.
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bhagwa-texture-deep hover:brightness-95 text-white rounded-lg text-sm font-bold shadow-xs transition-all cursor-pointer border border-[#9a3412]"
                >
                  <Upload className="w-4 h-4" /> स्वाक्षरी फाईल निवडा
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
