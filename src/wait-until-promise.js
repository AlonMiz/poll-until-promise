Promise.defer = () => {
  var resolve;
  var reject;
  var promise = new Promise(() => {
    resolve = arguments[0];
    reject = arguments[1];
  });
  return {
    resolve: resolve,
    reject: reject,
    promise: promise
  };
};

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
    this.defer = Promise.defer();
    this.executeFn = execute;
    this.start = Date.now();
    this._isWaiting = true;

    this._runFunction();

    return this.defer.promise;
  }
  getPromise() {
    return this.defer.promise;
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
      this.defer.reject('Failed to wait');
      return;
    }

    this.executeFn()
      .then((result) => {
        if (result) {
          this.defer.resolve(result);
          this._isWaiting = false;
          this._isResolved = true;
          return;
        }
        this._executeAgain();
      })
      .catch((err) => {
        if (this._stopOnFailure) {
          return this.defer.reject(err);
        }
        return this._executeAgain();
      });
  }
}

module.exports = WaitUntilPromise;
