import { Email } from "../value-objects/Email";
import { Password } from "../value-objects/Password";
import { UserId } from "../value-objects/UserId";
import type { UserJSON } from "../types";

export interface UserProps {
  id: UserId;
  email: Email;
  password: Password;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private constructor(private readonly props: UserProps) {}

  static create(props: {
    id: string;
    email: string;
    passwordHash: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): User {
    return new User({
      id: UserId.create(props.id),
      email: Email.create(props.email),
      password: Password.fromHash(props.passwordHash),
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    });
  }

  static async register(props: {
    email: string;
    plainPassword: string;
  }): Promise<User> {
    const password = await Password.hash(props.plainPassword);
    return new User({
      id: UserId.generate(),
      email: Email.create(props.email),
      password,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  get id(): string {
    return this.props.id.value;
  }

  get email(): string {
    return this.props.email.value;
  }

  get passwordHash(): string {
    return this.props.password.hash;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  async verifyPassword(plainPassword: string): Promise<boolean> {
    return this.props.password.verify(plainPassword);
  }

  toJSON(): UserJSON {
    return {
      id: this.id,
      email: this.email,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
