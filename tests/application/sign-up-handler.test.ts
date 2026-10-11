import { describe, expect, it } from "vitest";
import { User } from "../../src/domain/user/user";
import { UserRepository } from "../../src/domain/user/user-repository";
import {
  PasswordHash,
  PasswordHasher,
} from "../../src/domain/value-objects/password-hash";
import { PlainTextPassword } from "../../src/domain/value-objects/plain-text-password";
import { Username } from "../../src/domain/value-objects/username";
import { SignUpHandler } from "../../src/application/use-cases/auth/sign-up-handler";
import { SignInHandler } from "../../src/application/use-cases/auth/sign-in-handler";

class InMemoryUserRepository implements UserRepository {
  public storedUsers: User[] = [];

  save(user: User): void {
    this.storedUsers.push(user);
  }

  findById(userId: string): User | null {
    return this.storedUsers.find((user) => user.id === userId) ?? null;
  }

  findByUsername(username: string): User | null {
    return (
      this.storedUsers.find(
        (user) => user.username.toString() === username
      ) ?? null
    );
  }
}

class ReversiblePasswordHasher implements PasswordHasher {
  hashPassword(plainTextPassword: PlainTextPassword): PasswordHash {
    return PasswordHash.fromStoredHash(
      `reversed:${plainTextPassword.toString().split("").reverse().join("")}`
    );
  }

  verifyPassword(
    plainTextPassword: PlainTextPassword,
    passwordHash: PasswordHash
  ): boolean {
    return this.hashPassword(plainTextPassword).toString() === passwordHash.toString();
  }
}

const userIdSequence = { next: 1 };
const idGenerator = {
  generateCampaignId: () => "unused",
  generateUserId: () => `user-${userIdSequence.next++}`,
};

describe("SignUpHandler", () => {
  it("creates a user and hashes the password", () => {
    const repository = new InMemoryUserRepository();
    const handler = new SignUpHandler(
      repository,
      new ReversiblePasswordHasher(),
      idGenerator
    );

    const userId = handler.handle({ username: "daisy", password: "greenhouse-1" });

    const storedUser = repository.findById(userId);
    expect(storedUser?.username.toString()).toBe("daisy");
    expect(storedUser?.passwordHash.toString()).toBe("reversed:1-esuohneerg");
  });

  it("refuses a duplicate username", () => {
    const repository = new InMemoryUserRepository();
    const handler = new SignUpHandler(
      repository,
      new ReversiblePasswordHasher(),
      idGenerator
    );
    handler.handle({ username: "daisy", password: "greenhouse-1" });

    expect(() =>
      handler.handle({ username: "daisy", password: "other-password" })
    ).toThrow("That username is already taken.");
  });

  it("refuses a too-short password", () => {
    const repository = new InMemoryUserRepository();
    const handler = new SignUpHandler(
      repository,
      new ReversiblePasswordHasher(),
      idGenerator
    );

    expect(() =>
      handler.handle({ username: "daisy", password: "short" })
    ).toThrow();
  });
});

describe("SignInHandler", () => {
  it("returns the user id for correct credentials", () => {
    const repository = new InMemoryUserRepository();
    const signUpHandler = new SignUpHandler(
      repository,
      new ReversiblePasswordHasher(),
      idGenerator
    );
    const userId = signUpHandler.handle({
      username: "roland",
      password: "bureau-agent-1",
    });
    const signInHandler = new SignInHandler(
      repository,
      new ReversiblePasswordHasher()
    );

    expect(
      signInHandler.handle({ username: "roland", password: "bureau-agent-1" })
    ).toBe(userId);
  });

  it("rejects a wrong password", () => {
    const repository = new InMemoryUserRepository();
    const signUpHandler = new SignUpHandler(
      repository,
      new ReversiblePasswordHasher(),
      idGenerator
    );
    signUpHandler.handle({ username: "roland", password: "bureau-agent-1" });
    const signInHandler = new SignInHandler(
      repository,
      new ReversiblePasswordHasher()
    );

    expect(() =>
      signInHandler.handle({ username: "roland", password: "wrong-password" })
    ).toThrow("Invalid username or password.");
  });

  it("rejects an unknown username", () => {
    const signInHandler = new SignInHandler(
      new InMemoryUserRepository(),
      new ReversiblePasswordHasher()
    );

    expect(() =>
      signInHandler.handle({ username: "nobody", password: "whatever-1" })
    ).toThrow("Invalid username or password.");
  });
});
