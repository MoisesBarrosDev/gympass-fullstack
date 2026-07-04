import { hash } from "bcryptjs";
import type { UsersRepository } from "../repositories/users-repository.js";
import { UserAlreadyExistsError } from "./errors/user-already-exists-error.js";

interface RegisterServices {
  name: string;
  email: string;
  password: string;
}

// SOLID

// D - Dependency Inversion Principle

export class RegisterUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async registerServices({ name, email, password }: RegisterServices) {
    const userWithSameEmail = await this.usersRepository.findByEmail(email);

    if (userWithSameEmail) {
      throw new UserAlreadyExistsError();
    }

    const password_hash = await hash(password, 6);

    await this.usersRepository.create({
      name,
      email,
      password_hash,
    });
  }
}
