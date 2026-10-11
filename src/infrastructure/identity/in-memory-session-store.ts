import { randomUUID } from "node:crypto";
import {
  AuthenticatedSession,
  SessionStore,
} from "../../application/ports/session-store";

export class InMemorySessionStore implements SessionStore {
  private sessionsBySessionId: Map<string, string> = new Map();

  public createSession(userId: string): AuthenticatedSession {
    const sessionId = randomUUID();
    this.sessionsBySessionId.set(sessionId, userId);
    return { sessionId, userId };
  }

  public findUserIdBySessionId(sessionId: string): string | null {
    return this.sessionsBySessionId.get(sessionId) ?? null;
  }

  public deleteSession(sessionId: string): void {
    this.sessionsBySessionId.delete(sessionId);
  }
}
