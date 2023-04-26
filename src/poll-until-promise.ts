import { AbortError } from './abort';

const ERRORS = {
  NOT_FUNCTION: 'Your executor is not a function. functions and promises are valid.',
  FAILED_TO_WAIT: 'Failed to wait',
};

function promisify(fn: any) {
  return async () => {
    const result = await fn();
    return result;
  };
}

export type IExecuteFunction = any;

function validateExecution(executeFn: IExecuteFunction) {
  if (typeof executeFn !== 'function') {
    throw new Error(ERRORS.NOT_FUNCTION);
  }
}

export interface IWaitForOptions {
  timeout?: number
  interval?: number
  message?: string
  stopOnFailure?: boolean
  backoffFactor?: number
  backoffMaxInterval?: number
  verbose?: boolean
  maxAttempts?: number
}

export class PollUntil {
  _interval: number;
  _timeout: number;
  _attemptCount: number;
  private _stopOnFailure: boolean;
  private readonly _backoffFactor: number;
  private readonly _backoffMaxInterval: number;
  private readonly _Console: Console;
  private readonly originalStacktraceError: Error;
  private readonly _userMessage: string;
  private readonly _verbose: boolean;
  private readonly _maxAttempts: number | undefined;
  private _isWaiting: boolean;
  private _isResolved: boolean;
  private _executeFn: IExecuteFunction;
  private start: number;
  private promise: Promise<any> | undefined;
  private resolve: ((value: any) => void) | undefined;
  private reject: ((reason?: any) => void) | undefined;
  private _lastError: Error | undefined;

  constructor({
    interval = 100,
    timeout = 1000,
    stopOnFailure = false,
    verbose = false,
    backoffFactor = 1,
    backoffMaxInterval,
    message = '',
    maxAttempts,
  }:IWaitForOptions = {}) {
    this._interval = interval;
    this._timeout = timeout;
    this._attemptCount = 1;
    this._stopOnFailure = stopOnFailure;
    this._isWaiting = false;
    this._isResolved = false;
    this._verbose = verbose;
    this._userMessage = message;
    this.originalStacktraceError = new Error();
    this._Console = console;
    this._backoffFactor = backoffFactor;
    this._backoffMaxInterval = backoffMaxInterval || timeout;
    this._maxAttempts = maxAttempts;
    this.start = +Date.now();
  }

  tryEvery(interval: number): PollUntil {
    this._interval = interval;
    return this;
  }

  stopAfter(timeout: number): PollUntil {
    this._timeout = timeout;
    return this;
  }

  execute(executeFn: IExecuteFunction): Promise<any> {
    this._applyPromiseHandlers();
    validateExecution(executeFn);
    this._executeFn = promisify(executeFn);

    this.start = Date.now();
    this._isWaiting = true;

    this._log('starting to execute');
    this._runFunction();

    return this.promise!;
  }

  getPromise(): Promise<any> {
    return this.promise!;
  }

  isResolved() {
    return this._isResolved;
  }

  isWaiting() {
    return this._isWaiting;
  }

  stopOnFailure(stop: boolean): PollUntil {
    this._stopOnFailure = stop;
    return this;
  }

  _applyPromiseHandlers() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  _timeFromStart() {
    return Date.now() - this.start;
  }

  _shouldStopTrying() {
    return this._timeFromStart() > this._timeout || this._attemptsExhausted();
  }

  _attemptsExhausted() {
    return this._maxAttempts !== undefined && this._attemptCount > this._maxAttempts;
  }

  _executeAgain() {
    this._log('executing again');
    const currentInterval = this._interval;
    const nextInterval = currentInterval * this._backoffFactor;
    this._interval = (nextInterval > this._backoffMaxInterval) ? this._backoffMaxInterval : nextInterval;
    this._attemptCount += 1;
    setTimeout(this._runFunction.bind(this), currentInterval);
  }

  _failedToWait() {
    let waitErrorText = this._attemptsExhausted()
      ? `Operation unsuccessful after ${this._maxAttempts} attempts`
      : `${ERRORS.FAILED_TO_WAIT} after ${this._timeFromStart()}ms`;
    if (this._userMessage) waitErrorText = `${waitErrorText}: ${this._userMessage}`;
    if (this._lastError) {
      this._lastError.message = `${waitErrorText}\n${this._lastError.message}`;
      const originalStack = this.originalStacktraceError.stack;
      if (originalStack) {
        this._lastError.stack += originalStack.substring(originalStack.indexOf('\n') + 1);
      }
    } else {
      this._lastError = this.originalStacktraceError;
      this._lastError.message = waitErrorText;
    }
    this._log(this._lastError);
    return this._lastError;
  }

  _runFunction() {
    if (this._shouldStopTrying()) {
      this._isWaiting = false;
      this.reject?.(this._failedToWait());
      return;
    }

    this._executeFn()
      .then((result: any) => {
        if (result === false) {
          this._log(`then execute again with result: ${result}`);
          this._executeAgain();
          return;
        }
        this.resolve?.(result);
        this._isWaiting = false;
        this._isResolved = true;
        this._log(`then done waiting with result: ${result}`);
      })
      .catch((err: Error) => {
        if (err instanceof AbortError) {
          this._log(`aborted with err: ${err.cause}`);
          return this.reject?.(err.cause);
        }
        if (this._stopOnFailure) {
          this._log(`stopped on failure with err: ${err}`);
          return this.reject?.(err);
        }
        this._lastError = err;
        this._log(`catch with err: ${err}`);
        return this._executeAgain();
      });
  }

  _log(message: Error | string) {
    if (this._verbose && this._Console && this._Console.log) this._Console.log(message);
  }
}

export const waitFor = (waitForFunction:IExecuteFunction, options?: IWaitForOptions) => new PollUntil(options).execute(waitForFunction);
