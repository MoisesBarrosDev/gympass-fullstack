import type { CheckInsRepository } from "../repositories/check-ins-repository.js";

interface GetAllValidatedCheckInsCountResponse {
  checkInsCount: number;
}

export class GetAllValidatedCheckInsCountUseCase {
  constructor(private checkInsRepository: CheckInsRepository) {}

  async execute(): Promise<GetAllValidatedCheckInsCountResponse> {
    const checkInsCount =
      await this.checkInsRepository.countAllValidatedCheckIns();

    return { checkInsCount };
  }
}
