/**
 * Classes d'erreurs personnalisées pour une meilleure gestion
 */

export class StorageError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'StorageError';
    Object.setPrototypeOf(this, StorageError.prototype);
  }
}

export class ValidationError extends Error {
  constructor(message: string, public readonly details?: unknown) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class MigrationError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'MigrationError';
    Object.setPrototypeOf(this, MigrationError.prototype);
  }
}

/**
 * Convertit une erreur inconnue en StorageError
 */
export function toStorageError(error: unknown, context?: string): StorageError {
  if (error instanceof StorageError) {
    return error;
  }
  
  const message = error instanceof Error 
    ? error.message 
    : String(error);
  
  const fullMessage = context 
    ? `${context}: ${message}`
    : message;
  
  return new StorageError(
    fullMessage,
    error instanceof Error ? error : undefined
  );
}
