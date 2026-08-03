import type { UsersRepository } from "../repositories/users-repository.js";
import type { User } from "../generated/prisma/client.js";
import { ResourceNotFoundError } from "./errors/resource-not-found-error.js";
import { UserId } from "./primitives/user-id.js";

interface GetUserProfileUseCaseRequest {
  userId: string;
}

interface GetUserProfileUseCaseResponse {
  user: User;
}

export class GetUserProfileUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    userId,
  }: GetUserProfileUseCaseRequest): Promise<GetUserProfileUseCaseResponse> {
    const normalizedUserId = UserId.create(userId);
    const user = await this.usersRepository.findById(normalizedUserId.value);

    if (!user) {
      throw new ResourceNotFoundError();
    }

    //auth
    return {
      user,
    };
  }
}
