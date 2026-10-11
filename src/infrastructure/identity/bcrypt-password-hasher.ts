import bcrypt from "bcryptjs";
import {
  PasswordHash,
  PasswordHasher,
} from "../../domain/value-objects/password-hash";
import { PlainTextPassword } from "../../domain/value-objects/plain-text-password";

const BCRYPT_SALT_ROUNDS = 10;

export class BcryptPasswordHasher implements PasswordHasher {
  public hashPassword(plainTextPassword: PlainTextPassword): PasswordHash {
    const salt = bcrypt.genSaltSync(BCRYPT_SALT_ROUNDS);
    return PasswordHash.fromStoredHash(
      bcrypt.hashSync(plainTextPassword.toString(), salt)
    );
  }

  public verifyPassword(
    plainTextPassword: PlainTextPassword,
    passwordHash: PasswordHash
  ): boolean {
    return bcrypt.compareSync(
      plainTextPassword.toString(),
      passwordHash.toString()
    );
  }
}
