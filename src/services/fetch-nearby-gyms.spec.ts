import { expect, describe, test, beforeEach } from "vitest";
import { InMemoryGymsRepository } from "../repositories/in-memory/in-memory-gyms-repository.js";
import { FetchNearbyGymsUseCase } from "./fetch-nearby-gyms.js";

let inMemoryGymsRepository: InMemoryGymsRepository;
let sut: FetchNearbyGymsUseCase;

describe("Fetch Nearby Gyms Use Case", () => {
  beforeEach(() => {
    inMemoryGymsRepository = new InMemoryGymsRepository();
    sut = new FetchNearbyGymsUseCase(inMemoryGymsRepository);
  });

  test("should be able to fetch nearby gyms", async () => {
    await inMemoryGymsRepository.createGym({
      title: "JavaScript Gym",
      latitude: -22.7995141,
      longitude: -43.314695,
    });
    await inMemoryGymsRepository.createGym({
      title: "TypeScript Gym",
      latitude: -22.332064,
      longitude: -21.217064,
    });

    const { gyms } = await sut.execute({
      userLatitude: -22.332064,
      userLongitude: -21.217064,
      page: 1,
    });

    expect(gyms).toHaveLength(1);
    expect(gyms).toEqual([
      expect.objectContaining({ title: "TypeScript Gym" }),
    ]);
  });
});
