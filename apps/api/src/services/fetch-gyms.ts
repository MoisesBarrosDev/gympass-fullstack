import type { Gym } from "../generated/prisma/client.js";
import type { GymsRepository } from "../repositories/gyms-repository.js";

interface FetchGymsUseCaseRequest {
  page: number;
}

interface FetchGymsUseCaseResponse {
  gyms: Gym[];
  total: number;
}

export class FetchGymsUseCase {
  constructor(private gymsRepository: GymsRepository) {}

  async execute({
    page,
  }: FetchGymsUseCaseRequest): Promise<FetchGymsUseCaseResponse> {
    const [gyms, total] = await Promise.all([
      this.gymsRepository.findManyGyms(page),
      this.gymsRepository.countActiveGyms(),
    ]);

    return {
      gyms,
      total,
    };
  }
}
