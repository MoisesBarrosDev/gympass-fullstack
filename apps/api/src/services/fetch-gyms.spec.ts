import { describe, test, beforeEach, expect } from "vitest";
import { FetchGymsUseCase } from "./fetch-gyms.js";
import { InMemoryGymsRepository } from "../repositories/in-memory/in-memory-gyms-repository.js";

let inMemoryGymsRepository: InMemoryGymsRepository;
let sut: FetchGymsUseCase;

describe("Fetch Gyms Use Case", () => {
  beforeEach(() => {
    ((inMemoryGymsRepository = new InMemoryGymsRepository()),
      (sut = new FetchGymsUseCase(inMemoryGymsRepository)));
  });

  test("should be able to fetch all active gyms", async () => {
    await inMemoryGymsRepository.createGym({
      title: "TypeScript Gym",
      description: "A melhor academia do Brasil",
      phone: "(99)99999-9999",
      latitude: -22.872084,
      longitude: -43.237356,
    });
    await inMemoryGymsRepository.createGym({
      title: "Java Gym",
      description: "A segunda melhor academia do Brasil",
      phone: "(99)99999-9999",
      latitude: -22.872094,
      longitude: -43.237346,
    });
    await inMemoryGymsRepository.createGym({
      title: "C++ Gym",
      description: "A terceira melhor academia do Brasil",
      phone: "(99)99999-9999",
      latitude: -22.872064,
      longitude: -43.237336,
    });
    await inMemoryGymsRepository.createGym({
      title: "C# Gym",
      description: "A quarta melhor academia do Brasil",
      phone: "(99)99999-9999",
      latitude: -22.872024,
      longitude: -43.237316,
    });

    const { gyms, total } = await sut.execute({
      page: 1,
    });

    expect(gyms).toHaveLength(4);
    expect(total).toBe(4);
  });

  test("should return an empty list when there are no active gyms", async () => {
    const { gyms } = await sut.execute({
      page: 1,
    });

    expect(gyms).toHaveLength(0);
  });
});
