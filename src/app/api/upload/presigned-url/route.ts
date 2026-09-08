import { NextRequest, NextResponse } from "next/server";
import { getPresignedUploadUrl, isB2Configured } from "@/lib/s3";

export async function POST(req: NextRequest) {
  try {
    const { filename, mimeType, folderId } = await req.json();

    if (!filename || !mimeType) {
      return NextResponse.json(
        { error: "Filename and mimeType are required" },
        { status: 400 }
      );
    }

    const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueKey = `uploads/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${cleanFilename}`;

    // If Backblaze B2 is configured, generate presigned PUT URL
    if (isB2Configured()) {
      const presigned = await getPresignedUploadUrl(uniqueKey, mimeType);
      return NextResponse.json({
        uploadUrl: presigned.uploadUrl,
        b2Url: presigned.b2Url,
        b2Key: presigned.b2Key,
        directB2: true,
      });
    }

    // Fallback for local development if B2 is not configured
    return NextResponse.json({
      uploadUrl: "/api/upload/local",
      b2Url: `/uploads/${uniqueKey.replace("uploads/", "")}`,
      b2Key: uniqueKey,
      directB2: false,
    });
  } catch (error: any) {
    console.error("Presigned URL generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate presigned upload URL" },
      { status: 500 }
    );
  }
}
