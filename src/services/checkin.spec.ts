import { describe, expect, beforeEach, test } from "vitest";
import { InMemoryCheckInsRepository } from "../repositories/in-memory/in-memory-checkins-repository.js";
import { CheckInUseCase } from "./checkin.js";

let inMemoryCheckInsRepository: InMemoryCheckInsRepository;
let sut: CheckInUseCase;

describe("Check-in Use Case", () => {
  beforeEach(() => {
    ((inMemoryCheckInsRepository = new InMemoryCheckInsRepository()),
      (sut = new CheckInUseCase(inMemoryCheckInsRepository)));
  });

  test("should be able to check in", async () => {
    const { checkIn } = await sut.execute({
      gymId: "gym-01",
      userId: "user-01",
    });

    expect(checkIn.user_id).toEqual("user-01");
    expect(checkIn.gym_id).toEqual("gym-01");
  });
});
