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
    const gym = await prisma.gym.create({
      data,
    });

    return gym;
  }

  async findGymById(id: string) {
    const gym = await prisma.gym.findFirst({
      where: { id, deleted_at: null },
    });

    return gym;
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
    const deletedGym = await prisma.gym.findFirst({
      where: {
        id,
        deleted_at: { not: null },
      },
    });

    return deletedGym;
  }

  async restoreGymById(id: string) {
    const gym = await this.findDeletedGymById(id);

    if (!gym) return null;

    const restoredGym = await prisma.gym.update({
      where: {
        id,
      },
      data: {
        deleted_at: null,
      },
    });

    return restoredGym;
  }

  async permanentlyDeleteGymById(id: string) {
    const gym = await this.findDeletedGymById(id);

    if (!gym) return null;

    return prisma.gym.delete({ where: { id } });
  }

  async permanentlyDeleteAllGyms() {
    const { count } = await prisma.gym.deleteMany({
      where: { deleted_at: { not: null } },
    });

    return count;
  }

  async countActiveGyms() {
    return prisma.gym.count({ where: { deleted_at: null } });
  }

  async countDeletedGyms() {
    return prisma.gym.count({ where: { deleted_at: { not: null } } });
  }

  async findManyGyms(page: number) {
    const gyms = await prisma.gym.findMany({
      where: { deleted_at: null },
      skip: (page - 1) * 20,
      take: 20,
    });

    return gyms;
  }

  async findManyDeletedGyms(page: number) {
    return prisma.gym.findMany({
      where: {
        deleted_at: { not: null },
      },
      orderBy: {
        deleted_at: "desc",
      },
      skip: (page - 1) * 20,
      take: 20,
    });
  }

  async searchManyGyms(query: string, page: number) {
    const gyms = await prisma.gym.findMany({
      where: {
        title: {
          startsWith: query,
          mode: "insensitive",
        },
        deleted_at: null,
      },

      skip: (page - 1) * 20,
      take: 20,
    });

    return gyms;
  }

  async findManyNearbyGyms({ latitude, longitude, page }: FindManyNearbyProps) {
    const itemsPerPage = 20;
    const offset = (page - 1) * itemsPerPage;

    const gyms = await prisma.$queryRaw<Gym[]>`
      WITH nearby_gyms AS (
        SELECT
          id,
          title,
          description,
          phone,
          latitude,
          longitude,
          deleted_at,
          (
            6371 * ACOS(
              COS(RADIANS(${latitude}))
              * COS(RADIANS(latitude))
              * COS(RADIANS(longitude) - RADIANS(${longitude}))
              + SIN(RADIANS(${latitude}))
              * SIN(RADIANS(latitude))
            )
          ) AS distance
        FROM gyms
        WHERE deleted_at IS NULL
      )
      SELECT
        id,
        title,
        description,
        phone,
        latitude,
        longitude,
        deleted_at
      FROM nearby_gyms
      WHERE distance <= 10
      ORDER BY distance ASC, id ASC
      LIMIT ${itemsPerPage}
      OFFSET ${offset}
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
