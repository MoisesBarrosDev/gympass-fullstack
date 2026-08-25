import { beforeEach, describe, expect, test } from "vitest";
import { InMemoryGymsRepository } from "../repositories/in-memory/in-memory-gyms-repository.js";
import { CreateGymUseCase } from "./create-gym.js";
import { ResourceNotFoundError } from "./errors/resource-not-found-error.js";
import { UpdateGymUseCase } from "./update-gym.js";

let inMemoryGymsRepository: InMemoryGymsRepository;
let createGym: CreateGymUseCase;
let sut: UpdateGymUseCase;

describe("Update Gym Use Case", () => {
  beforeEach(() => {
    inMemoryGymsRepository = new InMemoryGymsRepository();
    createGym = new CreateGymUseCase(inMemoryGymsRepository);
    sut = new UpdateGymUseCase(inMemoryGymsRepository);
  });

  test("should be able to update a gym", async () => {
    const { gym } = await createGym.execute({
      title: "JavaScript Gym",
      description: "A melhor academia do Brasil",
      phone: "(99)99999-9999",
      latitude: -22.872064,
      longitude: -43.237376,
    });

    const { gym: updatedGym } = await sut.execute({
      id: gym.id,
      title: "TypeScript Gym",
      description: "Academia atualizada",
      phone: "(88)88888-8888",
      latitude: -23.55052,
      longitude: -46.633308,
    });

    expect(updatedGym).toEqual(
      expect.objectContaining({
        id: gym.id,
        title: "TypeScript Gym",
        description: "Academia atualizada",
        phone: "(88)88888-8888",
      }),
    );
    expect(updatedGym.latitude.toNumber()).toBe(-23.55052);
    expect(updatedGym.longitude.toNumber()).toBe(-46.633308);
    expect(inMemoryGymsRepository.items).toHaveLength(1);
    expect(inMemoryGymsRepository.items).toContainEqual(updatedGym);
  });

  test("should preserve gym data that was not provided", async () => {
    const { gym } = await createGym.execute({
      title: "JavaScript Gym",
      description: "A melhor academia do Brasil",
      phone: "(99)99999-9999",
      latitude: -22.872064,
      longitude: -43.237376,
    });

    const { gym: updatedGym } = await sut.execute({
      id: gym.id,
      title: "TypeScript Gym",
    });

    expect(updatedGym).toEqual({
      ...gym,
      title: "TypeScript Gym",
    });
  });

  test("should not be able to update a non-existent gym", async () => {
    await expect(
      sut.execute({
        id: "non-existent-gym",
        title: "TypeScript Gym",
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
