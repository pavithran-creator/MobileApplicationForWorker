import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/supabase/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { skill_name } = body;

    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();

    let user = null;
    if (token.startsWith("sb-token-")) {
      const uid = parseInt(token.split("-")[2], 10);
      user = dbStore.users.find(u => u.id === uid);
    }
    if (!user) {
      user = dbStore.users.find(u => u.role === "WORKER") || dbStore.users[7];
    }

    if (!user.skills) {
      user.skills = [];
    }
    if (skill_name && !user.skills.includes(skill_name)) {
      user.skills.push(skill_name);
    }

    return NextResponse.json({
      status: "success",
      message: `Skill '${skill_name}' updated on profile`,
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Failed to update skill" }, { status: 500 });
  }
}
