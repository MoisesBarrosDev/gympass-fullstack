import { beforeEach, describe, expect, test } from "vitest";
import { InMemoryCheckInsRepository } from "../repositories/in-memory/in-memory-checkins-repository.js";
import { ValidateCheckInUseCase } from "./validate-check-in.js";
import { ResourceNotFoundError } from "./errors/resource-not-found-error.js";

let inMemoryCheckInsRepository: InMemoryCheckInsRepository;
let sut: ValidateCheckInUseCase;

describe("Validate Check-in Use Case", () => {
  beforeEach(() => {
    inMemoryCheckInsRepository = new InMemoryCheckInsRepository();
    sut = new ValidateCheckInUseCase(inMemoryCheckInsRepository);
  });

  test("should be able to validate a check-in", async () => {
    const createdCheckIn = await inMemoryCheckInsRepository.create({
      gym_id: "gym-01",
      user_id: "user-01",
    });

    const { checkIn } = await sut.execute({
      checkInId: createdCheckIn.id,
    });

    expect(checkIn.validated_at).toEqual(expect.any(Date));
    expect(inMemoryCheckInsRepository.items[0]?.validated_at).toEqual(
      expect.any(Date),
    );
  });

  test("should not be able to validate a non-existent check-in", async () => {
    await expect(
      sut.execute({
        checkInId: "non-existent-check-in",
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
