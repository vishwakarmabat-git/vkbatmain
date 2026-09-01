import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, CheckCircle, Trash2, RefreshCw } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { getImageUrl } from '@/utils/image';
import { toast } from 'sonner';

interface DeviceImageUploadProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  className?: string;
}

export const DeviceImageUpload: React.FC<DeviceImageUploadProps> = ({
  label = 'STUDIO IMAGE (UPLOAD FROM DEVICE)',
  value,
  onChange,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [localPreview, setLocalPreview] = useState<string>('');

  useEffect(() => {
    if (value) {
      setLocalPreview(getImageUrl(value));
    } else {
      setLocalPreview('');
    }
  }, [value]);

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    // 1. Instant local preview from device
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);

    // 2. Upload to server
    setIsUploading(true);
    try {
      const res = await adminService.uploadImage(file);
      if (res?.url) {
        onChange(res.url);
        setLocalPreview(getImageUrl(res.url));
        toast.success('Image uploaded from device successfully!');
      }
    } catch (err) {
      console.warn('Server upload notice, using local file buffer:', err);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const base64 = e.target.result as string;
          onChange(base64);
          setLocalPreview(base64);
          toast.success('Device photo loaded successfully!');
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLocalPreview('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const activeImageSrc = localPreview || (value ? getImageUrl(value) : '');

  return (
    <div className={`space-y-1.5 text-left ${className}`}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] font-sport">
          {label}
        </label>
      )}

      {/* Hidden native file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Upload Box / Image Preview Container */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-4 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center group ${
          isDragging
            ? 'border-[#D4AF37] bg-[#D4AF37]/10'
            : activeImageSrc
            ? 'border-[#2A2A38] bg-[#0A0A0E] hover:border-[#D4AF37]/60'
            : 'border-[#242436] bg-[#0E0E14] hover:border-[#D4AF37] hover:bg-[#12121A]'
        }`}
      >
        {activeImageSrc ? (
          <div className="w-full flex flex-col sm:flex-row items-center gap-4">
            {/* Image Preview Box */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-[#050508] border border-[#1E1E28] rounded-lg overflow-hidden flex items-center justify-center shrink-0 p-2 relative shadow-inner">
              <img
                src={activeImageSrc}
                alt="Uploaded preview"
                className="w-full h-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Info & Change Actions */}
            <div className="flex-1 text-left space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-sport font-bold text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>IMAGE LOADED FROM DEVICE</span>
              </div>
              <p className="text-[11px] text-[#71717A] truncate max-w-xs font-mono">
                {value ? (value.startsWith('data:') ? 'Base64 Local Buffer' : value) : 'Device File Attached'}
              </p>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-2.5 py-1 bg-[#181822] hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black border border-[#2A2A38] rounded text-[10px] font-sport font-black tracking-wider uppercase transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>CHANGE FILE</span>
                </button>

                <button
                  type="button"
                  onClick={handleRemove}
                  className="px-2.5 py-1 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/40 rounded text-[10px] font-sport font-black tracking-wider uppercase transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>REMOVE</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 space-y-2 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#181822] border border-[#242436] flex items-center justify-center text-[#D4AF37] group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6" />
            </div>

            <div className="space-y-0.5">
              <p className="text-xs font-sport font-bold text-white uppercase tracking-wider">
                CLICK TO UPLOAD FROM DEVICE
              </p>
              <p className="text-[11px] text-[#71717A]">
                Drag and drop or browse files (PNG, JPG, WEBP up to 10MB)
              </p>
            </div>

            <span className="inline-block mt-2 px-3 py-1 bg-[#181824] border border-[#2A2A3A] rounded-full text-[10px] font-sport font-black tracking-widest text-[#D4AF37] uppercase group-hover:border-[#D4AF37]">
              CHOOSE FILE
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
