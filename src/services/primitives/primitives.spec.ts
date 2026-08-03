import { describe, expect, test } from "vitest";
import { InvalidEmailError } from "../errors/invalid-email-error.js";
import { InvalidPasswordError } from "../errors/invalid-password-error.js";
import { InvalidUserIdError } from "../errors/invalid-user-id-error.js";
import { Email } from "./email.js";
import { Password } from "./password.js";
import { UserId } from "./user-id.js";

describe("Email", () => {
  test("should normalize an email", () => {
    const email = Email.create("  LIONEL@EXAMPLE.COM  ");

    expect(email.value).toBe("lionel@example.com");
  });

  test("should not accept an invalid email", () => {
    expect(() => Email.create("invalid-email")).toThrow(InvalidEmailError);
  });
});

describe("Password", () => {
  test("should create a hash that matches the password", async () => {
    const password = Password.create("123456789");
    const passwordHash = await password.hash();

    await expect(password.matches(passwordHash)).resolves.toBe(true);
  });

  test("should not accept a password shorter than 6 characters", () => {
    expect(() => Password.create("12345")).toThrow(InvalidPasswordError);
  });
});

describe("UserId", () => {
  test("should remove whitespace from a user id", () => {
    const userId = UserId.create("  user-01  ");

    expect(userId.value).toBe("user-01");
  });

  test("should not accept an empty user id", () => {
    expect(() => UserId.create("   ")).toThrow(InvalidUserIdError);
  });
});
