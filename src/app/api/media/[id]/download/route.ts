import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { ensureTablesExist } from "@/lib/db/init";
import { getPresignedDownloadUrl, isB2Configured } from "@/lib/s3";
import { eq } from "drizzle-orm";
import { readFile } from "fs/promises";
import path from "path";

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

    const safeFilename = encodeURIComponent(item.name).replace(/['()]/g, escape);

    // If B2 is configured, generate direct presigned download URL
    if (isB2Configured() && item.b2Key) {
      const downloadUrl = await getPresignedDownloadUrl(item.b2Key, item.name);
      if (downloadUrl) {
        return NextResponse.redirect(downloadUrl);
      }
    }

    // Local file fallback
    if (item.b2Url?.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", item.b2Url);
      try {
        const fileBuffer = await readFile(filePath);
        return new NextResponse(fileBuffer, {
          headers: {
            "Content-Disposition": `attachment; filename="${safeFilename}"; filename*=UTF-8''${safeFilename}`,
            "Content-Type": item.mimeType || "application/octet-stream",
            "Content-Length": item.size.toString(),
          },
        });
      } catch {
        // If file not on disk, return 404
        return NextResponse.json({ error: "File not found on storage" }, { status: 404 });
      }
    }

    // Direct redirect to URL if externally hosted
    return NextResponse.redirect(item.b2Url);
  } catch (error: any) {
    console.error("GET /api/media/[id]/download error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to download media" },
      { status: 500 }
    );
  }
}
