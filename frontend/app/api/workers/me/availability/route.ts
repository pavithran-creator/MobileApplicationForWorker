import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return NextResponse.json({
      status: "success",
      message: "Availability schedule updated",
      schedule: body,
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Failed to update availability" }, { status: 500 });
  }
}
