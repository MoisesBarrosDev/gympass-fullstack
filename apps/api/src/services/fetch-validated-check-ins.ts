import type {
  CheckInsRepository,
  CheckInWithDetails,
} from "../repositories/check-ins-repository.js";

interface FetchValidatedCheckInsRequest {
  page: number;
}

interface FetchValidatedCheckInsResponse {
  checkIns: CheckInWithDetails[];
  total: number;
}

export class FetchValidatedCheckInsUseCase {
  constructor(private checkInsRepository: CheckInsRepository) {}

  async execute({
    page,
  }: FetchValidatedCheckInsRequest): Promise<FetchValidatedCheckInsResponse> {
    const [checkIns, total] = await Promise.all([
      this.checkInsRepository.findManyValidatedCheckIns(page),
      this.checkInsRepository.countAllValidatedCheckIns(),
    ]);

    return { checkIns, total };
  }
}
