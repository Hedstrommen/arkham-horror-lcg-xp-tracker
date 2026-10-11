import Database from "better-sqlite3";
import { User } from "../../domain/user/user";
import { UserRepository } from "../../domain/user/user-repository";
import { PasswordHash } from "../../domain/value-objects/password-hash";
import { Username } from "../../domain/value-objects/username";

interface UserRow {
  id: string;
  username: string;
  password_hash: string;
}

export class SqliteUserRepository implements UserRepository {
  constructor(private readonly database: Database.Database) {}

  public save(user: User): void {
    this.database
      .prepare(
        `INSERT INTO users (id, username, password_hash)
         VALUES (@id, @username, @passwordHash)
         ON CONFLICT(id) DO UPDATE SET
           username = excluded.username,
           password_hash = excluded.password_hash`
      )
      .run({
        id: user.id,
        username: user.username.toString(),
        passwordHash: user.passwordHash.toString(),
      });
  }

  public findById(userId: string): User | null {
    const userRow = this.database
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(userId) as UserRow | undefined;
    return userRow === undefined ? null : this.reconstituteUser(userRow);
  }

  public findByUsername(username: string): User | null {
    const userRow = this.database
      .prepare("SELECT * FROM users WHERE username = ?")
      .get(username) as UserRow | undefined;
    return userRow === undefined ? null : this.reconstituteUser(userRow);
  }

  private reconstituteUser(userRow: UserRow): User {
    return new User(
      userRow.id,
      Username.fromUserInput(userRow.username),
      PasswordHash.fromStoredHash(userRow.password_hash)
    );
  }
}
