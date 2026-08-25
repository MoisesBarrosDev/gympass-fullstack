import type { Gym } from "../generated/prisma/client.js";
import type { GymsRepository } from "../repositories/gyms-repository.js";

interface FetchDeletedGymsUseCaseRequest {
  page: number;
}

interface FetchDeletedGymsUseCaseResponse {
  gyms: Gym[];
  total: number;
}

export class FetchDeletedGymsUseCase {
  constructor(private gymsRepository: GymsRepository) {}

  async execute({
    page,
  }: FetchDeletedGymsUseCaseRequest): Promise<FetchDeletedGymsUseCaseResponse> {
    const [gyms, total] = await Promise.all([
      this.gymsRepository.findManyDeletedGyms(page),
      this.gymsRepository.countDeletedGyms(),
    ]);

    return { gyms, total };
  }
}
