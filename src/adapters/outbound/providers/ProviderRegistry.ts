import type {
  IAuthProvider,
  IAuthProviderRegistry,
} from "../../../core/ports";
import type { AuthMethod } from "../../../core/domain/types";

export class ProviderRegistry implements IAuthProviderRegistry {
  private providers = new Map<AuthMethod, IAuthProvider>();

  register(provider: IAuthProvider): void {
    this.providers.set(provider.method, provider);
  }

  get(method: AuthMethod): IAuthProvider | undefined {
    return this.providers.get(method);
  }

  has(method: AuthMethod): boolean {
    return this.providers.has(method);
  }

  list(): AuthMethod[] {
    return Array.from(this.providers.keys());
  }
}
