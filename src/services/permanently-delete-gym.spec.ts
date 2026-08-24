import { beforeEach, describe, expect, test } from "vitest";
import { InMemoryGymsRepository } from "../repositories/in-memory/in-memory-gyms-repository.js";
import { ResourceNotFoundError } from "./errors/resource-not-found-error.js";
import { PermanentlyDeleteGymUseCase } from "./permanently-delete-gym.js";

let gymsRepository: InMemoryGymsRepository;
let sut: PermanentlyDeleteGymUseCase;

describe("Permanently Delete Gym Use Case", () => {
  beforeEach(() => {
    gymsRepository = new InMemoryGymsRepository();
    sut = new PermanentlyDeleteGymUseCase(gymsRepository);
  });

  test("should permanently delete a gym that was already soft-deleted", async () => {
    const gym = await gymsRepository.createGym({
      title: "Deleted Gym",
      description: "A permanently deleted gym",
      phone: "(99) 99999-9999",
      latitude: -22.872064,
      longitude: -43.237376,
    });
    await gymsRepository.deleteGymById(gym.id);

    await sut.execute({ id: gym.id });

    expect(gymsRepository.deletedGyms).toHaveLength(0);
    expect(await gymsRepository.findDeletedGymById(gym.id)).toBeNull();
  });

  test("should not permanently delete an active gym", async () => {
    const gym = await gymsRepository.createGym({
      title: "Active Gym",
      description: "An active gym cannot be permanently deleted",
      phone: "(99) 99999-9999",
      latitude: -22.872064,
      longitude: -43.237376,
    });

    await expect(sut.execute({ id: gym.id })).rejects.toBeInstanceOf(
      ResourceNotFoundError,
    );
  });
});
