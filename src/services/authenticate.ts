import type { UsersRepository } from "../repositories/users-repository.js";
import { InvalidCredentialsError } from "./errors/invalid-credential-error.js";
import type { User } from "../generated/prisma/client.js";
import { Email } from "./primitives/email.js";
import { Password } from "./primitives/password.js";

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
    const normalizedEmail = Email.create(email);
    const userPassword = Password.create(password);
    const user = await this.usersRepository.findByEmail(normalizedEmail.value);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const doesPasswordMatches = await userPassword.matches(user.password_hash);

    if (!doesPasswordMatches) {
      throw new InvalidCredentialsError();
    }

    //auth
    return {
      user,
    };
  }
}
