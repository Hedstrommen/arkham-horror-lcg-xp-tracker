import { User } from "./user";

export interface UserRepository {
  save(user: User): void;
  findById(userId: string): User | null;
  findByUsername(username: string): User | null;
}
