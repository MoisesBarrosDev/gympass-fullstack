import { compare, hash } from "bcryptjs";
import { InvalidPasswordError } from "../errors/invalid-password-error.js";

export class Password {
  private constructor(private readonly value: string) {}

  static create(value: string): Password {
    if (value.length < 6) {
      throw new InvalidPasswordError();
    }

    return new Password(value);
  }

  async hash(): Promise<string> {
    return hash(this.value, 6);
  }

  async matches(passwordHash: string): Promise<boolean> {
    return compare(this.value, passwordHash);
  }
}
