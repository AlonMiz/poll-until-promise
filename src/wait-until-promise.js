class WaitUntilPromise {
  constructor(options = {}) {
    this._interval = options.interval || 1000;
    this._timeout = options.timeout || 20 * 1000;
    this._isWaiting = false;
    this._isResolved = false;
    this._stopOnFailure = false;
  }

  tryEvery(interval) {
    this._interval = interval;
    return this;
  }
  stopAfter(timeout) {
    this._timeout = timeout;
    return this;
  }
  execute(execute) {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
    this.executeFn = execute;
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

    this.executeFn()
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

module.exports = WaitUntilPromise;
