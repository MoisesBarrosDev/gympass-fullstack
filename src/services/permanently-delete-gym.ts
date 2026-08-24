import type { Gym } from "../generated/prisma/client.js";
import type { GymsRepository } from "../repositories/gyms-repository.js";
import { ResourceNotFoundError } from "./errors/resource-not-found-error.js";

interface PermanentlyDeleteGymUseCaseRequest {
  id: string;
}

interface PermanentlyDeleteGymUseCaseResponse {
  gym: Gym;
}

export class PermanentlyDeleteGymUseCase {
  constructor(private gymsRepository: GymsRepository) {}

  async execute({
    id,
  }: PermanentlyDeleteGymUseCaseRequest): Promise<PermanentlyDeleteGymUseCaseResponse> {
    const gym = await this.gymsRepository.permanentlyDeleteGymById(id);

    if (!gym) {
      throw new ResourceNotFoundError();
    }

    return { gym };
  }
}
