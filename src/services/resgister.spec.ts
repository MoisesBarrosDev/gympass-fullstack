import { expect, describe, test } from "vitest";
import { RegisterUseCase } from "./register.js";
import { compare } from "bcryptjs";

describe("Register Use Case", () => {
  test("should hash user password upon registration", async () => {
    const registerUseCase = new RegisterUseCase({
     
        async findByEmail(email) {
        return null;
      },

      async create(data) {
        return {
          id: "User-1",
          name: data.name,
          email: data.email,
          password_hash: data.password_hash,
          created_at: new Date(),
        };
      },
    });

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
});
