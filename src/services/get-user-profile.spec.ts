import { beforeEach, expect, test, describe } from "vitest";
import { InMemoryUsersRepository } from "../repositories/in-memory/in-memory-users-repository.js";
import { GetUserProfileUseCase } from "./get-user-profile.js";
import { hash } from "bcryptjs";
import { ResourceNotFoundError } from "./errors/resource-not-found-error.js";

let inMemoryRepository: InMemoryUsersRepository;
let sut: GetUserProfileUseCase;

describe("Get Use Profile Use Case", () => {
  beforeEach(() => {
    inMemoryRepository = new InMemoryUsersRepository();
    sut = new GetUserProfileUseCase(inMemoryRepository);
  });

  test("should be able to get user profile", async () => {
    const createdUser = await inMemoryRepository.createUser({
      name: "Francisco",
      email: "franciscounder@gmail.com",
      password_hash: await hash("123456", 6),
    });

    const { user } = await sut.execute({
      userId: createdUser.id,
    });

    expect(user.id).toEqual(createdUser.id);
    expect(user.name).toEqual(createdUser.name);
  });

  test("should not be able to get user profile with wrong id", async () => {
   await expect(async () => {
      await sut.execute({
        userId: "non-existing-id",
      });
    }).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
