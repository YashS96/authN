export interface ErrorDetails {
  [key: string]: unknown;
}

export interface ValidationErrorItem {
  field: string;
  message: string;
}

export interface AppErrorJSON {
  error: string;
  code: string;
  statusCode: number;
  timestamp: string;
  details?: ErrorDetails;
}

