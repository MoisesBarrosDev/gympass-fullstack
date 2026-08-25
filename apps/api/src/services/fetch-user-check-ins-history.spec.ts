import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { InMemoryCheckInsRepository } from "../repositories/in-memory/in-memory-checkins-repository.js";
import { FetchUserCheckInsHistoryUseCase } from "./fetch-user-check-ins-history.js";

let inMemoryCheckInsRepository: InMemoryCheckInsRepository;
let sut: FetchUserCheckInsHistoryUseCase;

describe("Fetch User Check-in History Use Case", () => {
  beforeEach(async () => {
    inMemoryCheckInsRepository = new InMemoryCheckInsRepository();
    sut = new FetchUserCheckInsHistoryUseCase(inMemoryCheckInsRepository);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("should be able to fetch check-in history", async () => {
    await inMemoryCheckInsRepository.createCheckIn({
      gym_id: "gym-01",
      user_id: "user-01",
    });

    await inMemoryCheckInsRepository.createCheckIn({
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

  test("should normalize the user id before fetching check-in history", async () => {
    await inMemoryCheckInsRepository.createCheckIn({
      gym_id: "gym-01",
      user_id: "user-01",
    });

    const { checkIns } = await sut.execute({
      userId: "  user-01  ",
      page: 1,
    });

    expect(checkIns).toHaveLength(1);
  });

  test("should be able to fetch paginated check-in history", async () => {
    for (let i = 1; i <= 22; i++) {
      await inMemoryCheckInsRepository.createCheckIn({
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

  test("should identify a pending check-in as expired after 20 minutes", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 21, 19, 45));
    await inMemoryCheckInsRepository.createCheckIn({
      gym_id: "gym-01",
      user_id: "user-01",
    });
    vi.setSystemTime(new Date(2026, 7, 22, 16, 30));

    const { checkIns } = await sut.execute({ userId: "user-01", page: 1 });

    expect(checkIns[0]).toEqual(expect.objectContaining({ status: "EXPIRED" }));
  });
});
