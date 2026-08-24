import { beforeEach, describe, expect, test } from "vitest";
import { InMemoryGymsRepository } from "../repositories/in-memory/in-memory-gyms-repository.js";
import { PermanentlyDeleteAllGymsUseCase } from "./permanently-delete-all-gyms.js";

let gymsRepository: InMemoryGymsRepository;
let sut: PermanentlyDeleteAllGymsUseCase;

describe("Permanently Delete All Gyms Use Case", () => {
  beforeEach(() => {
    gymsRepository = new InMemoryGymsRepository();
    sut = new PermanentlyDeleteAllGymsUseCase(gymsRepository);
  });

  test("should permanently delete every soft-deleted gym", async () => {
    for (let index = 0; index < 3; index++) {
      const gym = await gymsRepository.createGym({
        title: `Deleted Gym ${index}`,
        description: "A gym waiting for permanent deletion",
        phone: "(99) 99999-9999",
        latitude: -22.872064,
        longitude: -43.237376,
      });
      await gymsRepository.deleteGymById(gym.id);
    }

    const { count } = await sut.execute();

    expect(count).toBe(3);
    expect(gymsRepository.deletedGyms).toHaveLength(0);
  });
});
