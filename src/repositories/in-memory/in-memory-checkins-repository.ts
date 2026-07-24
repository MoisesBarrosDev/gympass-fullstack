import { randomUUID } from "node:crypto";
import type { CheckIn } from "../../generated/prisma/client.js";
import type { CheckInUncheckedCreateInput } from "../../generated/prisma/models.js";
import type { CheckInsRepository } from "../check-ins-repository.js";

export class InMemoryCheckInsRepository implements CheckInsRepository {
  public items: CheckIn[] = [];

  async findByUserIdOnDate(userId: string, date: Date) {
    const checkOnSameDate = this.items.find(
      (checkIn) => checkIn.user_id === userId,
    );

    if (!checkOnSameDate) {
      return null;
    }
    return checkOnSameDate;
  }

  async create(data: CheckInUncheckedCreateInput) {
    const checkIn = {
      id: randomUUID(),
      created_at: new Date(),
      validated_at: data.validated_at ? new Date(data.validated_at) : null,
      user_id: data.user_id,
      gym_id: data.gym_id,
    };

    this.items.push(checkIn);

    return checkIn;
  }
}
