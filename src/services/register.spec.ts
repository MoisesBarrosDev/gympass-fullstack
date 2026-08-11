import { expect, describe, test } from "vitest";
import { RegisterUseCase } from "./register.js";
import { compare } from "bcryptjs";
import { InMemoryUsersRepository } from "../repositories/in-memory/in-memory-users-repository.js";
import { UserAlreadyExistsError } from "./errors/user-already-exists-error.js";
import { beforeEach } from "vitest";

let inMemoryRepository: InMemoryUsersRepository;
let sut: RegisterUseCase;
describe("Register Use Case", () => {
  beforeEach(() => {
    inMemoryRepository = new InMemoryUsersRepository();
    sut = new RegisterUseCase(inMemoryRepository);
  });

  test("should be able to register", async () => {
    const { user } = await sut.execute({
      name: "Lionel",
      email: "lionel10@gmail.com",
      password: "123456789",
    });

    expect(user.id).toEqual(expect.any(String));
  });

  test("should hash user password upon registration", async () => {
    const { user } = await sut.execute({
      name: "Lionel",
      email: "lionel10@gmail.com",
      password: "123456789",
    });

    const isPasswordCorrectlyHashed = await compare(
      "123456789",
      user.password_hash,
    );
    expect(isPasswordCorrectlyHashed).toBe(true);
  });

  test("should not be able to register with same email twice", async () => {
    await sut.execute({
      name: "Lionel",
      email: "lionel55@gmail.com",
      password: "123456789",
    });

    await expect(() =>
      sut.execute({
        name: "Lionel",
        email: "lionel55@gmail.com",
        password: "123456789",
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError);
  });
});
