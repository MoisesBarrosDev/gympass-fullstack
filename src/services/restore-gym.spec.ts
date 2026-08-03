import { beforeEach, describe, expect, test } from "vitest";
import { InMemoryGymsRepository } from "../repositories/in-memory/in-memory-gyms-repository.js";
import { CreateGymUseCase } from "./create-gym.js";
import { DeleteGymUseCase } from "./delete-gym.js";
import { GymAlreadyRestoredError } from "./errors/gym-already-restored-error.js";
import { ResourceNotFoundError } from "./errors/resource-not-found-error.js";
import { RestoreGymUseCase } from "./restore-gym.js";

let inMemoryGymsRepository: InMemoryGymsRepository;
let createGym: CreateGymUseCase;
let deleteGym: DeleteGymUseCase;
let sut: RestoreGymUseCase;

describe("Restore Gym Use Case", () => {
  beforeEach(() => {
    inMemoryGymsRepository = new InMemoryGymsRepository();
    createGym = new CreateGymUseCase(inMemoryGymsRepository);
    deleteGym = new DeleteGymUseCase(inMemoryGymsRepository);
    sut = new RestoreGymUseCase(inMemoryGymsRepository);
  });

  test("should be able to restore a deleted gym", async () => {
    const { gym } = await createGym.execute({
      title: "JavaScript Gym",
      description: "A melhor academia do Brasil",
      phone: "(99)99999-9999",
      latitude: -22.872064,
      longitude: -43.237376,
    });
    await deleteGym.execute({ id: gym.id });

    const { gym: restoredGym } = await sut.execute({ id: gym.id });

    expect(restoredGym).toEqual(gym);
    expect(inMemoryGymsRepository.items).toContainEqual(gym);
    expect(inMemoryGymsRepository.deletedGyms).toHaveLength(0);
  });

  test("should not restore a gym that is already active", async () => {
    const { gym } = await createGym.execute({
      title: "JavaScript Gym",
      description: "A melhor academia do Brasil",
      phone: "(99)99999-9999",
      latitude: -22.872064,
      longitude: -43.237376,
    });

    await expect(sut.execute({ id: gym.id })).rejects.toBeInstanceOf(
      GymAlreadyRestoredError,
    );
  });

  test("should not restore a non-existent gym", async () => {
    await expect(
      sut.execute({ id: "non-existent-gym" }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
