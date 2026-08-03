export class InvalidPasswordError extends Error {
  constructor() {
    super("Password must contain at least 6 characters.");
  }
}
