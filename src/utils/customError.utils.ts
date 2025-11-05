/**
 * Classe d'erreur personnalisée pour l'API
 */
export class CustomError extends Error {
  public statusCode: number;
  public details?: any;

  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'CustomError';

    // Maintenir la stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

