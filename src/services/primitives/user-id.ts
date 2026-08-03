import { InvalidUserIdError } from "../errors/invalid-user-id-error.js";

export class UserId {
  private constructor(readonly value: string) {}

  static create(value: string): UserId {
    const normalizedId = value.trim();

    if (!normalizedId) {
      throw new InvalidUserIdError();
    }

    return new UserId(normalizedId);
  }
}
