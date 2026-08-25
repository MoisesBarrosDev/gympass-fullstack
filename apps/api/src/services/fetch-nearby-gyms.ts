import type { Gym } from "../generated/prisma/client.js";
import type { GymsRepository } from "../repositories/gyms-repository.js";

interface FetchNearbyGymsUseCaseRequest {
  userLatitude: number;
  userLongitude: number;
  page: number;
}

interface FetchNearbyGymsUseCaseResponse {
  gyms: Gym[];
}

export class FetchNearbyGymsUseCase {
  constructor(private gymsRepository: GymsRepository) {}

  async execute({
    userLatitude,
    userLongitude,
    page,
  }: FetchNearbyGymsUseCaseRequest): Promise<FetchNearbyGymsUseCaseResponse> {
    const gyms = await this.gymsRepository.findManyNearbyGyms({
      latitude: userLatitude,
      longitude: userLongitude,
      page,
    });

    return {
      gyms,
    };
  }
}
