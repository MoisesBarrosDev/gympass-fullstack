import type { Gym } from "../generated/prisma/client.js";
import type { GymsRepository } from "../repositories/gyms-repository.js";

interface FetchGymsUseCaseRequest {
  page: number;
}

interface FetchGymsUseCaseResponse {
  gyms: Gym[];
}

export class FetchGymsUseCase {
  constructor(private gymsRepository: GymsRepository) {}

  async execute({
    page,
  }: FetchGymsUseCaseRequest): Promise<FetchGymsUseCaseResponse> {
    const gyms = await this.gymsRepository.findManyGyms(page);

    return {
      gyms,
    };
  }
}
