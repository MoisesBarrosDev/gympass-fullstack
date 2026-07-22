import { expect, describe, test } from "vitest";
import { InMemoryUsersRepository } from "../repositories/in-memory/in-memory-users-repository.js";
import { Authenticate } from "./authenticate.js";
import { hash } from "bcryptjs";
import { InvalidCredentialsError } from "./errors/invalid-credential-error.js";
import { beforeEach } from "vitest";

let inMemoryRepository: InMemoryUsersRepository;
let sut: Authenticate;
describe("Authenticate Use Case", () => {
  beforeEach(() => {
    inMemoryRepository = new InMemoryUsersRepository();
    sut = new Authenticate(inMemoryRepository);
  });
  test("should be able to authenticate", async () => {
    await inMemoryRepository.create({
      name: "lionel",
      email: "lionel10@gmail.com",
      password_hash: await hash("123456789", 6),
    });

    const { user } = await sut.execute({
      email: "lionel10@gmail.com",
      password: "123456789",
    });

    expect(user.id).toEqual(expect.any(String));
  });

  test("should not be able to authenticate with wrong email", async () => {
    expect(() =>
      sut.execute({
        email: "lionel1@gmail.com",
        password: "123456789",
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  test("should not be able to authenticate with wrong password", async () => {
    await inMemoryRepository.create({
      name: "lionel",
      email: "lionel1@gmail.com",
      password_hash: await hash("123456", 6),
    });

    expect(() =>
      sut.execute({
        email: "lionel1@gmail.com",
        password: "123456789",
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});
