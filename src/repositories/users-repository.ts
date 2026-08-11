import type { User } from "../generated/prisma/client.js";
import type { UserCreateInput } from "../generated/prisma/models.js";

export interface UsersRepository {
  findUserById(id: string): Promise<User | null>;
  createUser(data: UserCreateInput): Promise<User>;
  findUserByEmail(email: string): Promise<User | null>;
}
