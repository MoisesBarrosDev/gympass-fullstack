import type { Gym } from "../generated/prisma/client.js";
import type { GymsRepository } from "../repositories/gyms-repository.js";
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
    const gymRemoved = await this.gymsRepository.delete(id);

    if (!gymRemoved) {
      throw new ResourceNotFoundError();
    }

    return {
      gymRemoved
    };
    
  }
}
