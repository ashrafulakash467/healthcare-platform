import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import path from "path";

const doctorImagesDir = path.join(
  process.cwd(),
  "public",
  "images",
  "doctors",
);

const allowedExtensions = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".avif",
]);

export async function GET() {
  try {
    const entries = await readdir(doctorImagesDir, { withFileTypes: true });

    const images = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => allowedExtensions.has(path.extname(name).toLowerCase()))
      .sort((a, b) => a.localeCompare(b))
      .map((name) => `/images/doctors/${name}`);

    return NextResponse.json({ images });
  } catch {
    return NextResponse.json({ images: [] }, { status: 200 });
  }
}
