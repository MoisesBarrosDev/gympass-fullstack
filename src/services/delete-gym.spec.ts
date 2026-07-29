import { expect, describe, test, beforeEach } from "vitest";
import { InMemoryGymsRepository } from "../repositories/in-memory/in-memory-gyms-repository.js";
import { CreateGymUseCase } from "./create-gym.js";
import { DeleteGymUseCase } from "./delete-gym.js";
import { ResourceNotFoundError } from "./errors/resource-not-found-error.js";

let inMemoryGymsRepository: InMemoryGymsRepository;
let createGym: CreateGymUseCase;
let sut: DeleteGymUseCase;
describe("Delete Gym Use Case", () => {
  beforeEach(() => {
    inMemoryGymsRepository = new InMemoryGymsRepository();
    createGym = new CreateGymUseCase(inMemoryGymsRepository);
    sut = new DeleteGymUseCase(inMemoryGymsRepository);
  });

  test("should be able to delete gym", async () => {
    const { gym } = await createGym.execute({
      title: "JavaScript Gym",
      description: "A melhor academia do Brasil",
      phone: "(99)99999-9999",
      latitude: -22.872064,
      longitude: -43.237376,
    });

    const { gymRemoved } = await sut.execute({
      id: gym.id,
    });

    expect(gymRemoved).toEqual(gym);
    expect(inMemoryGymsRepository.items).toHaveLength(0);
    expect(inMemoryGymsRepository.gymExclude).toContainEqual(gym);
  });

  test("not should be able to delete gym with a non-existent id", async () => {
    await expect(
      sut.execute({
        id: "Gym10",
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
