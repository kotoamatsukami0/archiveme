"use client";

import React, { useState, useEffect } from "react";
import { X, FolderPlus, Pencil, FolderInput, AlertTriangle } from "lucide-react";
import { FolderItem } from "@/types";

// ================= New Folder Modal =================
interface NewFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
}

export const NewFolderModal: React.FC<NewFolderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) setName("");
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || loading) return;
    setLoading(true);
    try {
      await onSubmit(name.trim());
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-md bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-slate-200/80 p-5 pb-8 sm:pb-5 animate-in slide-in-from-bottom">
        <div className="flex justify-center sm:hidden pb-3">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>

        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FolderPlus className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">New Folder</h3>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Folder Name
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Summer Vacation"
              className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 rounded-xl hover:bg-slate-100 text-slate-600 font-medium text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="min-h-[44px] px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm transition shadow-sm"
            >
              {loading ? "Creating..." : "Create Folder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ================= Rename Modal =================
interface RenameModalProps {
  isOpen: boolean;
  initialName: string;
  itemType: "folder" | "media";
  onClose: () => void;
  onSubmit: (newName: string) => Promise<void>;
}

export const RenameModal: React.FC<RenameModalProps> = ({
  isOpen,
  initialName,
  itemType,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(initialName);
  }, [initialName, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || loading) return;
    setLoading(true);
    try {
      await onSubmit(name.trim());
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-md bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-slate-200/80 p-5 pb-8 sm:pb-5 animate-in slide-in-from-bottom">
        <div className="flex justify-center sm:hidden pb-3">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>

        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Pencil className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Rename {itemType === "folder" ? "Folder" : "File"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Title
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 rounded-xl hover:bg-slate-100 text-slate-600 font-medium text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="min-h-[44px] px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm transition shadow-sm"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ================= Move Modal =================
interface MoveModalProps {
  isOpen: boolean;
  currentItemId: string;
  currentFolderId: string | null;
  itemType: "folder" | "media";
  onClose: () => void;
  onMove: (targetFolderId: string | null) => Promise<void>;
}

export const MoveModal: React.FC<MoveModalProps> = ({
  isOpen,
  currentItemId,
  currentFolderId,
  itemType,
  onClose,
  onMove,
}) => {
  const [allFolders, setAllFolders] = useState<FolderItem[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedFolderId(currentFolderId);
      setFetching(true);
      fetch("/api/folders?all=true")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            // If moving a folder, exclude itself from destination options
            const filtered =
              itemType === "folder"
                ? data.filter((f) => f.id !== currentItemId)
                : data;
            setAllFolders(filtered);
          }
        })
        .catch(console.error)
        .finally(() => setFetching(false));
    }
  }, [isOpen, currentItemId, currentFolderId, itemType]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onMove(selectedFolderId);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-md bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-slate-200/80 p-5 pb-8 sm:pb-5 animate-in slide-in-from-bottom">
        <div className="flex justify-center sm:hidden pb-3">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>

        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <FolderInput className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Move to Folder</h3>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Folder Destination Selector */}
        <div className="mt-4 max-h-60 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
          {/* Root Option */}
          <button
            type="button"
            onClick={() => setSelectedFolderId(null)}
            className={`w-full flex items-center justify-between px-3.5 min-h-[48px] rounded-xl text-sm font-medium transition ${
              selectedFolderId === null
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold"
                : "hover:bg-slate-100 text-slate-700"
            }`}
          >
            <span>Home (Root)</span>
            {selectedFolderId === null && <span className="text-xs">Selected</span>}
          </button>

          {fetching && (
            <p className="text-xs text-slate-400 text-center py-4">Loading folders...</p>
          )}

          {allFolders.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelectedFolderId(f.id)}
              className={`w-full flex items-center justify-between px-3.5 min-h-[48px] rounded-xl text-sm font-medium transition ${
                selectedFolderId === f.id
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold"
                  : "hover:bg-slate-100 text-slate-700"
              }`}
            >
              <span className="truncate">{f.name}</span>
              {selectedFolderId === f.id && (
                <span className="text-xs flex-shrink-0">Selected</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 rounded-xl hover:bg-slate-100 text-slate-600 font-medium text-sm transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="min-h-[44px] px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm transition shadow-sm"
          >
            {loading ? "Moving..." : "Move Here"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ================= Delete Confirm Modal =================
interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  itemType: "folder" | "media";
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title,
  itemType,
  onClose,
  onConfirm,
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-md bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-slate-200/80 p-5 pb-8 sm:pb-5 animate-in slide-in-from-bottom">
        <div className="flex justify-center sm:hidden pb-3">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>

        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Delete {itemType === "folder" ? "Folder" : "File"}?
            </h3>
            <p className="text-xs text-slate-500">This action cannot be undone.</p>
          </div>
        </div>

        <div className="py-4 text-xs sm:text-sm text-slate-600">
          <p>
            Are you sure you want to permanently delete{" "}
            <strong className="text-slate-900 font-semibold">&ldquo;{title}&rdquo;</strong>?
          </p>
          {itemType === "folder" && (
            <div className="mt-2.5 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs leading-relaxed">
              <strong>Notice:</strong> All subfolders and media files inside this folder will also be permanently deleted from Turso and purged from Backblaze B2 storage.
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 rounded-xl hover:bg-slate-100 text-slate-600 font-medium text-sm transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="min-h-[44px] px-5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold text-sm transition shadow-sm"
          >
            {loading ? "Deleting..." : "Delete Permanently"}
          </button>
        </div>
      </div>
    </div>
  );
};
