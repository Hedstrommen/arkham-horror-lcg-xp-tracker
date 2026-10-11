import { Request } from "express";

export const SESSION_COOKIE_NAME = "arkham_session";

export function getSessionId(request: Request): string | null {
  const cookieHeader = request.headers.cookie;
  if (cookieHeader === undefined) {
    return null;
  }
  for (const cookie of cookieHeader.split(";")) {
    const [cookieName, ...cookieValueParts] = cookie.trim().split("=");
    if (cookieName === SESSION_COOKIE_NAME) {
      return cookieValueParts.join("=");
    }
  }
  return null;
}
