import type { CheckInsRepository } from "../repositories/check-ins-repository.js";

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
    const checkInsCount = await this.checkInsRepository.countCheckInsByUserId(userId);

    return {
      checkInsCount,
    };
  }
}
