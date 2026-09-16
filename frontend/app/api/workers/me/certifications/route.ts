import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return NextResponse.json({
      status: "success",
      message: "Certification submitted for cooperative verification",
      certification: body,
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Failed to submit certification" }, { status: 500 });
  }
}
