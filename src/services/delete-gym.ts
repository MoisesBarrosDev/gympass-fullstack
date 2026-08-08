import type { Gym } from "../generated/prisma/client.js";
import type { GymsRepository } from "../repositories/gyms-repository.js";
import { GymAlreadyDeletedError } from "./errors/gym-already-deleted-error.js";
import { ResourceNotFoundError } from "./errors/resource-not-found-error.js";

interface DeleteGymUseCaseRequest {
  id: string;
}

interface DeleteGymUseCaseResponse {
  gymRemoved: Gym;
}

export class DeleteGymUseCase {
  constructor(private gymsRepository: GymsRepository) {}

  async execute({
    id,
  }: DeleteGymUseCaseRequest): Promise<DeleteGymUseCaseResponse> {
    const deletedGym = await this.gymsRepository.findDeletedGymById(id);

    if (deletedGym) {
      throw new GymAlreadyDeletedError();
    }

    const gymRemoved = await this.gymsRepository.deleteGymById(id);

    if (!gymRemoved) {
      throw new ResourceNotFoundError();
    }

    return {
      gymRemoved,
    };
  }
}
