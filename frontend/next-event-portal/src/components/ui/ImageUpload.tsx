/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onUpload?: (file: File) => void;
  onRemove?: () => void;
  value?: string | null;
  className?: string;
  label?: string;
  description?: string;
  error?: string;
  disabled?: boolean;
}

export function ImageUpload({
  onUpload,
  onRemove,
  value,
  className,
  label = 'Upload Image',
  description = 'Drag and drop or click to upload (max. 5MB)',
  error,
  disabled = false
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [uploadError, setUploadError] = useState<string | null>(error || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (disabled) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upward a valid image file');
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size should be less than 5MB');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      setIsUploading(false);
      onUpload?.(file);
    };
    reader.readAsDataURL(file);
  }, [onUpload, disabled]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const removeImage = () => {
    setPreview(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onRemove?.();
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {label}
        </label>
      )}

      <div
        className={cn(
          "relative group transition-all duration-300 rounded-sm border-2 border-dashed h-[140px] overflow-hidden",
          isDragging 
            ? "border-[#1e3a5f] bg-[#1e3a5f]/5" 
            : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300",
          disabled && "opacity-50 cursor-not-allowed",
          preview && "border-solid border-[#1e3a5f]"
        )}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !preview && !disabled && fileInputRef.current?.click()}
      >
        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 w-full h-full"
            >
              <img 
                src={preview} 
                alt="Upload preview" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="bg-white text-slate-900 p-2 rounded-full hover:scale-110 transition-transform shadow-lg"
                >
                  <Upload className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage();
                  }}
                  className="bg-white text-red-600 p-2 rounded-full hover:scale-110 transition-transform shadow-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="absolute top-2 right-2 flex gap-1">
                <div className="bg-[#1e3a5f] text-white px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="h-3 w-3" />
                  <span className="text-[9px] font-bold uppercase">Uploaded</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full flex flex-col items-center justify-center p-6 text-center cursor-pointer"
            >
              <div className={cn(
                "w-12 h-12 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-4 transition-transform duration-500",
                isDragging && "scale-110"
              )}>
                {isUploading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <Upload className="h-6 w-6 text-[#1e3a5f]" />
                  </motion.div>
                ) : (
                  <ImageIcon className="h-6 w-6 text-slate-400 group-hover:text-[#1e3a5f]" />
                )}
              </div>
              
              <div className="space-y-1">
                <p className="text-[11px] font-black uppercase tracking-widest text-[#1e3a5f]">
                  {isDragging ? 'Drop it here' : 'Drop your image'}
                </p>
                <p className="text-[10px] text-slate-400 font-medium tracking-tight">
                  {description}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={onInputChange}
          disabled={disabled}
        />
      </div>

      {(uploadError || error) && (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-red-500"
        >
          <AlertCircle className="h-3 w-3" />
          <span className="text-[10px] font-bold uppercase tracking-tight">{uploadError || error}</span>
        </motion.div>
      )}
    </div>
  );
}


