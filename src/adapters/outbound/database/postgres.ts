import { SQL } from "bun";
import { User } from "../../../core/domain/entities/User";
import type { IUserRepository } from "../../../core/ports";

export class PostgresUserRepository implements IUserRepository {
  private sql: SQL;

  constructor(connectionString?: string) {
    this.sql = new SQL({
      url: connectionString ?? process.env.DATABASE_URL,
    });
  }

  async initialize(): Promise<void> {
    await this.sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await this.sql`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `;
  }

  async save(user: User): Promise<void> {
    await this.sql`
      INSERT INTO users (id, email, password_hash, created_at, updated_at)
      VALUES (${user.id}, ${user.email}, ${user.passwordHash}, ${user.createdAt}, ${user.updatedAt})
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        password_hash = EXCLUDED.password_hash,
        updated_at = NOW()
    `;
  }

  async findById(id: string): Promise<User | null> {
    const rows = await this.sql`
      SELECT id, email, password_hash, created_at, updated_at
      FROM users
      WHERE id = ${id}
    `;

    if (rows.length === 0) return null;

    const row = rows[0];
    return User.create({
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.toLowerCase().trim();
    const rows = await this.sql`
      SELECT id, email, password_hash, created_at, updated_at
      FROM users
      WHERE email = ${normalizedEmail}
    `;

    if (rows.length === 0) return null;

    const row = rows[0];
    return User.create({
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  async delete(id: string): Promise<void> {
    await this.sql`DELETE FROM users WHERE id = ${id}`;
  }

  async exists(email: string): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();
    const rows = await this.sql`
      SELECT 1 FROM users WHERE email = ${normalizedEmail} LIMIT 1
    `;
    return rows.length > 0;
  }

  async update(user: User): Promise<void> {
    await this.sql`
      UPDATE users
      SET email = ${user.email},
          password_hash = ${user.passwordHash},
          updated_at = NOW()
      WHERE id = ${user.id}
    `;
  }

  async close(): Promise<void> {
    await this.sql.close();
  }
}
