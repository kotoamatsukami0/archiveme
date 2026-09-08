import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { ensureTablesExist } from "@/lib/db/init";
import { deleteB2Object, isB2Configured } from "@/lib/s3";
import { eq } from "drizzle-orm";
import { unlink } from "fs/promises";
import path from "path";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureTablesExist();
    const { id } = await params;
    const body = await req.json();
    const { name, folderId } = body;

    const updates: Partial<{ name: string; folderId: string | null }> = {};
    if (name !== undefined) updates.name = name.trim();
    if (folderId !== undefined) {
      updates.folderId = !folderId || folderId === "root" ? null : folderId;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const [updated] = await db
      .update(media)
      .set(updates)
      .where(eq(media.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Media item not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PATCH /api/media/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update media item" },
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

    const [item] = await db.select().from(media).where(eq(media.id, id));

    if (!item) {
      return NextResponse.json({ error: "Media item not found" }, { status: 404 });
    }

    // Purge physical file from Backblaze B2 if configured
    if (isB2Configured() && item.b2Key) {
      await deleteB2Object(item.b2Key);
    } else if (item.b2Url?.startsWith("/uploads/")) {
      // Local fallback removal
      try {
        const localPath = path.join(process.cwd(), "public", item.b2Url);
        await unlink(localPath);
      } catch (err) {
        // File may already have been removed or missing
      }
    }

    // Delete record from database
    await db.delete(media).where(eq(media.id, id));

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error("DELETE /api/media/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete media item" },
      { status: 500 }
    );
  }
}
