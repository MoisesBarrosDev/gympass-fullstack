import { expect, describe, test, beforeEach } from "vitest";
import { InMemoryGymsRepository } from "../repositories/in-memory/in-memory-gyms-repository.js";
import { SearchGymsUseCase } from "./search-gyms.js";

let inMemoryGymsRepository: InMemoryGymsRepository;
let sut: SearchGymsUseCase;

describe("Search Gyms Use Case", () => {
  beforeEach(() => {
    inMemoryGymsRepository = new InMemoryGymsRepository();
    sut = new SearchGymsUseCase(inMemoryGymsRepository);
  });

  test("should be able to search gyms", async () => {
    await inMemoryGymsRepository.createGym({
      title: "JavaScript Gym",
      latitude: -22.872064,
      longitude: -21.572064,
    });
    await inMemoryGymsRepository.createGym({
      title: "TypeScript Gym",
      latitude: -22.332064,
      longitude: -21.217064,
    });

    const { gyms } = await sut.execute({
      query: "JavaScript Gym",
      page: 1,
    });

    expect(gyms).toHaveLength(1);
    expect(gyms).toEqual([
      expect.objectContaining({ title: "JavaScript Gym" }),
    ]);
  });

  test("should return an empty list when no gyms match the search", async () => {
    const { gyms } = await sut.execute({
      query: "non-existent gym",
      page: 1,
    });

    expect(gyms).toHaveLength(0);
  });

  test("should be able to search gyms with pagination", async () => {
    for (let i = 1; i <= 22; i++) {
      await inMemoryGymsRepository.createGym({
        title: `JavaScript Gym-${i}`,
        latitude: 22.33264,
        longitude: 22.112064,
      });
    }
    const { gyms } = await sut.execute({
      query: "JavaScript",
      page: 2,
    });

    expect(gyms).toHaveLength(2);
     expect(gyms).toEqual([
      expect.objectContaining({ title: "JavaScript Gym-21" }),
      expect.objectContaining({ title: "JavaScript Gym-22" }),
    
    ]);
  });
});
