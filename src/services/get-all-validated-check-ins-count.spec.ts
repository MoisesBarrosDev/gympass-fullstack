import { beforeEach, describe, expect, test } from "vitest";
import { InMemoryCheckInsRepository } from "../repositories/in-memory/in-memory-checkins-repository.js";
import { GetAllValidatedCheckInsCountUseCase } from "./get-all-validated-check-ins-count.js";

let checkInsRepository: InMemoryCheckInsRepository;
let sut: GetAllValidatedCheckInsCountUseCase;

describe("Get All Validated Check-ins Count Use Case", () => {
  beforeEach(() => {
    checkInsRepository = new InMemoryCheckInsRepository();
    sut = new GetAllValidatedCheckInsCountUseCase(checkInsRepository);
  });

  test("should count validated check-ins from every user", async () => {
    const firstCheckIn = await checkInsRepository.createCheckIn({
      user_id: "user-01",
      gym_id: "gym-01",
    });
    firstCheckIn.validated_at = new Date();
    await checkInsRepository.saveCheckIn(firstCheckIn);
    const secondCheckIn = await checkInsRepository.createCheckIn({
      user_id: "user-02",
      gym_id: "gym-02",
    });
    secondCheckIn.validated_at = new Date();
    await checkInsRepository.saveCheckIn(secondCheckIn);
    await checkInsRepository.createCheckIn({
      user_id: "user-03",
      gym_id: "gym-03",
    });

    const { checkInsCount } = await sut.execute();

    expect(checkInsCount).toBe(2);
  });
});
