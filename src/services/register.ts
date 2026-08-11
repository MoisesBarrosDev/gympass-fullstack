import type { UsersRepository } from "../repositories/users-repository.js";
import { UserAlreadyExistsError } from "./errors/user-already-exists-error.js";
import type { User } from "../generated/prisma/client.js";
import { Email } from "./primitives/email.js";
import { Password } from "./primitives/password.js";

interface RegisterUseCaseRequest {
  name: string;
  email: string;
  password: string;
}

interface RegisterUseCaseResponse {
  user: User;
}

export class RegisterUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    name,
    email,
    password,
  }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
    const normalizedEmail = Email.create(email);
    const userPassword = Password.create(password);
    const userWithSameEmail = await this.usersRepository.findUserByEmail(
      normalizedEmail.value,
    );

    if (userWithSameEmail) {
      throw new UserAlreadyExistsError();
    }

    const password_hash = await userPassword.hash();

    const user = await this.usersRepository.createUser({
      name,
      email: normalizedEmail.value,
      password_hash,
    });

    return {
      user,
    };
  }
}
