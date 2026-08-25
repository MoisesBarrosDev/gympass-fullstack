import type {
  CheckInsRepository,
  CheckInWithDetails,
} from "../repositories/check-ins-repository.js";

interface FetchValidatedCheckInsRequest {
  page: number;
}

interface FetchValidatedCheckInsResponse {
  checkIns: CheckInWithDetails[];
}

export class FetchValidatedCheckInsUseCase {
  constructor(private checkInsRepository: CheckInsRepository) {}

  async execute({
    page,
  }: FetchValidatedCheckInsRequest): Promise<FetchValidatedCheckInsResponse> {
    const checkIns =
      await this.checkInsRepository.findManyValidatedCheckIns(page);

    return { checkIns };
  }
}
