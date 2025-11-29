/**
 * @fileoverview Defines custom error classes for structured, predictable error handling.
 * This pattern distinguishes between 'operational' (known, handled) and 'programmer' (unexpected, fatal) errors.
 */

// Base Class for all custom operational errors
export class AppError extends Error {
  /**
   * Creates an instance of AppError.
   * @param {string} message - The error message.
   * @param {number} statusCode - The HTTP status code to send to the client.
   */
  constructor(message, statusCode) {
    // Calling the parent constructor (Error)
    super(message);

    this.statusCode = statusCode;
    // Operational errors are predictable, known errors (e.g., failed validation, 404).
    this.isOperational = true;

    // Capturing the stack trace ensures we know where the error was instantiated.
    // This is crucial for debugging.
    Error.captureStackTrace(this, this.constructor);
  }
}

// Derived custom errors for better semantics
export class NotFoundError extends AppError {
  constructor(message = "Resource not found or does not exist.") {
    super(message, 404);
  }
}

export class InvalidInputError extends AppError {
  constructor(message = "Invalid input parameters provided.") {
    super(message, 400);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access is denied to this resource.") {
    super(message, 403);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication failed or token is invalid.") {
    super(message, 401);
  }
}
