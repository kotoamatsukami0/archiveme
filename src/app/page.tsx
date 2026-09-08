"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FolderPlus,
  Upload,
  Search,
  Folder as FolderIcon,
  Image as ImageIcon,
  Archive,
  Layers,
  ArrowUpDown,
  RefreshCw,
  LogOut,
} from "lucide-react";
import { FolderItem, MediaItem, BreadcrumbItem, UploadTask } from "@/types";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { FolderCard } from "@/components/FolderCard";
import { MediaCard } from "@/components/MediaCard";
import { MediaViewerModal } from "@/components/MediaViewerModal";
import { BottomSheetMenu, ActionItemType } from "@/components/BottomSheetMenu";
import { MobileBottomBar } from "@/components/MobileBottomBar";
import { UploadProgress } from "@/components/UploadProgress";
import { UploadModal, SelectedFileItem } from "@/components/UploadModal";
import {
  NewFolderModal,
  RenameModal,
  MoveModal,
  DeleteConfirmModal,
} from "@/components/FolderModals";
import { generateVideoThumbnail } from "@/lib/videoThumbnail";

export default function HomePage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Navigation & Hierarchy State
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: null, name: "Home" },
  ]);

  // Data State
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "name">("newest");

  // Modals & BottomSheet State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);

  // Context Menu Target
  const [contextTarget, setContextTarget] = useState<{
    type: "folder" | "media";
    item: FolderItem | MediaItem;
  } | null>(null);

  // Action Modals State
  const [renameTarget, setRenameTarget] = useState<{
    item: FolderItem | MediaItem;
    type: "folder" | "media";
  } | null>(null);

  const [moveTarget, setMoveTarget] = useState<{
    item: FolderItem | MediaItem;
    type: "folder" | "media";
  } | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{
    item: FolderItem | MediaItem;
    type: "folder" | "media";
  } | null>(null);

  // Lightbox Media Viewer State
  const [viewerState, setViewerState] = useState<{
    isOpen: boolean;
    currentIndex: number;
  }>({
    isOpen: false,
    currentIndex: 0,
  });

  // Open viewer with history state for mobile back button ergonomics
  const handleOpenViewer = (index: number) => {
    window.history.pushState({ modal: "viewer" }, "", "#viewer");
    setViewerState({ isOpen: true, currentIndex: index });
  };

  // Close viewer cleanly handling history
  const handleCloseViewer = () => {
    if (window.location.hash === "#viewer") {
      window.history.back();
    } else {
      setViewerState({ isOpen: false, currentIndex: 0 });
    }
  };

  // Intercept phone hardware / gesture back button
  useEffect(() => {
    const handlePopState = () => {
      if (viewerState.isOpen) {
        setViewerState({ isOpen: false, currentIndex: 0 });
      }
      if (isUploadModalOpen) setIsUploadModalOpen(false);
      if (isNewFolderModalOpen) setIsNewFolderModalOpen(false);
      if (contextTarget) setContextTarget(null);
      if (renameTarget) setRenameTarget(null);
      if (moveTarget) setMoveTarget(null);
      if (deleteTarget) setDeleteTarget(null);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [
    viewerState.isOpen,
    isUploadModalOpen,
    isNewFolderModalOpen,
    contextTarget,
    renameTarget,
    moveTarget,
    deleteTarget,
  ]);

  // Upload Tasks State
  const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([]);

  // Fetch folders and media in current directory
  const fetchData = useCallback(async (folderId: string | null) => {
    setLoading(true);
    try {
      const parentParam = folderId ? `?parentId=${folderId}` : "";
      const folderParam = folderId ? `?folderId=${folderId}` : "";

      const [foldersRes, mediaRes] = await Promise.all([
        fetch(`/api/folders${parentParam}`),
        fetch(`/api/media${folderParam}`),
      ]);

      if (foldersRes.ok) {
        const foldersData = await foldersRes.json();
        setFolders(Array.isArray(foldersData) ? foldersData : []);
      }

      if (mediaRes.ok) {
        const mediaData = await mediaRes.json();
        setMediaItems(Array.isArray(mediaData) ? mediaData : []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(currentFolderId);
  }, [currentFolderId, fetchData]);

  // Navigate to folder
  const handleOpenFolder = (folder: FolderItem) => {
    setCurrentFolderId(folder.id);
    setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
  };

  // Navigate via breadcrumbs
  const handleBreadcrumbNavigate = (folderId: string | null, index: number) => {
    setCurrentFolderId(folderId);
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
  };

  // Open context menu (Bottom Sheet)
  const handleOpenContextMenu = (
    item: FolderItem | MediaItem,
    type: "folder" | "media",
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    setContextTarget({ type, item });
  };

  // Handle Bottom Sheet action
  const handleBottomSheetAction = (action: ActionItemType) => {
    if (!contextTarget) return;

    const { item, type } = contextTarget;

    if (action === "rename") {
      setRenameTarget({ item, type });
    } else if (action === "move") {
      setMoveTarget({ item, type });
    } else if (action === "delete") {
      setDeleteTarget({ item, type });
    } else if (action === "download" && type === "media") {
      window.open(`/api/media/${item.id}/download`, "_blank");
    }
  };

  // CRUD Handler: Create Folder
  const handleCreateFolder = async (name: string) => {
    const res = await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, parentId: currentFolderId }),
    });

    if (res.ok) {
      fetchData(currentFolderId);
    }
  };

  // CRUD Handler: Rename
  const handleRenameSubmit = async (newName: string) => {
    if (!renameTarget) return;
    const { item, type } = renameTarget;

    const endpoint =
      type === "folder" ? `/api/folders/${item.id}` : `/api/media/${item.id}`;

    const res = await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });

    if (res.ok) {
      fetchData(currentFolderId);
    }
  };

  // CRUD Handler: Move
  const handleMoveSubmit = async (targetFolderId: string | null) => {
    if (!moveTarget) return;
    const { item, type } = moveTarget;

    const endpoint =
      type === "folder" ? `/api/folders/${item.id}` : `/api/media/${item.id}`;

    const bodyPayload =
      type === "folder" ? { parentId: targetFolderId } : { folderId: targetFolderId };

    const res = await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyPayload),
    });

    if (res.ok) {
      fetchData(currentFolderId);
    }
  };

  // CRUD Handler: Delete
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const { item, type } = deleteTarget;

    const endpoint =
      type === "folder" ? `/api/folders/${item.id}` : `/api/media/${item.id}`;

    const res = await fetch(endpoint, {
      method: "DELETE",
    });

    if (res.ok) {
      // If currently inside viewer and deleting active item, close viewer
      if (viewerState.isOpen && viewerState.currentIndex >= 0) {
        setViewerState({ isOpen: false, currentIndex: 0 });
      }
      fetchData(currentFolderId);
    }
  };

  // Direct S3 Upload Pipeline
  const handleFilesSelected = async (items: SelectedFileItem[]) => {
    const targetFolderId = currentFolderId;

    for (const item of items) {
      const { file, name: chosenName } = item;
      const fileName = chosenName.trim() || file.name;
      const taskId = crypto.randomUUID();
      const newTask: UploadTask = {
        id: taskId,
        file,
        name: fileName,
        size: file.size,
        progress: 0,
        status: "pending",
      };

      setUploadTasks((prev) => [newTask, ...prev]);

      try {
        // Step 1: Request Presigned URL
        const presignedRes = await fetch("/api/upload/presigned-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: fileName,
            mimeType: file.type || "application/octet-stream",
            folderId: targetFolderId,
          }),
        });

        if (!presignedRes.ok) {
          throw new Error("Failed to get presigned upload URL");
        }

        const { uploadUrl, b2Url, b2Key, directB2 } = await presignedRes.json();

        // Step 2: Perform Direct Client-to-B2 PUT (or local fallback POST) with XMLHttpRequest for progress
        setUploadTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: "uploading" } : t))
        );

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const percentComplete = Math.round((e.loaded / e.total) * 90);
              setUploadTasks((prev) =>
                prev.map((t) =>
                  t.id === taskId ? { ...t, progress: percentComplete } : t
                )
              );
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          };

          xhr.onerror = () => reject(new Error("Network error during upload"));

          if (directB2) {
            xhr.open("PUT", uploadUrl);
            xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
            xhr.send(file);
          } else {
            // Local fallback POST
            const formData = new FormData();
            formData.append("file", file);
            formData.append("b2Key", b2Key);
            xhr.open("POST", uploadUrl);
            xhr.send(formData);
          }
        });

        // Optional Step 2.5: Generate & Upload Video Thumbnail if media is a video
        let thumbnailUrl: string | null = null;
        if (file.type.startsWith("video/")) {
          try {
            const thumbBlob = await generateVideoThumbnail(file);
            if (thumbBlob) {
              const thumbFilename = `thumb_${Date.now()}_${file.name.replace(/\.[^/.]+$/, "")}.jpg`;
              const thumbPresignedRes = await fetch("/api/upload/presigned-url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  filename: thumbFilename,
                  mimeType: "image/jpeg",
                  folderId: targetFolderId,
                }),
              });

              if (thumbPresignedRes.ok) {
                const thumbData = await thumbPresignedRes.json();
                if (thumbData.directB2) {
                  await fetch(thumbData.uploadUrl, {
                    method: "PUT",
                    headers: { "Content-Type": "image/jpeg" },
                    body: thumbBlob,
                  });
                  thumbnailUrl = thumbData.b2Url;
                } else {
                  const thumbFormData = new FormData();
                  thumbFormData.append("file", thumbBlob, thumbFilename);
                  thumbFormData.append("b2Key", thumbData.b2Key);
                  const thumbUploadRes = await fetch(thumbData.uploadUrl, {
                    method: "POST",
                    body: thumbFormData,
                  }).then((r) => r.json());
                  thumbnailUrl = thumbUploadRes.url || thumbData.b2Url;
                }
              }
            }
          } catch (thumbErr) {
            console.warn("Could not generate video thumbnail:", thumbErr);
          }
        }

        // Step 3: Register Metadata into Turso
        setUploadTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, status: "saving", progress: 95 } : t
          )
        );

        const mediaSaveRes = await fetch("/api/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: fileName,
            b2Key,
            b2Url,
            thumbnailUrl,
            mimeType: file.type || "application/octet-stream",
            size: file.size,
            folderId: targetFolderId,
          }),
        });

        if (!mediaSaveRes.ok) {
          throw new Error("Failed to save media metadata");
        }

        // Step 4: Mark Complete
        setUploadTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, status: "completed", progress: 100 } : t
          )
        );

        // Refresh current directory
        fetchData(targetFolderId);
      } catch (err: any) {
        console.error("Upload error:", err);
        setUploadTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? { ...t, status: "error", error: err.message || "Upload failed" }
              : t
          )
        );
      }
    }
  };

  // Filtered & Sorted Data
  const filteredFolders = useMemo(() => {
    return folders.filter((f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [folders, searchQuery]);

  const filteredMedia = useMemo(() => {
    let result = mediaItems.filter((m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortOrder === "newest") {
      result.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortOrder === "oldest") {
      result.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } else if (sortOrder === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  }, [mediaItems, searchQuery, sortOrder]);

  const isEmpty =
    !loading && filteredFolders.length === 0 && filteredMedia.length === 0;

  return (
    <div className="min-h-screen pb-28 sm:pb-12 bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-100">
      {/* Top App Header with Apple/Linear minimal aesthetic */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200/70 pt-safe transition-shadow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
              <Archive className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">
                ArchiveMe
              </h1>
              <span className="text-[11px] font-medium text-slate-400">
                Personal Archive
              </span>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md mx-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in this folder..."
              className="w-full h-10 pl-9 pr-3.5 rounded-full bg-slate-100/80 border border-transparent focus:border-indigo-300 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
            />
          </div>

          {/* Actions: Desktop Buttons + Lock/Logout Button */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsNewFolderModalOpen(true)}
                className="flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs transition shadow-2xs"
              >
                <FolderPlus className="w-4 h-4 text-slate-600" />
                <span>New Folder</span>
              </button>

              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-1.5 min-h-[40px] px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-sm shadow-indigo-200"
              >
                <Upload className="w-4 h-4" />
                <span>+ Upload</span>
              </button>
            </div>

            {/* Logout / Lock Button (Visible on all screens) */}
            <button
              type="button"
              onClick={handleLogout}
              title="Lock & Logout"
              aria-label="Lock and Logout"
              className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-slate-100 active:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-4">
        {/* Navigation & Breadcrumbs Bar */}
        <section className="flex items-center justify-between gap-2 pb-3 mb-2 border-b border-slate-200/60">
          <div className="flex-1 min-w-0">
            <BreadcrumbNav
              items={breadcrumbs}
              onNavigate={handleBreadcrumbNavigate}
            />
          </div>

          <div className="flex items-center gap-1">
            {/* Sort Toggle */}
            <button
              type="button"
              onClick={() => {
                setSortOrder((prev) =>
                  prev === "newest" ? "name" : prev === "name" ? "oldest" : "newest"
                );
              }}
              title={`Sort: ${sortOrder}`}
              className="flex items-center gap-1 min-h-[44px] px-2.5 rounded-xl hover:bg-slate-200/50 text-slate-500 hover:text-slate-800 text-xs font-medium transition"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span className="hidden md:inline capitalize">{sortOrder}</span>
            </button>

            {/* Refresh */}
            <button
              type="button"
              onClick={() => fetchData(currentFolderId)}
              title="Refresh"
              className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-slate-200/50 text-slate-500 hover:text-slate-800 transition"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-600" : ""}`}
              />
            </button>
          </div>
        </section>

        {/* Loading Skeletons */}
        {loading && (
          <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-slate-200/70 rounded-2xl" />
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square bg-slate-200/70 rounded-2xl" />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-xs">
              <Layers className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              {searchQuery ? "No matching items found" : "No photos or videos yet"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-6">
              {searchQuery
                ? "Try searching for a different keyword or check spelling."
                : "Upload photos or videos directly from your mobile camera or library."}
            </p>
            {!searchQuery && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="flex items-center gap-2 min-h-[44px] px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs shadow-md shadow-indigo-200 transition"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Media</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewFolderModalOpen(true)}
                  className="flex items-center gap-2 min-h-[44px] px-4 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs transition"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>New Folder</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Folders Section */}
        {!loading && filteredFolders.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <FolderIcon className="w-4 h-4 text-indigo-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Folders ({filteredFolders.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {filteredFolders.map((folder) => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  onOpen={handleOpenFolder}
                  onContextMenu={(f, e) => handleOpenContextMenu(f, "folder", e)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Media Grid Section (Strictly Mobile-First Scaling) */}
        {!loading && filteredMedia.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <ImageIcon className="w-4 h-4 text-indigo-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Media ({filteredMedia.length})
              </h2>
            </div>

            {/* Mobile: 2-col, Tablet: 3-col, Desktop: 4-5 col */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3.5">
              {filteredMedia.map((media, index) => (
                <MediaCard
                  key={media.id}
                  item={media}
                  onOpen={() => handleOpenViewer(index)}
                  onContextMenu={(m, e) => handleOpenContextMenu(m, "media", e)}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Mobile Sticky Bottom Action Bar (Ergonomic Thumb Reach) */}
      <MobileBottomBar
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onOpenNewFolder={() => setIsNewFolderModalOpen(true)}
      />

      {/* Mobile-First Context Menu (Bottom Sheet on Mobile, Centered Modal on Desktop) */}
      <BottomSheetMenu
        isOpen={contextTarget !== null}
        targetItem={contextTarget}
        onClose={() => setContextTarget(null)}
        onAction={handleBottomSheetAction}
      />

      {/* Full-screen Lightbox Media Viewer */}
      <MediaViewerModal
        isOpen={viewerState.isOpen}
        items={filteredMedia}
        currentIndex={viewerState.currentIndex}
        onClose={handleCloseViewer}
        onNavigate={(index) =>
          setViewerState((prev) => ({ ...prev, currentIndex: index }))
        }
        onRename={(item) => setRenameTarget({ item, type: "media" })}
        onMove={(item) => setMoveTarget({ item, type: "media" })}
        onDelete={(item) => setDeleteTarget({ item, type: "media" })}
      />

      {/* Upload Modal (Camera / Library / Drag-and-Drop) */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onFilesSelected={handleFilesSelected}
      />

      {/* Upload Progress Tracker */}
      <UploadProgress
        tasks={uploadTasks}
        onDismiss={() => setUploadTasks([])}
      />

      {/* New Folder Modal */}
      <NewFolderModal
        isOpen={isNewFolderModalOpen}
        onClose={() => setIsNewFolderModalOpen(false)}
        onSubmit={handleCreateFolder}
      />

      {/* Rename Modal */}
      <RenameModal
        isOpen={renameTarget !== null}
        initialName={renameTarget?.item?.name || ""}
        itemType={renameTarget?.type || "folder"}
        onClose={() => setRenameTarget(null)}
        onSubmit={handleRenameSubmit}
      />

      {/* Move to Folder Modal */}
      <MoveModal
        isOpen={moveTarget !== null}
        currentItemId={moveTarget?.item?.id || ""}
        currentFolderId={
          moveTarget
            ? moveTarget.type === "folder"
              ? (moveTarget.item as FolderItem).parentId
              : (moveTarget.item as MediaItem).folderId
            : null
        }
        itemType={moveTarget?.type || "folder"}
        onClose={() => setMoveTarget(null)}
        onMove={handleMoveSubmit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteTarget !== null}
        title={deleteTarget?.item?.name || ""}
        itemType={deleteTarget?.type || "folder"}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
