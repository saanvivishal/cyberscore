import type { ProblemDetails, ErrorCode } from '@cyberscore/types';

export class ApiError extends Error {
  readonly status: number;
  readonly code?: ErrorCode | string;
  readonly problem: ProblemDetails;

  constructor(problem: ProblemDetails) {
    super(problem.detail ?? problem.title);
    this.name = 'ApiError';
    this.status = problem.status;
    this.code = problem.code;
    this.problem = problem;
  }

  isAuthExpired(): boolean {
    return this.status === 401 && this.code === 'AUTH_TOKEN_EXPIRED';
  }

  isRateLimited(): boolean {
    return this.status === 429;
  }
}

export class NetworkError extends Error {
  constructor(cause: unknown) {
    super('Network request failed');
    this.name = 'NetworkError';
    this.cause = cause;
  }
}
