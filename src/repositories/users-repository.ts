import type { User } from "../generated/prisma/client.js";
import type { UserCreateInput } from "../generated/prisma/models.js";

export interface UsersRepository {
  create(data: UserCreateInput): Promise<User>;
  findByEmail(data: string): Promise<User | null>;
}
