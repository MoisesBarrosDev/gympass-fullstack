import dayjs from "dayjs";
import type { CheckIn } from "../generated/prisma/client.js";
import type { CheckInsRepository } from "../repositories/check-ins-repository.js";
import { CHECK_IN_VALIDATION_WINDOW_IN_MINUTES } from "./check-in-rules.js";
import { CheckInNotExpiredError } from "./errors/check-in-not-expired-error.js";
import { ResourceNotFoundError } from "./errors/resource-not-found-error.js";

interface DeleteExpiredCheckInRequest {
  checkInId: string;
}

interface DeleteExpiredCheckInResponse {
  checkIn: CheckIn;
}

export class DeleteExpiredCheckInUseCase {
  constructor(private checkInsRepository: CheckInsRepository) {}

  async execute({
    checkInId,
  }: DeleteExpiredCheckInRequest): Promise<DeleteExpiredCheckInResponse> {
    const checkIn = await this.checkInsRepository.findCheckInById(checkInId);

    if (!checkIn) {
      throw new ResourceNotFoundError();
    }

    const minutesSinceCreation = dayjs().diff(
      checkIn.created_at,
      "minutes",
      true,
    );

    if (
      checkIn.validated_at ||
      minutesSinceCreation <= CHECK_IN_VALIDATION_WINDOW_IN_MINUTES
    ) {
      throw new CheckInNotExpiredError();
    }

    const deletedCheckIn = await this.checkInsRepository.deleteCheckInById(
      checkIn.id,
    );

    if (!deletedCheckIn) {
      throw new ResourceNotFoundError();
    }

    return { checkIn: deletedCheckIn };
  }
}
