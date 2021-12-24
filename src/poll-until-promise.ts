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
  PromiseModule?: PromiseConstructor
  setTimeoutFunction?: any
  interval?: number
  timeout?: number
  stopOnFailure?: boolean
  verbose?: boolean
  backoffFactor?: number
  message?: string

}

export class PollUntil {
  private readonly _PromiseModule: PromiseConstructor;
  private readonly _setTimeoutFunction: any;
  _interval: number;
  _timeout: number;
  private _stopOnFailure: boolean;
  private readonly _backoffFactor: number;
  private readonly _Console: Console;
  private readonly originalStacktraceError: Error;
  private readonly _userMessage: string;
  private readonly _verbose: boolean;
  private _isWaiting: boolean;
  private _isResolved: boolean;
  private _executeFn: IExecuteFunction;
  private start: number;
  private promise: Promise<any> | undefined;
  private resolve: ((value: any) => void) | undefined;
  private reject: ((reason?: any) => void) | undefined;
  private _lastError: Error | undefined;

  constructor({
    PromiseModule = global.Promise,
    setTimeoutFunction,
    interval = 100,
    timeout = 1000,
    stopOnFailure = false,
    verbose = false,
    backoffFactor = 1,
    message = '',
  }:IWaitForOptions = {}) {
    this._PromiseModule = PromiseModule;
    this._setTimeoutFunction = setTimeoutFunction;
    this._interval = interval;
    this._timeout = timeout;
    this._stopOnFailure = stopOnFailure;
    this._isWaiting = false;
    this._isResolved = false;
    this._verbose = verbose;
    this._userMessage = message;
    this.originalStacktraceError = new Error();
    this._Console = console;
    this._backoffFactor = backoffFactor;
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
    this.promise = new this._PromiseModule((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  _timeFromStart() {
    return Date.now() - this.start;
  }

  _shouldStopTrying() {
    return this._timeFromStart() > this._timeout;
  }

  _executeAgain() {
    this._log('executing again');
    this._interval *= this._backoffFactor;
    if (typeof this._setTimeoutFunction === 'function') {
      this._setTimeoutFunction(this._runFunction.bind(this), this._interval);
    } else {
      setTimeout(this._runFunction.bind(this), this._interval);
    }
  }

  _failedToWait() {
    let waitErrorText = `${ERRORS.FAILED_TO_WAIT} after ${this._timeFromStart()}ms`;
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

export const waitFor = (waitForFunction:IExecuteFunction, options: IWaitForOptions) => new PollUntil(options).execute(waitForFunction);
