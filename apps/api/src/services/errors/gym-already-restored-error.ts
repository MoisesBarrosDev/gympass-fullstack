export class GymAlreadyRestoredError extends Error {
  constructor() {
    super("Gym is already restored.");
  }
}
