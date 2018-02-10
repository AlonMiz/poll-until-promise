class PollUntil {
  constructor(options = {}) {
    // Used for angularJs internal functions, eg. $interval, $q, $timeout
    this._PromiseModule = options.Promise || Promise;
    this._setTimeoutModule = options.setTimeout;
    this._interval = options.interval || 100;
    this._timeout = options.timeout || 1000;
    this._stopOnFailure = options.stopOnFailure || false;
    this._isWaiting = false;
    this._isResolved = false;
    this._verbose = options.verbose;
    this._Console = console;

    this.ERRORS = {
      NOT_FUNCTION: 'Your executor is not a function. functions and promises are valid.',
      FAILED_TO_WAIT: 'Failed to wait'
    };
  }

  tryEvery(interval) {
    this._interval = interval;
    return this;
  }
  stopAfter(timeout) {
    this._timeout = timeout;
    return this;
  }
  execute(executeFn) {
    this._executeFn = executeFn;

    this._applyPromiseHandlers();
    this._validateExecution();

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
  _validateExecution() {
    if (typeof this._executeFn !== 'function') {
      throw new Error(this.ERRORS.NOT_FUNCTION);
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
    if (typeof this._setTimeoutModule === 'function') {
      this._setTimeoutModule(this._runFunction.bind(this), this._interval);
    } else {
      setTimeout(this._runFunction.bind(this), this._interval);
    }
  }
  _failedToWait() {
    const waitError = new Error(`${this.ERRORS.FAILED_TO_WAIT} after ${this._timeFromStart()}ms`);
    this._log(waitError);
    return waitError;
  }
  _runFunction() {
    if (this._shouldStopTrying()) {
      this._isWaiting = false;
      this.reject(this._failedToWait());
      return;
    }

    let executor = this._executeFn();
    if (typeof executor !== 'object' || typeof executor.then !== 'function') {
      executor = new this._PromiseModule(resolve => resolve(executor));
    }
    executor
      .then((result) => {
        if (result) {
          this.resolve(result);
          this._isWaiting = false;
          this._isResolved = true;
          this._log(`then done waiting with result: ${result}`);
          return;
        }
        this._log(`then execute again with result: ${result}`);
        this._executeAgain();
      })
      .catch((err) => {
        if (this._stopOnFailure) {
          this._log(`stopped on failure with err: ${err}`);
          return this.reject(err);
        }
        this._log(`catch with err: ${err}`);
        return this._executeAgain();
      });
  }

  _log(message) {
    if (this._verbose && this._Console && this._Console.log) this._Console.log(message);
  }
}

module.exports = PollUntil;
