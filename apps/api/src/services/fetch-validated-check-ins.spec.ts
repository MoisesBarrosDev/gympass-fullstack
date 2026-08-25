import { beforeEach, describe, expect, test } from "vitest";
import { InMemoryCheckInsRepository } from "../repositories/in-memory/in-memory-checkins-repository.js";
import { FetchValidatedCheckInsUseCase } from "./fetch-validated-check-ins.js";

describe("Fetch validated check-ins", () => {
  let checkInsRepository: InMemoryCheckInsRepository;
  let sut: FetchValidatedCheckInsUseCase;

  beforeEach(() => {
    checkInsRepository = new InMemoryCheckInsRepository();
    sut = new FetchValidatedCheckInsUseCase(checkInsRepository);
  });

  test("should return only validated check-ins ordered by validation date", async () => {
    const older = await checkInsRepository.createCheckIn({
      user_id: "older-user",
      gym_id: "gym-1",
    });
    older.validated_at = new Date("2026-08-23T10:00:00.000Z");
    await checkInsRepository.saveCheckIn(older);

    await checkInsRepository.createCheckIn({
      user_id: "pending-user",
      gym_id: "gym-1",
    });

    const newer = await checkInsRepository.createCheckIn({
      user_id: "newer-user",
      gym_id: "gym-2",
    });
    newer.validated_at = new Date("2026-08-24T10:00:00.000Z");
    await checkInsRepository.saveCheckIn(newer);

    const { checkIns, total } = await sut.execute({ page: 1 });

    expect(checkIns).toHaveLength(2);
    expect(total).toBe(2);
    expect(checkIns.map((checkIn) => checkIn.id)).toEqual([
      newer.id,
      older.id,
    ]);
    expect(checkIns[0]).toEqual(
      expect.objectContaining({
        user: { name: "newer-user", email: "" },
        gym: { title: "gym-2" },
      }),
    );
  });
});
