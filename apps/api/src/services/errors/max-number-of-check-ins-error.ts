export class MaxNumberOfCheckInsError extends Error {
  constructor() {
    super("Você já realizou um check-in hoje.");
  }
}
