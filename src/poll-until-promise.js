class PollUntil {
  constructor(options = {}) {
    // Used for angularJs internal functions, eg. $interval, $q, $timeout
    this._PromiseModule = options.Promise || Promise;
    this._useNewPromise = options.useNewPromise !== false;
    this._setTimeoutModule = options.setTimeout;

    this._interval = options.interval || 1000;
    this._timeout = options.timeout || 20 * 1000;
    this._stopOnFailure = options.stopOnFailure || false;
    this._isWaiting = false;
    this._isResolved = false;

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
    this.promise = this._getNewPromise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
  _getNewPromise(promiseFn) {
    return this._useNewPromise ?
      new this._PromiseModule(promiseFn) :
      this._PromiseModule(promiseFn);
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
    if (this._setTimeoutModule) {
      this._setTimeoutModule(this._runFunction.bind(this), this._interval);
    } else {
      setInterval(this._runFunction.bind(this), this._interval);
    }
  }
  _failedToWait() {
    return `${this.ERRORS.FAILED_TO_WAIT} after ${this._timeFromStart()}ms`;
  }
  _runFunction() {
    if (this._shouldStopTrying()) {
      this._isWaiting = false;
      this.reject(this._failedToWait());
      return;
    }

    let executor = this._executeFn();
    if (typeof executor !== 'object' || typeof executor.then !== 'function') {
      executor = this._getNewPromise(resolve => resolve(executor));
    }
    executor
      .then((result) => {
        if (result) {
          this.resolve(result);
          this._isWaiting = false;
          this._isResolved = true;
          return;
        }
        this._executeAgain();
      })
      .catch((err) => {
        if (this._stopOnFailure) {
          return this.reject(err);
        }
        return this._executeAgain();
      });
  }
}

module.exports = PollUntil;
