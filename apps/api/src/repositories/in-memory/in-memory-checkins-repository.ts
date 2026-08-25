import { randomUUID } from "node:crypto";
import type { CheckIn } from "../../generated/prisma/client.js";
import type {
  CheckInsRepository,
  CreateCheckInData,
} from "../check-ins-repository.js";
import dayjs from "dayjs";

export class InMemoryCheckInsRepository implements CheckInsRepository {
  public items: CheckIn[] = [];

  async findCheckInByUserIdOnDate(userId: string, date: Date) {
    const startOfTheDay = dayjs(date).startOf("date");
    const endOfTheDay = dayjs(date).endOf("date");

    const checkOnSameDate = this.items.find((checkIn) => {
      const checkInDate = dayjs(checkIn.created_at);
      const isOnSameDate =
        checkInDate.isAfter(startOfTheDay) && checkInDate.isBefore(endOfTheDay);

      return checkIn.user_id === userId && isOnSameDate;
    });

    if (!checkOnSameDate) {
      return null;
    }
    return checkOnSameDate;
  }

  async findManyCheckInsByUserId(userId: string, page: number) {
    return this.items
      .filter((item) => item.user_id === userId)
      .slice((page - 1) * 20, page * 20);
  }

  async findManyPendingCheckIns(page: number, createdAfter: Date) {
    return this.items
      .filter(
        (item) =>
          item.validated_at === null && item.created_at >= createdAfter,
      )
      .sort((first, second) => second.created_at.getTime() - first.created_at.getTime())
      .slice((page - 1) * 20, page * 20)
      .map((item) => ({
        ...item,
        user: { name: item.user_id, email: "" },
        gym: { title: item.gym_id },
      }));
  }

  async findManyExpiredCheckIns(page: number, createdBefore: Date) {
    return this.items
      .filter(
        (item) =>
          item.validated_at === null && item.created_at < createdBefore,
      )
      .sort((first, second) => second.created_at.getTime() - first.created_at.getTime())
      .slice((page - 1) * 20, page * 20)
      .map((item) => ({
        ...item,
        user: { name: item.user_id, email: "" },
        gym: { title: item.gym_id },
      }));
  }

  async findManyValidatedCheckIns(page: number) {
    return this.items
      .filter((item) => item.validated_at !== null)
      .sort(
        (first, second) =>
          second.validated_at!.getTime() - first.validated_at!.getTime(),
      )
      .slice((page - 1) * 20, page * 20)
      .map((item) => ({
        ...item,
        user: { name: item.user_id, email: "" },
        gym: { title: item.gym_id },
      }));
  }

  async createCheckIn(data: CreateCheckInData) {
    const checkIn: CheckIn = {
      id: randomUUID(),
      created_at: new Date(),
      validated_at: null,
      user_id: data.user_id,
      gym_id: data.gym_id,
    };

    this.items.push(checkIn);

    return checkIn;
  }

  async countValidatedCheckInsByUserId(userId: string): Promise<number> {
    const checkIns = this.items.filter(
      (item) => item.user_id === userId && item.validated_at !== null,
    );

    return checkIns.length;
  }

  async countCheckInsByUserId(userId: string): Promise<number> {
    return this.items.filter((item) => item.user_id === userId).length;
  }

  async countPendingCheckIns(createdAfter: Date): Promise<number> {
    return this.items.filter(
      (item) => item.validated_at === null && item.created_at >= createdAfter,
    ).length;
  }

  async countExpiredCheckIns(createdBefore: Date): Promise<number> {
    return this.items.filter(
      (item) => item.validated_at === null && item.created_at < createdBefore,
    ).length;
  }

  async findCheckInById(id: string) {
    const checkIn = this.items.find((item) => item.id === id);

    if (!checkIn) return null;

    return checkIn;
  }

  async deleteCheckInById(id: string) {
    const checkInIndex = this.items.findIndex((item) => item.id === id);
    const checkIn = this.items[checkInIndex];

    if (!checkIn) return null;

    this.items.splice(checkInIndex, 1);

    return checkIn;
  }

  async saveCheckIn(checkIn: CheckIn): Promise<CheckIn> {
    const checkInIndex = this.items.findIndex((item) => item.id === checkIn.id);

    if (checkInIndex >= 0) {
      this.items[checkInIndex] = checkIn;
    }

    return checkIn;
  }

  async countAllValidatedCheckIns(): Promise<number> {
    return this.items.filter((item) => item.validated_at !== null).length;
  }
}
