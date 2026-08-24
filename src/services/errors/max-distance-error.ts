export class MaxDistanceError extends Error {
  constructor() {
    super("Você precisa estar a no máximo 100 metros da academia para fazer check-in.");
  }
}
