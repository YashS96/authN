import type { User } from "../../domain/entities/User";

/**
 * Outbound port for user persistence.
 */
export interface IUserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  delete(id: string): Promise<void>;
  exists(email: string): Promise<boolean>;
  update(user: User): Promise<void>;
}
