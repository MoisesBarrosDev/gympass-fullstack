import type { CheckIn } from "../generated/prisma/client.js";
import type { CheckInsRepository } from "../repositories/check-ins-repository.js";
import type { GymsRepository } from "../repositories/gyms-repository.js";
import { ResourceNotFoundError } from "./errors/resource-not-found-error.js";

interface CheckInUseCaseRequest {
  userId: string;
  gymId: string;
  userLatitude: Number;
  userLongitude: Number;
}

interface CheckInUseCaseResponse {
  checkIn: CheckIn;
}

export class CheckInUseCase {
  constructor(
    private checkInsRepository: CheckInsRepository,
    private gymsRepository: GymsRepository,
  ) {}

  async execute({
    userId,
    gymId,
  }: CheckInUseCaseRequest): Promise<CheckInUseCaseResponse> {
    const gym = await this.gymsRepository.findById(gymId);

    if (!gym) {
      throw new ResourceNotFoundError();
    }

    // Calculate distance between user and gym

    const checkInOnSameDay = await this.checkInsRepository.findByUserIdOnDate(
      userId,
      new Date(),
    );

    if (checkInOnSameDay) {
      throw new Error();
    }

    const checkIn = await this.checkInsRepository.create({
      user_id: userId,
      gym_id: gymId,
    });

    return {
      checkIn,
    };
  }
}
