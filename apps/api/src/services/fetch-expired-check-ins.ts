import dayjs from "dayjs";
import type {
  CheckInsRepository,
  CheckInWithDetails,
} from "../repositories/check-ins-repository.js";
import { CHECK_IN_VALIDATION_WINDOW_IN_MINUTES } from "./check-in-rules.js";

interface FetchExpiredCheckInsRequest {
  page: number;
}

interface FetchExpiredCheckInsResponse {
  checkIns: CheckInWithDetails[];
  total: number;
}

export class FetchExpiredCheckInsUseCase {
  constructor(private checkInsRepository: CheckInsRepository) {}

  async execute({
    page,
  }: FetchExpiredCheckInsRequest): Promise<FetchExpiredCheckInsResponse> {
    const createdBefore = dayjs()
      .subtract(CHECK_IN_VALIDATION_WINDOW_IN_MINUTES, "minutes")
      .toDate();
    const [checkIns, total] = await Promise.all([
      this.checkInsRepository.findManyExpiredCheckIns(page, createdBefore),
      this.checkInsRepository.countExpiredCheckIns(createdBefore),
    ]);

    return { checkIns, total };
  }
}
