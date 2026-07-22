import { compare } from "bcryptjs";
import type { UsersRepository } from "../repositories/users-repository.js";
import { InvalidCredentialsError } from "./errors/invalid-credential-error.js";
import type { User } from "../generated/prisma/client.js";

interface AuthenticateUseCaseRequest {
  email: string;
  password: string;
}

interface AuthenticateUseCaseResponse {
  user: User;
}

export class Authenticate {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    email,
    password,
  }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const doesPasswordMatches = await compare(password, user.password_hash);

    if (!doesPasswordMatches) {
      throw new InvalidCredentialsError();
    }

    //auth
    return {
      user,
    };
  }
}
