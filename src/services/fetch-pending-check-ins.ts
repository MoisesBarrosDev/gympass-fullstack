import dayjs from "dayjs";
import type {
  CheckInsRepository,
  CheckInWithDetails,
} from "../repositories/check-ins-repository.js";
import { CHECK_IN_VALIDATION_WINDOW_IN_MINUTES } from "./check-in-rules.js";

interface FetchPendingCheckInsRequest {
  page: number;
}

interface FetchPendingCheckInsResponse {
  checkIns: CheckInWithDetails[];
}

export class FetchPendingCheckInsUseCase {
  constructor(private checkInsRepository: CheckInsRepository) {}

  async execute({
    page,
  }: FetchPendingCheckInsRequest): Promise<FetchPendingCheckInsResponse> {
    const createdAfter = dayjs()
      .subtract(CHECK_IN_VALIDATION_WINDOW_IN_MINUTES, "minutes")
      .toDate();
    const checkIns = await this.checkInsRepository.findManyPendingCheckIns(
      page,
      createdAfter,
    );

    return { checkIns };
  }
}
