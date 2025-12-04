import type {
  IEmailPasswordProvider,
  IUserRepository,
} from "../../../core/ports";
import type {
  EmailPasswordCredentials,
  AuthenticatedUser,
} from "../../../core/domain/types";

export class EmailPasswordAuthProvider implements IEmailPasswordProvider {
  readonly method = "email_password" as const;

  constructor(private readonly userRepository: IUserRepository) {}

  async authenticate(credentials: EmailPasswordCredentials): Promise<AuthenticatedUser> {
    const user = await this.userRepository.findByEmail(credentials.email);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isValid = await user.verifyPassword(credentials.password);

    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    return {
      id: user.id,
      email: user.email,
      emailVerified: true,
      provider: this.method,
    };
  }
}
