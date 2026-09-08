import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const b2Key = (formData.get("b2Key") as string) || `uploads/${Date.now()}-${file?.name || "file"}`;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const filename = b2Key.replace(/^uploads\//, "");
    const filePath = path.join(uploadsDir, filename);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      b2Key,
    });
  } catch (error: any) {
    console.error("Local upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save local file" },
      { status: 500 }
    );
  }
}
