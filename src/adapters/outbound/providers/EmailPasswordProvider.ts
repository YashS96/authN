import type {
  IEmailPasswordProvider,
  IUserRepository,
} from "../../../core/ports";
import type {
  EmailPasswordCredentials,
  AuthenticatedUser,
} from "../../../core/domain/types";
import { verifyUserPassword } from "../../../core/services/mappers";

export class EmailPasswordAuthProvider implements IEmailPasswordProvider {
  readonly method = "email_password" as const;

  constructor(private readonly userRepository: IUserRepository) {}

  async authenticate(credentials: EmailPasswordCredentials): Promise<AuthenticatedUser> {
    const user = await this.userRepository.findByEmail(credentials.email);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isValid = await verifyUserPassword(user, credentials.password);

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
