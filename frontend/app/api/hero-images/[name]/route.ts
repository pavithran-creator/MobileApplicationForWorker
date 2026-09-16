import { NextRequest, NextResponse } from "next/server";
import fs from "fs";

const IMAGE_PATHS: Record<string, string> = {
  plumber: "C:\\Users\\PAVITHRAN S\\.gemini\\antigravity-ide\\brain\\c5592688-3931-42c3-b310-742de098d889\\plumber_repair_pipe_1789463980224.jpg",
  carpenter: "C:\\Users\\PAVITHRAN S\\.gemini\\antigravity-ide\\brain\\c5592688-3931-42c3-b310-742de098d889\\carpenter_wood_work_1789464092018.jpg",
  electrical: "C:\\Users\\PAVITHRAN S\\.gemini\\antigravity-ide\\brain\\c5592688-3931-42c3-b310-742de098d889\\kitchen_repair_tech_1789462149983.jpg",
  appliance: "C:\\Users\\PAVITHRAN S\\.gemini\\antigravity-ide\\brain\\c5592688-3931-42c3-b310-742de098d889\\ac_service_tech_1789462101818.jpg",
};

export async function GET(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  const key = params.name.replace(/\.jpe?g$/i, "");
  const filePath = IMAGE_PATHS[key];

  if (!filePath || !fs.existsSync(filePath)) {
    return new NextResponse("Image not found", { status: 404 });
  }

  const buffer = fs.readFileSync(filePath);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
