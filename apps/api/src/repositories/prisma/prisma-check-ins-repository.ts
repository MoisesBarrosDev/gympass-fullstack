import type { CheckIn } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import type {
  CheckInsRepository,
  CreateCheckInData,
} from "../check-ins-repository.js";
import dayjs from "dayjs";

export class PrismaCheckInsRepository implements CheckInsRepository {
  async findCheckInById(id: string) {
    const checkIn = await prisma.checkIn.findUnique({
      where: {
        id,
      },
    });

    return checkIn;
  }

  async createCheckIn(data: CreateCheckInData) {
    const checkIn = await prisma.checkIn.create({
      data,
    });

    return checkIn;
  }

  async findCheckInByUserIdOnDate(userId: string, date: Date) {
    const startOfTheDay = dayjs(date).startOf("day").toDate();
    const endOfTheDay = dayjs(date).endOf("day").toDate();
    const checkInOnSameDate = await prisma.checkIn.findFirst({
      where: {
        user_id: userId,
        created_at: {
          gte: startOfTheDay,
          lte: endOfTheDay,
        },
      },
    });

    return checkInOnSameDate;
  }

  async findManyCheckInsByUserId(userId: string, page: number) {
    const userCheckIns = await prisma.checkIn.findMany({
      where: {
        user_id: userId,
      },
      include: {
        gym: { select: { title: true } },
      },
      orderBy: {
        created_at: "desc",
      },
      skip: (page - 1) * 20,
      take: 20,
    });

    return userCheckIns;
  }

  async findManyPendingCheckIns(page: number, createdAfter: Date) {
    return prisma.checkIn.findMany({
      where: {
        validated_at: null,
        created_at: { gte: createdAfter },
      },
      include: {
        user: { select: { name: true, email: true } },
        gym: { select: { title: true } },
      },
      orderBy: {
        created_at: "desc",
      },
      skip: (page - 1) * 20,
      take: 20,
    });
  }

  async findManyExpiredCheckIns(page: number, createdBefore: Date) {
    return prisma.checkIn.findMany({
      where: {
        validated_at: null,
        created_at: { lt: createdBefore },
      },
      include: {
        user: { select: { name: true, email: true } },
        gym: { select: { title: true } },
      },
      orderBy: {
        created_at: "desc",
      },
      skip: (page - 1) * 20,
      take: 20,
    });
  }

  async findManyValidatedCheckIns(page: number) {
    return prisma.checkIn.findMany({
      where: {
        validated_at: { not: null },
      },
      include: {
        user: { select: { name: true, email: true } },
        gym: { select: { title: true } },
      },
      orderBy: {
        validated_at: "desc",
      },
      skip: (page - 1) * 20,
      take: 20,
    });
  }

  async deleteCheckInById(id: string) {
    const checkIn = await this.findCheckInById(id);

    if (!checkIn) return null;

    return prisma.checkIn.delete({ where: { id } });
  }

  async saveCheckIn(checkIn: CheckIn) {
    const updatedCheckIn = await prisma.checkIn.update({
      where: {
        id: checkIn.id,
      },
      data: {
        validated_at: checkIn.validated_at,
      },
    });

    return updatedCheckIn;
  }

  async countValidatedCheckInsByUserId(userId: string) {
    const userCheckInsCount = await prisma.checkIn.count({
      where: {
        user_id: userId,
        validated_at: { not: null },
      },
    });

    return userCheckInsCount;
  }

  async countAllValidatedCheckIns() {
    return prisma.checkIn.count({
      where: { validated_at: { not: null } },
    });
  }
}
