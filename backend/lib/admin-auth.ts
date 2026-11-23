import "server-only";
import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";

const scrypt = promisify(scryptCallback);
export const sessionCookie = "mnhs_admin_session";
const sessionSeconds = 8 * 60 * 60;

function credentials() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const hash = process.env.ADMIN_PASSWORD_HASH;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!email || !hash || !/^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/.test(hash) || !secret || secret.length < 32) return null;
  return { email, hash, secret };
}

export function isAdminConfigured() {
  return credentials() !== null;
}

export async function verifyAdminCredentials(email: string, password: string) {
  const config = credentials();
  if (!config || password.length > 1024) return false;
  const [, salt, expectedHex] = config.hash.split("$");
  const actual = await scrypt(password, Buffer.from(salt, "hex"), 64) as Buffer;
  const expected = Buffer.from(expectedHex, "hex");
  const validPassword = timingSafeEqual(actual, expected);
  return validPassword && email.trim().toLowerCase() === config.email;
}

export function createAdminSession() {
  const config = credentials();
  if (!config) throw new Error("Admin authentication is not configured.");
  const expiry = Math.floor(Date.now() / 1000) + sessionSeconds;
  const payload = `v1.${expiry}.${randomBytes(24).toString("base64url")}`;
  const signature = createHmac("sha256", config.secret)
    .update(`${payload}.${config.email}.${config.hash}`)
    .digest("base64url");
  return { value: `${payload}.${signature}`, maxAge: sessionSeconds };
}

export async function hasAdminSession() {
  const config = credentials();
  if (!config) return false;
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token || token.length > 300) return false;
  const parts = token.split(".");
  if (parts.length !== 4 || parts[0] !== "v1" || !/^\d{10}$/.test(parts[1]) ||
      !/^[\w-]{32}$/.test(parts[2]) || !/^[\w-]{43}$/.test(parts[3])) return false;
  const expiry = Number(parts[1]);
  if (expiry <= Math.floor(Date.now() / 1000) || expiry > Math.floor(Date.now() / 1000) + sessionSeconds) return false;
  const expected = createHmac("sha256", config.secret)
    .update(`${parts.slice(0, 3).join(".")}.${config.email}.${config.hash}`)
    .digest();
  const actual = Buffer.from(parts[3], "base64url");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return origin !== null && origin === new URL(request.url).origin;
}
