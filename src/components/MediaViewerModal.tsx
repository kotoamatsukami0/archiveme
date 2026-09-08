"use client";

import React, { useEffect, useCallback, useState, useRef } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Trash2,
  Pencil,
  FolderInput,
  Info,
} from "lucide-react";
import { MediaItem } from "@/types";
import { formatBytes, formatDate, isVideoFile } from "@/lib/utils";

interface MediaViewerModalProps {
  items: MediaItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onRename: (item: MediaItem) => void;
  onMove: (item: MediaItem) => void;
  onDelete: (item: MediaItem) => void;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  items,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
  onRename,
  onMove,
  onDelete,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  const currentItem = items[currentIndex] as MediaItem | undefined;

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  }, [currentIndex, onNavigate]);

  const handleNext = useCallback(() => {
    if (currentIndex < items.length - 1) {
      onNavigate(currentIndex + 1);
    }
  }, [currentIndex, items.length, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

  // Lock scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !currentItem) return null;

  const isVideo = isVideoFile(currentItem.mimeType, currentItem.name);

  // Mobile swipe navigation handler
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartXRef.current = null;
  };

  const downloadUrl = `/api/media/${currentItem.id}/download`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Media Viewer"
      className="fixed inset-0 z-50 flex flex-col bg-black/95 text-white backdrop-blur-xl animate-in fade-in duration-200 select-none"
    >
      {/* Top Navigation Bar with >= 44x44px touch targets */}
      <header className="relative z-20 flex items-center justify-between px-3 sm:px-6 py-3 bg-gradient-to-b from-black/80 to-transparent pt-safe">
        {/* Left: Back / Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close viewer"
          className="flex items-center gap-1.5 min-h-[44px] min-w-[44px] px-2.5 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition-colors"
        >
          <X className="w-5 h-5" />
          <span className="hidden sm:inline text-xs font-medium">Close</span>
        </button>

        {/* Center: Title & Index */}
        <div className="flex flex-col items-center max-w-[50%] sm:max-w-[60%] text-center">
          <h3 className="text-sm font-semibold truncate w-full text-white/95">
            {currentItem.name}
          </h3>
          <span className="text-[11px] text-white/60">
            {currentIndex + 1} of {items.length}
          </span>
        </div>

        {/* Right: Quick actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Info toggle */}
          <button
            type="button"
            onClick={() => setShowDetails((prev) => !prev)}
            aria-label="File information"
            className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center transition-colors ${
              showDetails ? "bg-white text-black" : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Download */}
          <a
            href={downloadUrl}
            download
            aria-label="Download media"
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <Download className="w-4 h-4" />
          </a>

          {/* Delete */}
          <button
            type="button"
            onClick={() => onDelete(currentItem)}
            aria-label="Delete media"
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-rose-500/20 hover:bg-rose-500/40 active:bg-rose-500/60 text-rose-300 flex items-center justify-center transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div
        className="relative flex-1 flex items-center justify-center overflow-hidden p-2 sm:p-6"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Previous Button (Touch target min 44x44px) */}
        {currentIndex > 0 && (
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous item"
            className="absolute left-2 sm:left-4 z-20 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-black/50 hover:bg-black/80 text-white/80 hover:text-white backdrop-blur-md flex items-center justify-center transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Media Container */}
        <div className="relative w-full h-full flex items-center justify-center max-w-5xl max-h-[82vh]">
          {isVideo ? (
            <video
              key={currentItem.id}
              src={`/api/media/${currentItem.id}/view`}
              poster={currentItem.thumbnailUrl ? `/api/media/${currentItem.id}/thumbnail` : undefined}
              controls
              playsInline
              autoPlay
              preload="metadata"
              className="max-w-full max-h-full rounded-xl shadow-2xl object-contain transform-gpu outline-none"
            />
          ) : (
            <img
              key={currentItem.id}
              src={`/api/media/${currentItem.id}/view`}
              alt={currentItem.name}
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl transition-all duration-200"
            />
          )}
        </div>

        {/* Next Button */}
        {currentIndex < items.length - 1 && (
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next item"
            className="absolute right-2 sm:right-4 z-20 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-black/50 hover:bg-black/80 text-white/80 hover:text-white backdrop-blur-md flex items-center justify-center transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Details drawer overlay */}
      {showDetails && (
        <div className="absolute top-16 right-4 sm:right-6 z-30 w-72 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-xs shadow-2xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
            <span className="font-semibold text-white/90">Details</span>
            <button
              onClick={() => setShowDetails(false)}
              className="text-white/60 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2 text-white/70">
            <div>
              <span className="block text-white/40 text-[10px] uppercase">File Name</span>
              <span className="text-white break-all font-medium">{currentItem.name}</span>
            </div>
            <div>
              <span className="block text-white/40 text-[10px] uppercase">Size</span>
              <span>{formatBytes(currentItem.size)}</span>
            </div>
            <div>
              <span className="block text-white/40 text-[10px] uppercase">Type</span>
              <span>{currentItem.mimeType}</span>
            </div>
            <div>
              <span className="block text-white/40 text-[10px] uppercase">Date Uploaded</span>
              <span>{formatDate(currentItem.createdAt)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Footer for Thumb Reach */}
      <footer className="relative z-20 flex items-center justify-center gap-3 px-4 py-3.5 bg-gradient-to-t from-black/90 to-transparent pb-safe">
        <button
          type="button"
          onClick={() => onRename(currentItem)}
          className="flex items-center gap-2 min-h-[44px] px-4 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-medium backdrop-blur-md transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          <span>Rename</span>
        </button>

        <button
          type="button"
          onClick={() => onMove(currentItem)}
          className="flex items-center gap-2 min-h-[44px] px-4 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-medium backdrop-blur-md transition-colors"
        >
          <FolderInput className="w-3.5 h-3.5" />
          <span>Move</span>
        </button>

        <a
          href={downloadUrl}
          download
          className="flex items-center gap-2 min-h-[44px] px-4 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-medium backdrop-blur-md transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download</span>
        </a>
      </footer>
    </div>
  );
};
