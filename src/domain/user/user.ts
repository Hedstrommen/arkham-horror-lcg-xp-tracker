import { PasswordHash } from "../value-objects/password-hash";
import { Username } from "../value-objects/username";

export class User {
  constructor(
    public readonly id: string,
    public readonly username: Username,
    public readonly passwordHash: PasswordHash
  ) {}
}
