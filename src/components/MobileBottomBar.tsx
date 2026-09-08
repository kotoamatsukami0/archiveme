"use client";

import React from "react";
import { Upload, FolderPlus } from "lucide-react";

interface MobileBottomBarProps {
  onOpenUpload: () => void;
  onOpenNewFolder: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  onOpenUpload,
  onOpenNewFolder,
}) => {
  return (
    <aside
      aria-label="Mobile Navigation"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-lg border-t border-slate-200/80 px-4 py-2.5 pb-safe shadow-lg"
    >
      <div className="flex items-center justify-around gap-3 max-w-md mx-auto">
        {/* New Folder Button */}
        <button
          type="button"
          onClick={onOpenNewFolder}
          aria-label="New folder"
          className="flex-1 flex items-center justify-center gap-2 min-h-[48px] px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-semibold text-xs transition-colors select-none"
        >
          <FolderPlus className="w-4 h-4 text-slate-600" />
          <span>New Folder</span>
        </button>

        {/* Primary + Upload Button (Ergonomic Thumb Reach) */}
        <button
          type="button"
          onClick={onOpenUpload}
          aria-label="Upload media"
          className="flex-[1.2] flex items-center justify-center gap-2 min-h-[48px] px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-200 select-none"
        >
          <Upload className="w-4 h-4 text-white" />
          <span>+ Upload</span>
        </button>
      </div>
    </aside>
  );
};
