"use client";

import React, { useEffect } from "react";
import {
  Pencil,
  FolderInput,
  Download,
  Trash2,
  X,
  FileVideo,
  FileImage,
  Folder,
} from "lucide-react";
import { FolderItem, MediaItem } from "@/types";

export type ActionItemType = "rename" | "move" | "download" | "delete";

interface BottomSheetMenuProps {
  isOpen: boolean;
  onClose: () => void;
  targetItem: {
    type: "folder" | "media";
    item: FolderItem | MediaItem;
  } | null;
  onAction: (action: ActionItemType) => void;
}

export const BottomSheetMenu: React.FC<BottomSheetMenuProps> = ({
  isOpen,
  onClose,
  targetItem,
  onAction,
}) => {
  // Lock body scroll when open on mobile
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

  if (!isOpen || !targetItem) return null;

  const isFolder = targetItem.type === "folder";
  const title = isFolder
    ? (targetItem.item as FolderItem).name
    : (targetItem.item as MediaItem).name;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
      {/* Backdrop blur overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sheet Container: Bottom Sheet on Mobile, Compact Centered Dialog on Tablet/Desktop */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Item Actions"
        className="relative z-10 w-full sm:max-w-md bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-slate-200/80 p-5 pb-8 sm:pb-5 transition-transform duration-300 ease-out animate-in slide-in-from-bottom"
      >
        {/* Drag handle for mobile thumb ergonomics */}
        <div className="flex justify-center sm:hidden pb-3">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {/* Item Header */}
        <div className="flex items-center justify-between pb-4 mb-2 border-b border-slate-100">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-700">
              {isFolder ? (
                <Folder className="w-5 h-5 text-indigo-600" />
              ) : (targetItem.item as MediaItem).mimeType?.startsWith("video/") ? (
                <FileVideo className="w-5 h-5 text-blue-600" />
              ) : (
                <FileImage className="w-5 h-5 text-emerald-600" />
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {isFolder ? "Folder" : "Media File"}
              </p>
              <h3 className="text-sm font-semibold text-slate-900 truncate max-w-[240px]">
                {title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action List with min 48px touch targets */}
        <div className="space-y-1">
          {/* Rename */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onAction("rename");
            }}
            className="w-full flex items-center gap-3.5 px-4 min-h-[48px] rounded-2xl text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition font-medium text-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
              <Pencil className="w-4 h-4" />
            </div>
            <span>Rename {isFolder ? "Folder" : "File"}</span>
          </button>

          {/* Move */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onAction("move");
            }}
            className="w-full flex items-center gap-3.5 px-4 min-h-[48px] rounded-2xl text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition font-medium text-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
              <FolderInput className="w-4 h-4" />
            </div>
            <span>Move to Folder</span>
          </button>

          {/* Download (media only) */}
          {!isFolder && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onAction("download");
              }}
              className="w-full flex items-center gap-3.5 px-4 min-h-[48px] rounded-2xl text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition font-medium text-sm"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
                <Download className="w-4 h-4" />
              </div>
              <span>Download File</span>
            </button>
          )}

          <div className="pt-2 border-t border-slate-100 mt-2">
            {/* Delete */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onAction("delete");
              }}
              className="w-full flex items-center gap-3.5 px-4 min-h-[48px] rounded-2xl text-rose-600 hover:bg-rose-50 active:bg-rose-100 transition font-medium text-sm"
            >
              <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <span>Delete {isFolder ? "Folder & Contents" : "File"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
