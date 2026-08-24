import dayjs from "dayjs";
import type { CheckIn } from "../generated/prisma/client.js";
import type { CheckInsRepository } from "../repositories/check-ins-repository.js";
import { CHECK_IN_VALIDATION_WINDOW_IN_MINUTES } from "./check-in-rules.js";
import { UserId } from "./primitives/user-id.js";

interface FetchUserCheckInsHistoryRequest {
  userId: string;
  page: number;
}

interface FetchUserCheckInsHistoryResponse {
  checkIns: Array<
    CheckIn & { status: "VALIDATED" | "PENDING" | "EXPIRED" }
  >;
}

export class FetchUserCheckInsHistoryUseCase {
  constructor(private checkInsRepository: CheckInsRepository) {}

  async execute({
    userId,
    page,
  }: FetchUserCheckInsHistoryRequest): Promise<FetchUserCheckInsHistoryResponse> {
    const normalizedUserId = UserId.create(userId);
    const checkIns = await this.checkInsRepository.findManyCheckInsByUserId(
      normalizedUserId.value,
      page,
    );

    return {
      checkIns: checkIns.map((checkIn) => {
        if (checkIn.validated_at) {
          return { ...checkIn, status: "VALIDATED" as const };
        }

        const minutesSinceCreation = dayjs().diff(
          checkIn.created_at,
          "minutes",
          true,
        );
        const status =
          minutesSinceCreation > CHECK_IN_VALIDATION_WINDOW_IN_MINUTES
            ? ("EXPIRED" as const)
            : ("PENDING" as const);

        return { ...checkIn, status };
      }),
    };
  }
}
