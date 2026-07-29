import { expect, describe, test, beforeEach } from "vitest";
import { InMemoryGymsRepository } from "../repositories/in-memory/in-memory-gyms-repository.js";
import { CreateGymUseCase } from "./create-gym.js";


let inMemoryGymsRepository: InMemoryGymsRepository;
let sut: CreateGymUseCase;
describe("Create Gym Use Case", () => {
  beforeEach(() => {
    inMemoryGymsRepository = new InMemoryGymsRepository();
    sut = new CreateGymUseCase(inMemoryGymsRepository);
  });

  test("should be able to create gym", async () => {
    const { gym } = await sut.execute({
      title: "JavaScript Gym",
      description: "A melhor academia do Brasil",
      phone: "(99)99999-9999",
      latitude: -22.872064,
      longitude: -43.237376
    });

    expect(gym.id).toEqual(expect.any(String));
  });
});
