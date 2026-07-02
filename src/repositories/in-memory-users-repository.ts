import type { UserCreateInput } from "../generated/prisma/models.js";

export class InMemoryUsersRepository {
  public users: any[] = [];
  async create({ name, email, password_hash }: UserCreateInput) {
    this.users.push(name, email, password_hash);
  }
}
