import { compare } from "bcryptjs";
import type { UsersRepository } from "../repositories/users-repository.js";
import { InvalidCredentialsError } from "./errors/invalid-credential-error.js";
import type { User } from "../generated/prisma/client.js";

// Oque que a pessoa tem que enviar pra fazer a autenticação
interface AuthenticateUseCaseRequest {
  email: string;
  password: string;
}

// Oque que eu espero devolver daqui de dentro pra saber que o usuario realmente foi autenticado ou não
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

    // Boolean => "is", "has", "does"

    // Toda vez que fomos usar uma variavel que retorna um boolean a leitura da variavel
    // tem que ser semantica.
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
