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
      orderBy: {
        created_at: "desc",
      },
      skip: (page - 1) * 20,
      take: 20,
    });

    return userCheckIns;
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

  async countCheckInsByUserId(userId: string) {
    const userCheckInsCount = await prisma.checkIn.count({
      where: {
        user_id: userId,
      },
    });

    return userCheckInsCount;
  }
}
