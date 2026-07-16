import { expect, describe, test } from "vitest";
import { RegisterUseCase } from "./register.js";
import { compare } from "bcryptjs";
import { InMemoryUsersRepository } from "../repositories/in-memory/in-memory-users-repository.js";
import { UserAlreadyExistsError } from "./errors/user-already-exists-error.js";

describe("Register Use Case", () => {
   test("should be able to register", async () => {
    const inMemoryRepository = new InMemoryUsersRepository();
    const registerUseCase = new RegisterUseCase(inMemoryRepository);

    const { user } = await registerUseCase.registerServices({
      name: "Lionel",
      email: "lionel10@gmail.com",
      password: "123456789",
    });

    expect(user.id).toEqual(expect.any(String));
  });

  test("should hash user password upon registration", async () => {
    const inMemoryRepository = new InMemoryUsersRepository();
    const registerUseCase = new RegisterUseCase(inMemoryRepository);

    const { user } = await registerUseCase.registerServices({
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
    const inMemoryRepository = new InMemoryUsersRepository();
    const registerUseCase = new RegisterUseCase(inMemoryRepository);

    await registerUseCase.registerServices({
      name: "Lionel",
      email: "lionel55@gmail.com",
      password: "123456789",
    });

     await expect( 
      registerUseCase.registerServices({
        name: "Lionel",
        email: "lionel55@gmail.com",
        password: "123456789",
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError)
  });
});
