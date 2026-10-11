import { UserRepository } from "../../../domain/user/user-repository";
import { PasswordHasher } from "../../../domain/value-objects/password-hash";
import { PlainTextPassword } from "../../../domain/value-objects/plain-text-password";
import { SignInCommand } from "./auth-commands";

export class SignInHandler {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  public handle(command: SignInCommand): string {
    const user = this.userRepository.findByUsername(command.username.trim());
    if (user === null) {
      throw new Error("Invalid username or password.");
    }

    const passwordMatches = this.passwordHasher.verifyPassword(
      PlainTextPassword.fromUserInput(command.password),
      user.passwordHash
    );
    if (!passwordMatches) {
      throw new Error("Invalid username or password.");
    }

    return user.id;
  }
}
