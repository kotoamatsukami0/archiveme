"use client";

import React, { useRef, useState } from "react";
import { Camera, ImagePlus, Upload, X } from "lucide-react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilesSelected: (files: File[]) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onFilesSelected,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
      onClose();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Upload Media"
        className="relative z-10 w-full sm:max-w-md bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-slate-200/80 p-5 pb-8 sm:pb-5 animate-in slide-in-from-bottom"
      >
        {/* Drag handle */}
        <div className="flex justify-center sm:hidden pb-3">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Upload Media</h3>
            <p className="text-xs text-slate-500">Photos & Videos</p>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden inputs */}
        {/* Gallery / Multi-file picker */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Camera capture picker */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*,video/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Action Buttons with 48px+ touch targets */}
        <div className="mt-4 space-y-3">
          {/* Mobile Camera Option */}
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="w-full flex items-center gap-3.5 px-4 min-h-[52px] rounded-2xl bg-indigo-50/70 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-950 font-medium text-sm transition"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="block font-semibold">Take Photo or Video</span>
              <span className="block text-[11px] text-indigo-700/80">Use device camera</span>
            </div>
          </button>

          {/* Photo Library / Files */}
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="w-full flex items-center gap-3.5 px-4 min-h-[52px] rounded-2xl bg-slate-100 hover:bg-slate-200/80 active:bg-slate-300/80 text-slate-900 font-medium text-sm transition"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <ImagePlus className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="block font-semibold">Choose from Library</span>
              <span className="block text-[11px] text-slate-500">Select multiple photos or videos</span>
            </div>
          </button>

          {/* Desktop Drag and Drop area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => galleryInputRef.current?.click()}
            className={`hidden sm:flex flex-col items-center justify-center p-6 mt-2 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${
              isDragging
                ? "border-indigo-500 bg-indigo-50/50"
                : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
            }`}
          >
            <Upload className="w-7 h-7 text-slate-400 mb-1.5" />
            <p className="text-xs font-semibold text-slate-700">
              Drag & drop photos or videos here
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">or click to browse files</p>
          </div>
        </div>
      </div>
    </div>
  );
};
