import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { folders, media } from "@/lib/db/schema";
import { ensureTablesExist } from "@/lib/db/init";
import { eq, isNull, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    await ensureTablesExist();
    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get("parentId");
    const getAll = searchParams.get("all") === "true";

    if (getAll) {
      const allFolders = await db.select().from(folders).orderBy(folders.name);
      return NextResponse.json(allFolders);
    }

    let folderList;
    if (!parentId || parentId === "root" || parentId === "null") {
      folderList = await db
        .select()
        .from(folders)
        .where(isNull(folders.parentId))
        .orderBy(folders.name);
    } else {
      folderList = await db
        .select()
        .from(folders)
        .where(eq(folders.parentId, parentId))
        .orderBy(folders.name);
    }

    // Enrich with item counts (media files count and subfolder count)
    const enriched = await Promise.all(
      folderList.map(async (f) => {
        const [mediaCountResult] = await db
          .select({ count: sql<number>`count(*)` })
          .from(media)
          .where(eq(media.folderId, f.id));

        const [subfolderCountResult] = await db
          .select({ count: sql<number>`count(*)` })
          .from(folders)
          .where(eq(folders.parentId, f.id));

        return {
          ...f,
          mediaCount: Number(mediaCountResult?.count || 0),
          subfolderCount: Number(subfolderCountResult?.count || 0),
          itemCount: Number(mediaCountResult?.count || 0) + Number(subfolderCountResult?.count || 0),
        };
      })
    );

    return NextResponse.json(enriched);
  } catch (error: any) {
    console.error("GET /api/folders error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch folders" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTablesExist();
    const body = await req.json();
    const { name, parentId } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
    }

    const normalizedParentId = !parentId || parentId === "root" ? null : parentId;

    const [newFolder] = await db
      .insert(folders)
      .values({
        id: crypto.randomUUID(),
        name: name.trim(),
        parentId: normalizedParentId,
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json(
      {
        ...newFolder,
        mediaCount: 0,
        subfolderCount: 0,
        itemCount: 0,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/folders error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create folder" },
      { status: 500 }
    );
  }
}
