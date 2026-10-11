import { Request, Response, Router } from "express";
import { SessionStore } from "../../application/ports/session-store";
import { SignInHandler } from "../../application/use-cases/auth/sign-in-handler";
import { SignUpHandler } from "../../application/use-cases/auth/sign-up-handler";
import { SESSION_COOKIE_NAME } from "../auth/current-user";
import { renderSignInPage, renderSignUpPage } from "../views/auth-view";

const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function createAuthRoutes(
  signUpHandler: SignUpHandler,
  signInHandler: SignInHandler,
  sessionStore: SessionStore
): Router {
  const router = Router();

  router.get("/auth/sign-in", (request: Request, response: Response) => {
    response.send(renderSignInPage(null));
  });

  router.get("/auth/sign-up", (request: Request, response: Response) => {
    response.send(renderSignUpPage(null));
  });

  router.post("/auth/sign-up", (request: Request, response: Response) => {
    try {
      const userId = signUpHandler.handle({
        username: String(request.body.username ?? ""),
        password: String(request.body.password ?? ""),
      });
      openSession(response, sessionStore.createSession(userId));
      response.redirect("/");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      response.status(400).send(renderSignUpPage(errorMessage));
    }
  });

  router.post("/auth/sign-in", (request: Request, response: Response) => {
    try {
      const userId = signInHandler.handle({
        username: String(request.body.username ?? ""),
        password: String(request.body.password ?? ""),
      });
      openSession(response, sessionStore.createSession(userId));
      response.redirect("/");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      response.status(400).send(renderSignInPage(errorMessage));
    }
  });

  router.post("/auth/sign-out", (request: Request, response: Response) => {
    const cookies = request.headers.cookie ?? "";
    for (const cookie of cookies.split(";")) {
      const [cookieName, ...cookieValueParts] = cookie.trim().split("=");
      if (cookieName === SESSION_COOKIE_NAME) {
        sessionStore.deleteSession(cookieValueParts.join("="));
      }
    }
    response.clearCookie(SESSION_COOKIE_NAME);
    response.redirect("/auth/sign-in");
  });

  return router;
}

function openSession(
  response: Response,
  session: { sessionId: string }
): void {
  response.cookie(SESSION_COOKIE_NAME, session.sessionId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS * 1000,
  });
}
