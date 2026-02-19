import crypto from "crypto";

function masterKey(): Buffer {
  const raw = process.env.PJE_MASTER_KEY || process.env.AUTH_SECRET || "CHANGE_ME";
  // Derive a 32-byte key even if env is short.
  return crypto.createHash("sha256").update(raw).digest();
}

export function encryptString(plain: string): string {
  const iv = crypto.randomBytes(12);
  const key = masterKey();
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(Buffer.from(plain, "utf8")), cipher.final()]);
  const tag = cipher.getAuthTag();
  // v1:<iv>:<tag>:<data>
  return `v1:${iv.toString("base64")}:${tag.toString("base64")}:${enc.toString("base64")}`;
}

export function decryptString(payload: string): string {
  const [v, ivB64, tagB64, dataB64] = payload.split(":");
  if (v !== "v1" || !ivB64 || !tagB64 || !dataB64) throw new Error("INVALID_PAYLOAD");
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const data = Buffer.from(dataB64, "base64");
  const key = masterKey();
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return dec.toString("utf8");
}
