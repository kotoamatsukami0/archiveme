"use client";

import React, { useRef, useState } from "react";
import {
  Camera,
  ImagePlus,
  Upload,
  X,
  FileVideo,
  FileImage,
  ArrowRight,
  Plus,
  Trash2,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

export interface SelectedFileItem {
  id: string;
  file: File;
  name: string;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilesSelected: (files: SelectedFileItem[]) => void;
}

// Helper to check if a filename is purely numbers from Android/Google Photos
function isNumericFilename(name: string): boolean {
  const baseName = name.replace(/\.[^/.]+$/, "");
  return /^\d+$/.test(baseName) || /^10000\d+$/.test(baseName);
}

// Generate smart default name if device gives random numbers like 1000036026.mp4
function getSmartDefaultName(file: File): string {
  if (!isNumericFilename(file.name)) {
    return file.name;
  }

  const ext = file.name.split(".").pop() || "";
  const isVideo = file.type.startsWith("video/");
  const dateStr = new Date(file.lastModified || Date.now()).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return `${isVideo ? "Video" : "Foto"} - ${dateStr}.${ext}`;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onFilesSelected,
}) => {
  const [selectedItems, setSelectedItems] = useState<SelectedFileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setSelectedItems([]);
    onClose();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const addFiles = (files: File[]) => {
    const newItems: SelectedFileItem[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      name: getSmartDefaultName(file),
    }));
    setSelectedItems((prev) => [...prev, ...newItems]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
      e.target.value = ""; // reset for re-selection
    }
  };

  const updateItemName = (id: string, newName: string) => {
    setSelectedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name: newName } : item))
    );
  };

  const removeItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleStartUpload = () => {
    if (selectedItems.length === 0) return;
    onFilesSelected(selectedItems);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Upload Media"
        className="relative z-10 w-full sm:max-w-lg bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-slate-200/80 p-5 pb-8 sm:pb-6 animate-in slide-in-from-bottom max-h-[88vh] flex flex-col"
      >
        {/* Drag handle for mobile */}
        <div className="flex justify-center sm:hidden pb-3">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {selectedItems.length > 0
                ? `Beri Nama & Upload (${selectedItems.length})`
                : "Upload Media"}
            </h3>
            <p className="text-xs text-slate-500">
              {selectedItems.length > 0
                ? "Bisa ubah nama file sebelum diunggah"
                : "Foto & Video dari perangkat"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden inputs */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*,video/*"
          capture="environment"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Step 1: No files selected yet -> Show Pickers */}
        {selectedItems.length === 0 ? (
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
                <span className="block font-semibold">Ambil Foto atau Video</span>
                <span className="block text-[11px] text-indigo-700/80">
                  Gunakan kamera langsung
                </span>
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
                <span className="block font-semibold">Pilih dari Galeri / File</span>
                <span className="block text-[11px] text-slate-500">
                  Pilih foto atau video dari perangkat
                </span>
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
                Tarik & letakkan foto atau video di sini
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">atau klik untuk memilih file</p>
            </div>
          </div>
        ) : (
          /* Step 2: Files selected -> Show Editable Name List */
          <div className="flex-1 flex flex-col min-h-0 mt-3">
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 py-1 no-scrollbar">
              {selectedItems.map((item) => {
                const isVideo = item.file.type.startsWith("video/");
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-2xl border border-slate-200/70"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-200/80 flex items-center justify-center flex-shrink-0 text-slate-700">
                      {isVideo ? (
                        <FileVideo className="w-5 h-5 text-blue-600" />
                      ) : (
                        <FileImage className="w-5 h-5 text-emerald-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItemName(item.id, e.target.value)}
                        placeholder="Nama file..."
                        className="w-full h-9 px-2.5 rounded-lg bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none text-xs font-semibold text-slate-800 transition"
                      />
                      <span className="text-[10px] text-slate-400 block px-1 mt-0.5">
                        {formatBytes(item.file.size)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="flex items-center gap-1.5 min-h-[44px] px-3 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah</span>
              </button>

              <button
                type="button"
                onClick={handleStartUpload}
                className="flex-1 flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs shadow-md shadow-indigo-200 transition"
              >
                <span>Upload {selectedItems.length} File</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
