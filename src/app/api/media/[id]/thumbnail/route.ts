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
          if (signed) {
            const res = NextResponse.redirect(signed, 307);
            res.headers.set("Cache-Control", "public, max-age=604800, stale-while-revalidate=86400");
            return res;
          }
        }
      }
      const res = NextResponse.redirect(item.thumbnailUrl, 307);
      res.headers.set("Cache-Control", "public, max-age=604800, stale-while-revalidate=86400");
      return res;
    }

    // Fallback: redirect to full view with cache
    const fallbackRes = NextResponse.redirect(new URL(`/api/media/${id}/view`, req.url), 307);
    fallbackRes.headers.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=43200");
    return fallbackRes;
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch thumbnail" }, { status: 500 });
  }
}
