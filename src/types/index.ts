export interface FolderItem {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string | Date;
  mediaCount?: number;
  subfolderCount?: number;
  itemCount?: number;
}

export interface MediaItem {
  id: string;
  folderId: string | null;
  name: string;
  b2Key: string;
  b2Url: string;
  mimeType: string;
  size: number;
  createdAt: string | Date;
}

export interface BreadcrumbItem {
  id: string | null;
  name: string;
}

export interface UploadTask {
  id: string;
  file: File;
  name: string;
  size: number;
  progress: number;
  status: "pending" | "uploading" | "saving" | "completed" | "error";
  error?: string;
}
