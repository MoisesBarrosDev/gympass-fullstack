export class CheckInNotExpiredError extends Error {
  constructor() {
    super("Somente check-ins expirados podem ser excluídos.");
  }
}
