// Auth guard placeholder — will use Better Auth once installed
import { NextResponse } from "next/server";

export async function requireSession() {
  // Placeholder: no session until Better Auth is set up
  return {
    session: null as { user: { id: string; role: string } } | null,
    error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
  };
}

export async function requireRole(role: string | string[]) {
  return requireSession();
}
