import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    // Parse the multipart form data
    const formData = await request.formData();
    const image = formData.get("image") as File;
    const quality = parseInt(formData.get("quality") as string) || 70;
    const maxWidth = parseInt(formData.get("maxWidth") as string) || 1920;

    if (!image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get image metadata
    const metadata = await sharp(buffer).metadata();

    // Prepare sharp instance
    let sharpInstance = sharp(buffer);

    // Resize if larger than max_width
    if (metadata.width && metadata.width > maxWidth) {
      sharpInstance = sharpInstance.resize(maxWidth, null, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    // Compress based on format
    let compressedBuffer: Buffer;
    let outputFormat: string;
    let mimeType: string;

    if (image.type === "image/png") {
      // For PNG, preserve transparency
      compressedBuffer = await sharpInstance
        .png({
          quality: quality,
          compressionLevel: 9,
          palette: true,
        })
        .toBuffer();
      outputFormat = "png";
      mimeType = "image/png";
    } else {
      // For JPEG and other formats
      compressedBuffer = await sharpInstance
        .jpeg({
          quality: quality,
          mozjpeg: true,
        })
        .toBuffer();
      outputFormat = "jpeg";
      mimeType = "image/jpeg";
    }

    // Calculate compression ratio
    const originalSize = buffer.length;
    const compressedSize = compressedBuffer.length;
    const compressionRatio = (
      (1 - compressedSize / originalSize) *
      100
    ).toFixed(1);

    // Convert to base64
    const base64 = compressedBuffer.toString("base64");

    // Return the compressed image
    return NextResponse.json({
      success: true,
      image: base64,
      mimeType: mimeType,
      originalSize: originalSize,
      compressedSize: compressedSize,
      compressionRatio: `${compressionRatio}%`,
      format: outputFormat,
    });
  } catch (error) {
    console.error("Error compressing image:", error);
    return NextResponse.json(
      { error: "Failed to compress image" },
      { status: 500 }
    );
  }
}
