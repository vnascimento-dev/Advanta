import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  clearSessionCookie();
  const url = new URL(req.url);
  const base = `${url.protocol}//${url.host}`;
  return NextResponse.redirect(new URL("/login", base));
}
