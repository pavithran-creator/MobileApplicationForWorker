import { NextRequest, NextResponse } from "next/server";
import { parseNaturalLanguage } from "@/lib/supabase/nlParser";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text = "" } = body;
    if (!text.trim()) {
      return NextResponse.json({ detail: "Query text is required" }, { status: 400 });
    }

    const parsed = parseNaturalLanguage(text);
    return NextResponse.json(parsed);
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "NLP parsing failed" }, { status: 500 });
  }
}
