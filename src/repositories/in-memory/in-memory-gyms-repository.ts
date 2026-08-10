import { randomUUID } from "node:crypto";
import { Prisma, type Gym } from "../../generated/prisma/client.js";
import type { GymCreateInput } from "../../generated/prisma/models.js";
import { getDistanceBetweenCoordinates } from "../../utils/get-distance-between-coordinates.js";
import type {
  FindManyNearbyProps,
  GymsRepository,
  UpdateGymData,
} from "../gyms-repository.js";

export class InMemoryGymsRepository implements GymsRepository {
  public items: Gym[] = [];
  public deletedGyms: Gym[] = [];

  async findGymById(id: string) {
    const gym = this.items.find((item) => item.id === id);

    if (!gym) return null;

    return gym;
  }

  async createGym(data: GymCreateInput) {
    const gym = {
      id: data.id ?? randomUUID(),
      title: data.title,
      description: data.description ?? null,
      phone: data.phone ?? null,
      latitude: new Prisma.Decimal(String(data.latitude)),
      longitude: new Prisma.Decimal(String(data.longitude)),
      deleted_at: null,
    };

    this.items.push(gym);

    return gym;
  }

  async updateGym(data: UpdateGymData): Promise<Gym | null> {
    const currentGym = this.items.find((gym) => gym.id === data.id);

    if (!currentGym) {
      return null;
    }

    const updatedGym: Gym = {
      ...currentGym,
      title: data.title ?? currentGym.title,
      description:
        data.description !== undefined
          ? data.description
          : currentGym.description,
      phone: data.phone !== undefined ? data.phone : currentGym.phone,
      latitude:
        data.latitude !== undefined
          ? new Prisma.Decimal(data.latitude)
          : currentGym.latitude,
      longitude:
        data.longitude !== undefined
          ? new Prisma.Decimal(data.longitude)
          : currentGym.longitude,
    };

    const gymIndex = this.items.findIndex((gym) => gym.id === data.id);

    this.items[gymIndex] = updatedGym;

    return updatedGym;
  }

  async deleteGymById(id: string): Promise<Gym | null> {
    const gymIndex = this.items.findIndex((item) => item.id === id);
    const gym = this.items[gymIndex];

    if (!gym) return null;

    this.items.splice(gymIndex, 1);
    this.deletedGyms.push(gym);

    return gym;
  }

  async restoreGymById(id: string): Promise<Gym | null> {
    const gymIndex = this.deletedGyms.findIndex((item) => item.id === id);
    const gym = this.deletedGyms[gymIndex];

    if (!gym) return null;

    this.deletedGyms.splice(gymIndex, 1);
    this.items.push(gym);

    return gym;
  }

  async findDeletedGymById(id: string) {
    const gym = this.deletedGyms.find((item) => item.id === id);

    if (!gym) return null;

    return gym;
  }

  async findManyGyms(): Promise<Gym[]> {
    return this.items;
  }

  async findManyNearbyGyms(params: FindManyNearbyProps): Promise<Gym[]> {
    return this.items.filter((item) => {
      const distance = getDistanceBetweenCoordinates(
        { latitude: params.latitude, longitude: params.longitude },
        {
          latitude: item.latitude.toNumber(),
          longitude: item.longitude.toNumber(),
        },
      );

      return distance <= 10;
    });
  }

  async searchManyGyms(query: string, page: number): Promise<Gym[]> {
    return this.items
      .filter((item) => item.title.includes(query))
      .slice((page - 1) * 20, page * 20);
  }
}
