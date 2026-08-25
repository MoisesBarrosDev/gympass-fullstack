import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { InMemoryCheckInsRepository } from "../repositories/in-memory/in-memory-checkins-repository.js";
import { FetchPendingCheckInsUseCase } from "./fetch-pending-check-ins.js";

let checkInsRepository: InMemoryCheckInsRepository;
let sut: FetchPendingCheckInsUseCase;

describe("Fetch Pending Check-ins Use Case", () => {
  beforeEach(() => {
    checkInsRepository = new InMemoryCheckInsRepository();
    sut = new FetchPendingCheckInsUseCase(checkInsRepository);
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 22, 16, 30));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("should return check-ins awaiting validation", async () => {
    await checkInsRepository.createCheckIn({
      user_id: "user-01",
      gym_id: "gym-01",
    });

    const { checkIns, total } = await sut.execute({ page: 1 });

    expect(checkIns).toHaveLength(1);
    expect(total).toBe(1);
    expect(checkIns[0]).toEqual(
      expect.objectContaining({ user_id: "user-01", gym_id: "gym-01" }),
    );
  });

  test("should not return validated or expired check-ins", async () => {
    const validatedCheckIn = await checkInsRepository.createCheckIn({
      user_id: "user-01",
      gym_id: "gym-01",
    });
    validatedCheckIn.validated_at = new Date();
    await checkInsRepository.saveCheckIn(validatedCheckIn);

    vi.setSystemTime(new Date(2026, 7, 22, 16, 0));
    await checkInsRepository.createCheckIn({
      user_id: "user-02",
      gym_id: "gym-02",
    });
    vi.setSystemTime(new Date(2026, 7, 22, 16, 30));

    const { checkIns } = await sut.execute({ page: 1 });

    expect(checkIns).toHaveLength(0);
  });
});
