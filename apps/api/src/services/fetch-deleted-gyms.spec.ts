import { beforeEach, describe, expect, test } from "vitest";
import { InMemoryGymsRepository } from "../repositories/in-memory/in-memory-gyms-repository.js";
import { FetchDeletedGymsUseCase } from "./fetch-deleted-gyms.js";

let gymsRepository: InMemoryGymsRepository;
let sut: FetchDeletedGymsUseCase;

describe("Fetch Deleted Gyms Use Case", () => {
  beforeEach(() => {
    gymsRepository = new InMemoryGymsRepository();
    sut = new FetchDeletedGymsUseCase(gymsRepository);
  });

  test("should return deleted gyms", async () => {
    const gym = await gymsRepository.createGym({
      title: "Deleted Gym",
      description: null,
      phone: "(99) 99999-9999",
      latitude: -22.9,
      longitude: -43.2,
    });
    await gymsRepository.deleteGymById(gym.id);

    const { gyms } = await sut.execute({ page: 1 });

    expect(gyms).toEqual([gym]);
  });
});
