import { randomUUID } from "node:crypto";
import { Prisma, type Gym } from "../../generated/prisma/client.js";
import type { GymCreateInput } from "../../generated/prisma/models.js";
import type { GymsRepository } from "../gyms-repository.js";

export class InMemoryGymsRepository implements GymsRepository {
  public items: Gym[] = [];

  async findById(id: string) {
    const gym = this.items.find((item) => item.id === id);

    if (!gym) return null;

    return gym;
  }

  async create(data: GymCreateInput) {
    const gym = {
      id: data.id ?? randomUUID(),
      title: data.title,
      description: data.description ?? null,
      phone: data.phone ?? null,
      latitude: new Prisma.Decimal(String(data.latitude)),
      longitude: new Prisma.Decimal(String(data.longitude)),
    };

    this.items.push(gym);

    return gym;
  }
}
