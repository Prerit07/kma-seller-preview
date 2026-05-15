import { NextResponse } from "next/server";

const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;

function clearCookie(name: string, httpOnly = true): string {
  let cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; SameSite=Lax`;
  if (httpOnly) cookie += "; HttpOnly";
  if (COOKIE_DOMAIN) cookie += `; Domain=${COOKIE_DOMAIN}`;
  return cookie;
}

export async function POST() {
  const response = NextResponse.json({ message: "Cookies cleared" });
  response.headers.append("Set-Cookie", clearCookie("accessToken"));
  response.headers.append("Set-Cookie", clearCookie("refreshToken"));
  response.headers.append("Set-Cookie", clearCookie("kma_user", false));

  return response;
}
