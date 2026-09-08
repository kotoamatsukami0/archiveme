import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { folders, media } from "@/lib/db/schema";
import { ensureTablesExist } from "@/lib/db/init";
import { deleteB2Objects, isB2Configured } from "@/lib/s3";
import { eq, inArray } from "drizzle-orm";
import { unlink } from "fs/promises";
import path from "path";

async function getAllDescendantFolderIds(rootFolderId: string): Promise<string[]> {
  const result: string[] = [rootFolderId];
  let currentParents = [rootFolderId];

  while (currentParents.length > 0) {
    const children = await db
      .select({ id: folders.id })
      .from(folders)
      .where(inArray(folders.parentId, currentParents));

    if (children.length === 0) break;

    const childIds = children.map((c) => c.id);
    result.push(...childIds);
    currentParents = childIds;
  }

  return result;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureTablesExist();
    const { id } = await params;
    const body = await req.json();
    const { name, parentId } = body;

    const updates: Partial<{ name: string; parentId: string | null }> = {};
    if (name !== undefined) updates.name = name.trim();
    if (parentId !== undefined) {
      // Prevent moving folder into itself
      if (parentId === id) {
        return NextResponse.json(
          { error: "Cannot move a folder into itself" },
          { status: 400 }
        );
      }
      updates.parentId = !parentId || parentId === "root" ? null : parentId;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const [updated] = await db
      .update(folders)
      .set(updates)
      .where(eq(folders.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PATCH /api/folders/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update folder" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureTablesExist();
    const { id } = await params;

    // Check if target folder exists
    const [targetFolder] = await db.select().from(folders).where(eq(folders.id, id));
    if (!targetFolder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    // 1. Recursively find all nested descendant folder IDs
    const allFolderIdsToDelete = await getAllDescendantFolderIds(id);

    // 2. Fetch all media items across this folder and all subfolders
    const mediaToDelete = await db
      .select()
      .from(media)
      .where(inArray(media.folderId, allFolderIdsToDelete));

    // 3. Purge physical files from Backblaze B2
    const b2Keys = mediaToDelete.map((m) => m.b2Key).filter(Boolean);
    if (isB2Configured() && b2Keys.length > 0) {
      await deleteB2Objects(b2Keys);
    } else {
      // Clean up local files if applicable
      for (const item of mediaToDelete) {
        if (item.b2Url?.startsWith("/uploads/")) {
          try {
            const localPath = path.join(process.cwd(), "public", item.b2Url);
            await unlink(localPath);
          } catch (err) {
            // ignore missing local file
          }
        }
      }
    }

    // 4. Delete media rows in Turso
    if (mediaToDelete.length > 0) {
      await db
        .delete(media)
        .where(inArray(media.folderId, allFolderIdsToDelete));
    }

    // 5. Delete all folders in Turso
    await db
      .delete(folders)
      .where(inArray(folders.id, allFolderIdsToDelete));

    return NextResponse.json({
      success: true,
      deletedFolderCount: allFolderIdsToDelete.length,
      deletedMediaCount: mediaToDelete.length,
    });
  } catch (error: any) {
    console.error("DELETE /api/folders/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete folder and contents" },
      { status: 500 }
    );
  }
}
