"use client";

import React, { useState } from "react";
import { Play, MoreVertical, FileVideo, Image as ImageIcon } from "lucide-react";
import { MediaItem } from "@/types";
import { formatBytes, isVideoFile } from "@/lib/utils";

interface MediaCardProps {
  item: MediaItem;
  onOpen: (item: MediaItem) => void;
  onContextMenu: (item: MediaItem, e: React.MouseEvent) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  onOpen,
  onContextMenu,
}) => {
  const isVideo = isVideoFile(item.mimeType, item.name);
  const [imageError, setImageError] = useState(false);

  return (
    <div
      onClick={() => onOpen(item)}
      className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/70 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer select-none active:scale-[0.98]"
    >
      {/* Media Preview Container (Aspect ratio 1:1 square for clean Apple Photos grid) */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        {isVideo ? (
          <div className="w-full h-full flex items-center justify-center bg-slate-900/90 relative group-hover:bg-slate-900 transition overflow-hidden">
            {/* Instant generated thumbnail preview if available */}
            {item.thumbnailUrl ? (
              <img
                src={`/api/media/${item.id}/thumbnail`}
                alt={item.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
              />
            ) : (
              /* Fallback native video frame */
              <video
                src={`/api/media/${item.id}/view#t=0.5`}
                preload="metadata"
                playsInline
                muted
                className="w-full h-full object-cover opacity-80 group-hover:opacity-95 transition-opacity"
              />
            )}
            {/* Centered Play Pill */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white/30 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:bg-white/40 transition-transform">
                <Play className="w-5 h-5 fill-white translate-x-0.5" />
              </div>
            </div>
            {/* Top Video Badge */}
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-semibold text-white tracking-wider flex items-center gap-1">
              <FileVideo className="w-3 h-3 text-blue-400" />
              <span>VIDEO</span>
            </div>
          </div>
        ) : !imageError ? (
          <img
            src={`/api/media/${item.id}/view`}
            alt={item.name}
            loading="lazy"
            decoding="async"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 gap-1.5">
            <ImageIcon className="w-8 h-8 text-slate-300" />
            <span className="text-[11px] text-slate-400 font-medium">Image</span>
          </div>
        )}

        {/* 44x44px touch target Kebab menu trigger overlay on image */}
        <button
          type="button"
          aria-label={`Options for ${item.name}`}
          onClick={(e) => {
            e.stopPropagation();
            onContextMenu(item, e);
          }}
          className="absolute top-1.5 right-1.5 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-xs text-white flex items-center justify-center transition-all opacity-90 sm:opacity-0 sm:group-hover:opacity-100 shadow-sm"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Info footer */}
      <div className="p-2.5 sm:p-3 flex items-center justify-between gap-1">
        <div className="min-w-0 flex-1">
          <h4 className="text-xs sm:text-sm font-semibold text-slate-800 truncate" title={item.name}>
            {item.name}
          </h4>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            {formatBytes(item.size)}
          </p>
        </div>
      </div>
    </div>
  );
};
