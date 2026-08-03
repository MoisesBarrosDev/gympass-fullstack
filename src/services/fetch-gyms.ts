import type { GymsRepository } from "../repositories/gyms-repository.js";

export class FetchGymsUseCase {
  constructor(private gymsRepository: GymsRepository) {}

  async execute() {
    const gyms = await this.gymsRepository.findMany();

    return {
      gyms,
    };
  }
}
