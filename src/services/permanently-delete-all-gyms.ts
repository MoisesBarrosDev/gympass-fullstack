import type { GymsRepository } from "../repositories/gyms-repository.js";

interface PermanentlyDeleteAllGymsUseCaseResponse {
  count: number;
}

export class PermanentlyDeleteAllGymsUseCase {
  constructor(private gymsRepository: GymsRepository) {}

  async execute(): Promise<PermanentlyDeleteAllGymsUseCaseResponse> {
    const count = await this.gymsRepository.permanentlyDeleteAllGyms();

    return { count };
  }
}
