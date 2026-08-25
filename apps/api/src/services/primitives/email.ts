import { InvalidEmailError } from "../errors/invalid-email-error.js";

export class Email {
  private constructor(readonly value: string) {}

  static create(value: string): Email {
    const normalizedEmail = value.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      throw new InvalidEmailError();
    }

    return new Email(normalizedEmail);
  }
}
