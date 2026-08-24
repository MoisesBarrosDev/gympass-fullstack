import type { CheckInsRepository } from "../repositories/check-ins-repository.js";
import { UserId } from "./primitives/user-id.js";

interface GetUserCheckInsCountUseCaseRequest {
  userId: string;
}

interface GetUserCheckInsCountUseCaseResponse {
  checkInsCount: number;
}

export class GetUserCheckInsCountUseCase {
  constructor(private checkInsRepository: CheckInsRepository) {}

  async execute({
    userId,
  }: GetUserCheckInsCountUseCaseRequest): Promise<GetUserCheckInsCountUseCaseResponse> {
    const normalizedUserId = UserId.create(userId);
    const checkInsCount =
      await this.checkInsRepository.countValidatedCheckInsByUserId(
        normalizedUserId.value,
      );

    return {
      checkInsCount,
    };
  }
}
