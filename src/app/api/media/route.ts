import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { ensureTablesExist } from "@/lib/db/init";
import { eq, isNull, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    await ensureTablesExist();
    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("folderId");

    let query;
    if (!folderId || folderId === "root" || folderId === "null") {
      query = db.select().from(media).where(isNull(media.folderId)).orderBy(desc(media.createdAt));
    } else {
      query = db.select().from(media).where(eq(media.folderId, folderId)).orderBy(desc(media.createdAt));
    }

    const items = await query;
    return NextResponse.json(items);
  } catch (error: any) {
    console.error("GET /api/media error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch media items" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTablesExist();
    const body = await req.json();
    const { name, b2Key, b2Url, mimeType, size, folderId } = body;

    if (!name || !b2Key || !b2Url || !mimeType || size === undefined) {
      return NextResponse.json(
        { error: "Missing required media fields" },
        { status: 400 }
      );
    }

    const normalizedFolderId = !folderId || folderId === "root" ? null : folderId;

    const [inserted] = await db
      .insert(media)
      .values({
        id: crypto.randomUUID(),
        name,
        b2Key,
        b2Url,
        mimeType,
        size: Number(size),
        folderId: normalizedFolderId,
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json(inserted, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/media error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create media record" },
      { status: 500 }
    );
  }
}
