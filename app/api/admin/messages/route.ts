import { NextResponse } from "next/server";
import { getPortalSessionFromRequest } from "@/lib/admin-session";
import { readMessageQueue } from "@/lib/message-queue";

export async function GET(request: Request) {
  const session = getPortalSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  if (!session.isManagement) {
    return NextResponse.json({ ok: false, message: "Access denied." }, { status: 403 });
  }

  const queue = await readMessageQueue();
  return NextResponse.json({
    ok: true,
    messages: queue
  });
}
