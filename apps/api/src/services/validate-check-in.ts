import dayjs from "dayjs";
import type { CheckIn } from "../generated/prisma/client.js";
import type { CheckInsRepository } from "../repositories/check-ins-repository.js";
import { CHECK_IN_VALIDATION_WINDOW_IN_MINUTES } from "./check-in-rules.js";
import { LateCheckInValidationError } from "./errors/late-check-in-validation-error.js";
import { ResourceNotFoundError } from "./errors/resource-not-found-error.js";

interface ValidateCheckInUseCaseRequest {
  checkInId: string;
}

interface ValidateCheckInUseCaseResponse {
  checkIn: CheckIn;
}

export class ValidateCheckInUseCase {
  constructor(private checkInsRepository: CheckInsRepository) {}

  async execute({
    checkInId,
  }: ValidateCheckInUseCaseRequest): Promise<ValidateCheckInUseCaseResponse> {
    const checkIn = await this.checkInsRepository.findCheckInById(checkInId);

    if (!checkIn) {
      throw new ResourceNotFoundError();
    }

    const distanceInMinutesFromCheckInCreation = dayjs(new Date()).diff(
      checkIn.created_at,
      "minutes",
      true,
    );

    if (
      distanceInMinutesFromCheckInCreation >
      CHECK_IN_VALIDATION_WINDOW_IN_MINUTES
    ) {
      throw new LateCheckInValidationError();
    }

    checkIn.validated_at = new Date();

    await this.checkInsRepository.saveCheckIn(checkIn);

    return { checkIn };
  }
}
