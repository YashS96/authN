// Entities (Pure Type Definitions)
export type { 
  User, 
  UserCreateInput, 
  UserJSON,
  UserStorageData
} from "./entities/User";

export type { 
  Session, 
  SessionCreateInput, 
  SessionJSON,
  SessionStorageData 
} from "./entities/Session";

// Value Objects (Pure Types)
export type { Email } from "./value-objects/Email";
export { EMAIL_CONSTRAINTS } from "./value-objects/Email";

export type { Password, PasswordRequirements } from "./value-objects/Password";
export { DEFAULT_PASSWORD_REQUIREMENTS, PASSWORD_HASH_CONFIG } from "./value-objects/Password";

export type { UserId } from "./value-objects/UserId";
export { UUID_REGEX } from "./value-objects/UserId";

export type { SessionId } from "./value-objects/SessionId";
export { SESSION_UUID_REGEX } from "./value-objects/SessionId";

export type { Token } from "./value-objects/Token";
export { TOKEN_CONSTRAINTS } from "./value-objects/Token";

// Credentials (Pure Types)
export type { EmailPasswordCredentials } from "./value-objects/credentials/EmailPasswordCredentials";

export type { 
  OAuthCredentials, 
  OAuthState, 
  PKCEPair 
} from "./value-objects/credentials/OAuthCredentials";
export { OAUTH_CONSTRAINTS } from "./value-objects/credentials/OAuthCredentials";

export type { 
  ApiKey, 
  ApiKeyCredentials 
} from "./value-objects/credentials/ApiKey";
export { API_KEY_CONSTRAINTS } from "./value-objects/credentials/ApiKey";

// Types
export * from "./types";

// Schemas
export * from "./schemas";
