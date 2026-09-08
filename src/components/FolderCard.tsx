"use client";

import React from "react";
import { Folder, MoreVertical } from "lucide-react";
import { FolderItem } from "@/types";

interface FolderCardProps {
  folder: FolderItem;
  onOpen: (folder: FolderItem) => void;
  onContextMenu: (folder: FolderItem, e: React.MouseEvent) => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  onOpen,
  onContextMenu,
}) => {
  const countText =
    folder.itemCount === 1
      ? "1 item"
      : `${folder.itemCount ?? 0} items`;

  return (
    <div
      onClick={() => onOpen(folder)}
      className="group relative flex items-center justify-between p-3.5 bg-white rounded-2xl border border-slate-200/70 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer select-none active:scale-[0.98]"
    >
      <div className="flex items-center gap-3 min-w-0 pr-1">
        <div className="w-10 h-10 rounded-xl bg-indigo-50/80 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
          <Folder className="w-5 h-5 fill-indigo-100" />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
            {folder.name}
          </h4>
          <p className="text-xs text-slate-400 font-medium">{countText}</p>
        </div>
      </div>

      {/* 44x44px min touch target Kebab menu trigger */}
      <button
        type="button"
        aria-label={`Folder options for ${folder.name}`}
        onClick={(e) => {
          e.stopPropagation();
          onContextMenu(folder, e);
        }}
        className="w-11 h-11 min-w-[44px] min-h-[44px] -mr-1.5 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 active:bg-slate-200 transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
    </div>
  );
};
