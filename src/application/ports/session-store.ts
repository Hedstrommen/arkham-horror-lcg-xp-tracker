export interface AuthenticatedSession {
  sessionId: string;
  userId: string;
}

export interface SessionStore {
  createSession(userId: string): AuthenticatedSession;
  findUserIdBySessionId(sessionId: string): string | null;
  deleteSession(sessionId: string): void;
}
