import type { CheckIn } from "../generated/prisma/client.js";
import type { CheckInsRepository } from "../repositories/check-ins-repository.js";
import { UserId } from "./primitives/user-id.js";

interface FetchUserCheckInsHistoryRequest {
  userId: string;
  page: number;
}

interface FetchUserCheckInsHistoryResponse {
  checkIns: CheckIn[];
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
      checkIns,
    };
  }
}
