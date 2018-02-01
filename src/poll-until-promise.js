const errors = {
  NOT_FUNCTION: 'Your executor is not a function. functions and promises are valid.'
};
class PollUntil {
  constructor(options = {}) {
    this._interval = options.interval || 1000;
    this._timeout = options.timeout || 20 * 1000;
    this._stopOnFailure = options.stopOnFailure || false;
    this._isWaiting = false;
    this._isResolved = false;
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
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
    this._executeFn = executeFn;
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

  _validateExecution() {
    if (typeof this._executeFn !== 'function') {
      throw new Error(errors.NOT_FUNCTION);
    }
  }
  _timeFromStart() {
    return Date.now() - this.start;
  }
  _shouldStopTrying() {
    return this._timeFromStart() > this._timeout;
  }
  _executeAgain() {
    setTimeout(() => {
      this._runFunction();
    }, this._interval);
  }
  _runFunction() {
    if (this._shouldStopTrying()) {
      this._isWaiting = false;
      this.reject('Failed to wait');
      return;
    }

    let executor = this._executeFn();
    if (typeof executor.then !== 'function') {
      executor = new Promise(resolve => resolve(executor));
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
