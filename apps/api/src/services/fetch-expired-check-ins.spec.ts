import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { InMemoryCheckInsRepository } from "../repositories/in-memory/in-memory-checkins-repository.js";
import { FetchExpiredCheckInsUseCase } from "./fetch-expired-check-ins.js";

let checkInsRepository: InMemoryCheckInsRepository;
let sut: FetchExpiredCheckInsUseCase;

describe("Fetch Expired Check-ins Use Case", () => {
  beforeEach(() => {
    checkInsRepository = new InMemoryCheckInsRepository();
    sut = new FetchExpiredCheckInsUseCase(checkInsRepository);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("should return only expired check-ins", async () => {
    vi.setSystemTime(new Date(2026, 7, 22, 16, 0));
    await checkInsRepository.createCheckIn({
      user_id: "user-01",
      gym_id: "gym-01",
    });
    vi.setSystemTime(new Date(2026, 7, 22, 16, 20));
    await checkInsRepository.createCheckIn({
      user_id: "user-02",
      gym_id: "gym-02",
    });
    vi.setSystemTime(new Date(2026, 7, 22, 16, 30));

    const { checkIns, total } = await sut.execute({ page: 1 });

    expect(checkIns).toHaveLength(1);
    expect(total).toBe(1);
    expect(checkIns[0]).toEqual(
      expect.objectContaining({ user_id: "user-01", gym_id: "gym-01" }),
    );
  });
});
