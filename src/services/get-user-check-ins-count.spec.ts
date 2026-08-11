import { beforeEach, expect, test, describe } from "vitest";
import { InMemoryCheckInsRepository } from "../repositories/in-memory/in-memory-checkins-repository.js";
import { GetUserCheckInsCountUseCase } from "./get-user-check-ins-count.js";

let inMemoryCheckInsRepository: InMemoryCheckInsRepository;
let sut: GetUserCheckInsCountUseCase;

describe("Get User Check-ins Count Use Case", () => {
  beforeEach(() => {
    inMemoryCheckInsRepository = new InMemoryCheckInsRepository();
    sut = new GetUserCheckInsCountUseCase(inMemoryCheckInsRepository);
  });

  test("should return the total number of check-ins made by a user", async () => {
    await inMemoryCheckInsRepository.createCheckIn({
      gym_id: "gym01",
      user_id: "user01",
    });
    await inMemoryCheckInsRepository.createCheckIn({
      gym_id: "gym02",
      user_id: "user01",
    });

    const { checkInsCount } = await sut.execute({
      userId: "user01",
    });

    expect(checkInsCount).toBe(2);
  });

  test("should return zero when the user has no check-ins", async () => {
    const { checkInsCount } = await sut.execute({
      userId: "user01",
    });

    expect(checkInsCount).toBe(0);
  });

  test("should normalize the user id before counting check-ins", async () => {
    await inMemoryCheckInsRepository.createCheckIn({
      gym_id: "gym01",
      user_id: "user01",
    });

    const { checkInsCount } = await sut.execute({
      userId: "  user01  ",
    });

    expect(checkInsCount).toBe(1);
  });
});
