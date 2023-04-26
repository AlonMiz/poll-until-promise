// eslint-disable-next-line import/prefer-default-export
export class AbortError extends Error {
  cause: Error;

  constructor(cause: Error | string) {
    super(typeof cause === 'string' ? cause : cause.message);
    this.cause = typeof cause === 'string' ? new Error(cause) : cause;
  }
}
