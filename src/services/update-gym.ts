import type { Gym } from "../generated/prisma/client.js";
import type { GymsRepository } from "../repositories/gyms-repository.js";
import { ResourceNotFoundError } from "./errors/resource-not-found-error.js";

interface UpdateGymUseCaseRequest {
  id: string;
  title?: string | undefined;
  description?: string | null | undefined;
  phone?: string | null | undefined;
  latitude?: number | undefined;
  longitude?: number | undefined;
}

interface UpdateGymUseCaseResponse {
  gym: Gym;
}

export class UpdateGymUseCase {
  constructor(private gymsRepository: GymsRepository) {}

  async execute({
    id,
    title,
    description,
    phone,
    latitude,
    longitude,
  }: UpdateGymUseCaseRequest): Promise<UpdateGymUseCaseResponse> {
    const gym = await this.gymsRepository.update({
      id,
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(phone !== undefined && { phone }),
      ...(latitude !== undefined && { latitude }),
      ...(longitude !== undefined && { longitude }),
    });

    if (!gym) throw new ResourceNotFoundError();

    return {
      gym,
    };
  }
}
