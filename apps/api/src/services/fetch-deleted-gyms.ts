import type { Gym } from "../generated/prisma/client.js";
import type { GymsRepository } from "../repositories/gyms-repository.js";

interface FetchDeletedGymsUseCaseRequest {
  page: number;
}

interface FetchDeletedGymsUseCaseResponse {
  gyms: Gym[];
}

export class FetchDeletedGymsUseCase {
  constructor(private gymsRepository: GymsRepository) {}

  async execute({
    page,
  }: FetchDeletedGymsUseCaseRequest): Promise<FetchDeletedGymsUseCaseResponse> {
    const gyms = await this.gymsRepository.findManyDeletedGyms(page);

    return { gyms };
  }
}
