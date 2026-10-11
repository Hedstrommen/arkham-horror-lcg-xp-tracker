import { User } from "../../../domain/user/user";
import { UserRepository } from "../../../domain/user/user-repository";
import { PasswordHasher } from "../../../domain/value-objects/password-hash";
import { PlainTextPassword } from "../../../domain/value-objects/plain-text-password";
import { Username } from "../../../domain/value-objects/username";
import { IdGenerator } from "../../ports/id-generator";
import { SignUpCommand } from "./auth-commands";

export class SignUpHandler {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly idGenerator: IdGenerator
  ) {}

  public handle(command: SignUpCommand): string {
    const username = Username.fromUserInput(command.username);
    const plainTextPassword = PlainTextPassword.fromUserInput(command.password);

    if (this.userRepository.findByUsername(username.toString()) !== null) {
      throw new Error("That username is already taken.");
    }

    const user = new User(
      this.idGenerator.generateUserId(),
      username,
      this.passwordHasher.hashPassword(plainTextPassword)
    );
    this.userRepository.save(user);
    return user.id;
  }
}
