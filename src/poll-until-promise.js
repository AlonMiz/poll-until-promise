const ERRORS = {
  NOT_FUNCTION: 'Your executor is not a function. functions and promises are valid.',
  FAILED_TO_WAIT: 'Failed to wait',
};


class PollUntil {
  constructor({
    Promise = global.Promise,
    setTimeout,
    interval = 100,
    timeout = 1000,
    stopOnFailure = false,
    verbose = false,
    backoffFactor = 1,
    message,
  } = {}) {
    // Used for angularJs internal functions, eg. $interval, $q, $timeout
    this._PromiseModule = Promise;
    this._setTimeoutModule = setTimeout;
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
  }

  tryEvery(interval) {
    this._interval = interval;
    return this;
  }

  stopAfter(timeout) {
    this._timeout = timeout;
    return this;
  }

  promisify(fn) {
    return async () => {
      try {
        const result = await fn();
        return result;
      } catch (e) {
        throw e;
      }
    };
  };

  execute(executeFn) {
    this._applyPromiseHandlers();
    this._validateExecution(executeFn);
    this._executeFn = this.promisify(executeFn);

    this.start = Date.now();
    this._isWaiting = true;

    this._log('starting to execute');
    this._runFunction();

    return this.promise;
  }

  getPromise() {
    return this.promise;
  }

  isResolved() {
    return this._isResolved;
  }

  isWaiting() {
    return this._isWaiting;
  }

  stopOnFailure(stop) {
    this._stopOnFailure = stop;
    return this;
  }


  _applyPromiseHandlers() {
    this.promise = new this._PromiseModule((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  _validateExecution(executeFn) {
    if (typeof executeFn !== 'function') {
      throw new Error(ERRORS.NOT_FUNCTION);
    }
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
    if (typeof this._setTimeoutModule === 'function') {
      this._setTimeoutModule(this._runFunction.bind(this), this._interval);
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
      this._lastError.stack += originalStack.substring(originalStack.indexOf('\n') + 1);
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
      this.reject(this._failedToWait());
      return;
    }

    this._executeFn()
      .then((result) => {
        if (result === false) {
          this._log(`then execute again with result: ${result}`);
          this._executeAgain();
          return;
        }
        this.resolve(result);
        this._isWaiting = false;
        this._isResolved = true;
        this._log(`then done waiting with result: ${result}`);
      })
      .catch((err) => {
        if (this._stopOnFailure) {
          this._log(`stopped on failure with err: ${err}`);
          return this.reject(err);
        }
        this._lastError = err;
        this._log(`catch with err: ${err}`);
        return this._executeAgain();
      });
  }

  _log(message) {
    if (this._verbose && this._Console && this._Console.log) this._Console.log(message);
  }
}

module.exports = {
  PollUntil,
  waitFor: (callback, options) => new PollUntil(options).execute(callback),
};
