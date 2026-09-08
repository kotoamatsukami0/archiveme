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

    // If thumbnail URL is stored
    if (item.thumbnailUrl) {
      // Check if it's a B2 URL
      if (isB2Configured() && item.thumbnailUrl.includes("/archiveme0/")) {
        const key = item.thumbnailUrl.split("/archiveme0/")[1];
        if (key) {
          const signed = await getPresignedViewUrl(decodeURIComponent(key), "image/jpeg");
          if (signed) return NextResponse.redirect(signed, 307);
        }
      }
      return NextResponse.redirect(item.thumbnailUrl);
    }

    // Fallback: redirect to full view
    return NextResponse.redirect(new URL(`/api/media/${id}/view`, req.url));
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch thumbnail" }, { status: 500 });
  }
}
