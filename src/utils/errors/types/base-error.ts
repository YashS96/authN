import type { ErrorDetails, AppErrorJSON } from "./types";

/**
 * Base error class for all application errors.
 * Extends the native Error class with additional context and metadata.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly timestamp: Date;
  public readonly details?: ErrorDetails;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    details?: ErrorDetails
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.timestamp = new Date();
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): AppErrorJSON {
    return {
      error: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
      ...(this.details && { details: this.details }),
    };
  }
}

/**
 * Type guard to check if an error is an instance of AppError
 * @param error - The error to check
 * @returns True if the error is an AppError, false otherwise
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

