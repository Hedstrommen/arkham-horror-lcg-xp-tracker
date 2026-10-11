import { PlainTextPassword } from "./plain-text-password";

export interface PasswordHasher {
  hashPassword(plainTextPassword: PlainTextPassword): PasswordHash;
  verifyPassword(
    plainTextPassword: PlainTextPassword,
    passwordHash: PasswordHash
  ): boolean;
}

export class PasswordHash {
  private constructor(private readonly text: string) {}

  public static fromStoredHash(storedText: string): PasswordHash {
    if (storedText.length === 0) {
      throw new Error("Password hash cannot be empty.");
    }
    return new PasswordHash(storedText);
  }

  public toString(): string {
    return this.text;
  }
}
