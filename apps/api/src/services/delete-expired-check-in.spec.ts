import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { InMemoryCheckInsRepository } from "../repositories/in-memory/in-memory-checkins-repository.js";
import { DeleteExpiredCheckInUseCase } from "./delete-expired-check-in.js";
import { CheckInNotExpiredError } from "./errors/check-in-not-expired-error.js";
import { ResourceNotFoundError } from "./errors/resource-not-found-error.js";

let checkInsRepository: InMemoryCheckInsRepository;
let sut: DeleteExpiredCheckInUseCase;

describe("Delete Expired Check-in Use Case", () => {
  beforeEach(() => {
    checkInsRepository = new InMemoryCheckInsRepository();
    sut = new DeleteExpiredCheckInUseCase(checkInsRepository);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("should delete an expired check-in", async () => {
    vi.setSystemTime(new Date(2026, 7, 22, 16, 0));
    const checkIn = await checkInsRepository.createCheckIn({
      user_id: "user-01",
      gym_id: "gym-01",
    });
    vi.setSystemTime(new Date(2026, 7, 22, 16, 21));

    await sut.execute({ checkInId: checkIn.id });

    expect(checkInsRepository.items).toHaveLength(0);
  });

  test("should not delete a check-in that has not expired", async () => {
    const checkIn = await checkInsRepository.createCheckIn({
      user_id: "user-01",
      gym_id: "gym-01",
    });

    await expect(
      sut.execute({ checkInId: checkIn.id }),
    ).rejects.toBeInstanceOf(CheckInNotExpiredError);
  });

  test("should not delete a non-existent check-in", async () => {
    await expect(
      sut.execute({ checkInId: "non-existent-check-in" }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
