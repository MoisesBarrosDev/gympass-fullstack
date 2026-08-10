import { Prisma, type Gym } from "../../generated/prisma/client.js";
import type { GymCreateInput } from "../../generated/prisma/models.js";
import { prisma } from "../../lib/prisma.js";
import type {
  FindManyNearbyProps,
  GymsRepository,
  UpdateGymData,
} from "../gyms-repository.js";

export class PrismaGymsRepository implements GymsRepository {
  async createGym(data: GymCreateInput) {
    const createdGym = await prisma.gym.create({
      data,
    });

    return createdGym;
  }
  async findGymById(id: string) {
    const findGym = await prisma.gym.findFirst({
      where: { id, deleted_at: null },
    });

    return findGym;
  }

  async deleteGymById(id: string) {
    const gym = await this.findGymById(id);

    if (!gym) return null;

    const deletedGym = await prisma.gym.update({
      where: {
        id,
      },
      data: {
        deleted_at: new Date(),
      },
    });

    return deletedGym;
  }

  async findDeletedGymById(id: string) {
    const findDeletedGym = await prisma.gym.findFirst({
      where: {
        id,
        deleted_at: { not: null },
      },
    });

    return findDeletedGym;
  }

  async restoreGymById(id: string) {
    const gym = await this.findDeletedGymById(id);

    if (!gym) return null;

    const restoreGym = await prisma.gym.update({
      where: {
        id,
      },
      data: {
        deleted_at: null,
      },
    });

    return restoreGym;
  }

  async findManyGyms() {
    const findManyGyms = await prisma.gym.findMany({
      where: { deleted_at: null },
    });

    return findManyGyms;
  }

  async searchManyGyms(query: string, page: number) {
    const searchGyms = await prisma.gym.findMany({
      where: {
        title: {
          contains: query,
          mode: "insensitive",
        },
        deleted_at: null,
      },

      skip: (page - 1) * 20,
      take: 20,
    });

    return searchGyms;
  }

  async findManyNearbyGyms({ latitude, longitude }: FindManyNearbyProps) {
    const gyms = await prisma.$queryRaw<Gym[]>`
      SELECT *
      FROM gyms
      WHERE deleted_at IS NULL
      AND (
        6371 * ACOS(
          COS(RADIANS(${latitude}))
          * COS(RADIANS(latitude))
          * COS(RADIANS(longitude) - RADIANS(${longitude}))
          + SIN(RADIANS(${latitude}))
          * SIN(RADIANS(latitude))
        )
      ) <= 10
    `;

    return gyms;
  }

  async updateGym(data: UpdateGymData) {
    const { id, ...fields } = data;
    const updateData = Object.fromEntries(
      Object.entries(fields).filter(([, value]) => value !== undefined),
    ) as Prisma.GymUpdateInput;

    const gym = await this.findGymById(id);

    if (!gym) return null;

    const updatedGym = await prisma.gym.update({
      where: { id },
      data: updateData,
    });

    return updatedGym;
  }
}
