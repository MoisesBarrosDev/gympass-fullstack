import { beforeEach, describe, expect, test } from "vitest";
import { InMemoryCheckInsRepository } from "../repositories/in-memory/in-memory-checkins-repository.js";
import { FetchUserCheckInsHistory } from "./fetch-user-check-ins-history.js";

let inMemoryCheckInsRepository: InMemoryCheckInsRepository;
let sut: FetchUserCheckInsHistory;

describe("Fetch User Check-in History Use Case", () => {
  beforeEach(async () => {
    inMemoryCheckInsRepository = new InMemoryCheckInsRepository();
    sut = new FetchUserCheckInsHistory(inMemoryCheckInsRepository);
  });

  test("should be able to fetch check-in history", async () => {
    await inMemoryCheckInsRepository.create({
      gym_id: "gym-01",
      user_id: "user-01",
    });

    await inMemoryCheckInsRepository.create({
      gym_id: "gym-02",
      user_id: "user-01",
    });

    const { checkIns } = await sut.execute({
      userId: "user-01",
      page: 1,
    });

    expect(checkIns).toHaveLength(2);
    expect(checkIns).toEqual([
      expect.objectContaining({ gym_id: "gym-01" }),
      expect.objectContaining({ gym_id: "gym-02" }),
    ]);
  });

  test("should be able to fetch paginated check-in history", async () => {
    for (let i = 1; i <= 22; i++) {
      await inMemoryCheckInsRepository.create({
        gym_id: `gym-${i}`,
        user_id: "user-01",
      });
    }

    const { checkIns } = await sut.execute({
      userId: "user-01",
      page: 2,
    });

    expect(checkIns).toHaveLength(2);
    expect(checkIns).toEqual([
      expect.objectContaining({ gym_id: "gym-21" }),
      expect.objectContaining({ gym_id: "gym-22" }),
    ]);
  });
});
