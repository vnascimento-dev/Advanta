import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./prisma";
import type { Role } from "@prisma/client";

const COOKIE_NAME = "pjecrm_session";

function secretKey() {
  const secret = process.env.AUTH_SECRET || "CHANGE_ME_TO_A_LONG_RANDOM_SECRET";
  return new TextEncoder().encode(secret);
}

export type SessionUser = { id: string; email: string; name: string; role: Role };

export async function createSessionCookie(user: SessionUser) {
  const jwt = await new SignJWT({ sub: user.id, email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());

  cookies().set(COOKIE_NAME, jwt, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export function clearSessionCookie() {
  cookies().set(COOKIE_NAME, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
}

export async function getSession(): Promise<SessionUser | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey());
    const id = String(payload.sub || "");
    if (!id) return null;

    const u = await prisma.user.findUnique({ where: { id } });
    if (!u || !u.isActive) return null;

    return { id: u.id, email: u.email, name: u.name, role: u.role };
  } catch {
    return null;
  }
}

export async function requireRole(roles: Role[]) {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHENTICATED");
  if (!roles.includes(session.role)) throw new Error("FORBIDDEN");
  return session;
}
