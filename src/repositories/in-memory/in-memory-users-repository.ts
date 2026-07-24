import { randomUUID } from "node:crypto";
import type { User } from "../../generated/prisma/client.js";
import type { UserCreateInput } from "../../generated/prisma/models.js";
import type { UsersRepository } from "../users-repository.js";

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = [];

    async findById(id: string) {
    const user = this.items.find((item) => item.id === id);

    if (!user) return null;

    return user;
  }


  async findByEmail(email: string) {
    const user = this.items.find((item) => item.email === email);

    if (!user) return null;

    return user;
  }

  async create(data: UserCreateInput) {
    const user = {
      id: randomUUID(),
      name: data.name,
      email: data.email,
      password_hash: data.password_hash,
      created_at: new Date(),
    };
    this.items.push(user);

    return user;
  }
}
