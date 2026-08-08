import type { Gym } from "../generated/prisma/client.js";
import type { GymsRepository } from "../repositories/gyms-repository.js";
import { GymAlreadyRestoredError } from "./errors/gym-already-restored-error.js";
import { ResourceNotFoundError } from "./errors/resource-not-found-error.js";

interface RestoreGymUseCaseRequest {
  id: string;
}

interface RestoreGymUseCaseResponse {
  gym: Gym;
}

export class RestoreGymUseCase {
  constructor(private gymsRepository: GymsRepository) {}

  async execute({ id }: RestoreGymUseCaseRequest): Promise<RestoreGymUseCaseResponse> {
    const activeGym = await this.gymsRepository.findGymById(id);

    if (activeGym) {
      throw new GymAlreadyRestoredError();
    }

    const gym = await this.gymsRepository.restoreGymById(id);

    if (!gym) {
      throw new ResourceNotFoundError();
    }

    return { gym };
  }
}
