/**
 * Error utilities for GDrive MCP
 */

export class GDriveMCPError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'GDriveMCPError';
  }
}

export function createAuthError(message: string): GDriveMCPError {
  return new GDriveMCPError(message, 'AUTH_ERROR');
}

export function createAPIError(message: string, details?: unknown): GDriveMCPError {
  return new GDriveMCPError(message, 'API_ERROR', details);
}

export function createValidationError(message: string): GDriveMCPError {
  return new GDriveMCPError(message, 'VALIDATION_ERROR');
}

export function createNotFoundError(resource: string, id: string): GDriveMCPError {
  return new GDriveMCPError(`${resource} not found: ${id}`, 'NOT_FOUND');
}

