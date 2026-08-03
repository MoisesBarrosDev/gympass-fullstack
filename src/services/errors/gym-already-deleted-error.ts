export class GymAlreadyDeletedError extends Error {
  constructor() {
    super("Gym is already deleted.");
  }
}
