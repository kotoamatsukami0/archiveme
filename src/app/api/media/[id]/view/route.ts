import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { ensureTablesExist } from "@/lib/db/init";
import { getPresignedViewUrl, isB2Configured } from "@/lib/s3";
import { eq } from "drizzle-orm";

export async function GET(
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

    // If B2 is configured, generate direct presigned view/streaming URL
    if (isB2Configured() && item.b2Key) {
      const viewUrl = await getPresignedViewUrl(item.b2Key, item.mimeType);
      if (viewUrl) {
        return NextResponse.redirect(viewUrl, 307);
      }
    }

    // Local fallback or direct URL
    if (item.b2Url?.startsWith("/uploads/")) {
      return NextResponse.redirect(new URL(item.b2Url, req.url));
    }

    return NextResponse.redirect(item.b2Url);
  } catch (error: any) {
    console.error("GET /api/media/[id]/view error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to stream media" },
      { status: 500 }
    );
  }
}
