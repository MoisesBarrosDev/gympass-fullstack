import { describe, expect, beforeEach, test, vi, afterEach } from "vitest";
import { InMemoryCheckInsRepository } from "../repositories/in-memory/in-memory-checkins-repository.js";
import { CheckInUseCase } from "./checkin.js";
import { InMemoryGymsRepository } from "../repositories/in-memory/in-memory-gyms-repository.js";
import { Decimal } from "@prisma/client/runtime/client";
import { MaxDistanceError } from "./errors/max-distance-error.js";
import { MaxNumberOfCheckInsError } from "./errors/max-number-of-check-ins-error.js";
import { ResourceNotFoundError } from "./errors/resource-not-found-error.js";

let inMemoryCheckInsRepository: InMemoryCheckInsRepository;
let inMemoryGymsRepository: InMemoryGymsRepository;
let sut: CheckInUseCase;

describe("Check-in Use Case", () => {
  beforeEach(async () => {
    inMemoryCheckInsRepository = new InMemoryCheckInsRepository();
    inMemoryGymsRepository = new InMemoryGymsRepository();
    sut = new CheckInUseCase(
      inMemoryCheckInsRepository,
      inMemoryGymsRepository,
    );

    await inMemoryGymsRepository.create({
      id: "gym-01",
      title: "JavaScript Gym",
      description: "",
      phone: "",
      latitude: new Decimal(-22.872064),
      longitude: new Decimal(-43.237376),
    });

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("should be able to check in", async () => {
    const { checkIn } = await sut.execute({
      gymId: "gym-01",
      userId: "user-01",
      userLatitude: -22.872064,
      userLongitude: -43.237376,
    });

    expect(checkIn.user_id).toEqual("user-01");
    expect(checkIn.gym_id).toEqual("gym-01");
  });

  test("should not be able to check in twice in the same day", async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0));
    await sut.execute({
      gymId: "gym-01",
      userId: "user-01",
      userLatitude: -22.872064,
      userLongitude: -43.237376,
    });

    await expect(() =>
      sut.execute({
        gymId: "gym-01",
        userId: "user-01",
        userLatitude: -22.872064,
        userLongitude: -43.237376,
      }),
    ).rejects.toBeInstanceOf(MaxNumberOfCheckInsError);
  });

  test("should be able to check in twice but in different days", async () => {
    vi.setSystemTime(new Date(2022, 0, 20, 8, 0, 0));
    await sut.execute({
      gymId: "gym-01",
      userId: "user-01",
      userLatitude: -22.872064,
      userLongitude: -43.237376,
    });
    vi.setSystemTime(new Date(2022, 0, 21, 8, 0, 0));

    const { checkIn } = await sut.execute({
      gymId: "gym-01",
      userId: "user-01",
      userLatitude: -22.872064,
      userLongitude: -43.237376,
    });

    expect(checkIn.id).toEqual(expect.any(String));
  });

  test("should not be able to check in on distant gym", async () => {
    await inMemoryGymsRepository.create({
      id: "gym-02",
      title: "JavaScript Gym",
      description: "",
      phone: "",
      latitude: new Decimal(-22.8574692),
      longitude: new Decimal(-43.2540788),
    });

    await expect(() =>
      sut.execute({
        gymId: "gym-02",
        userId: "user-01",
        userLatitude: -22.872064,
        userLongitude: -43.237376,
      }),
    ).rejects.toBeInstanceOf(MaxDistanceError);
  });

  test("should not be able to check in at a non-existent gym", async () => {
    await expect(
      sut.execute({
        userId: "user-01",
        gymId: "non-existent-gym",
        userLatitude: -27.2092052,
        userLongitude: -49.6401091,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
