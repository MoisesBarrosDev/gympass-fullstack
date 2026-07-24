import type { User } from "../generated/prisma/client.js";
import type { UserCreateInput } from "../generated/prisma/models.js";

export interface UsersRepository {
  findById(data: string): Promise<User | null>;
  create(data: UserCreateInput): Promise<User>;
  findByEmail(data: string): Promise<User | null>;
}
