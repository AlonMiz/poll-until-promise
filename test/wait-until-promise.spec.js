const chai = require('chai');
const expect = chai.expect;
const spies = require('chai-spies');
chai.use(spies);

const WaitUntilPromise = require('../src/wait-until-promise');

describe('Unit: Wait Until Factory', () => {
  var options = {
    interval: 30,
    timeout: 100
  };
  var promiseTimeout = 10;
  var tryingAttempts = 3;
  var tryingAttemptsRemaining;
  var shouldHaltPromiseResolve = false;

  var someRandPromise = (timeout = promiseTimeout) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (shouldHaltPromiseResolve && tryingAttemptsRemaining > 0) {
          resolve(false);
          tryingAttemptsRemaining--;
        } else {
          resolve(true);
        }
      }, timeout);
    });
  };


  beforeEach(() => {
    tryingAttemptsRemaining = tryingAttempts;
    shouldHaltPromiseResolve = false;
  });

  it('should create the default wait params', () => {
    var waitUntil = new WaitUntilPromise();
    expect(waitUntil._interval).to.equal(1000);
    expect(waitUntil._timeout).to.equal(20 * 1000);
  });

  it('should apply options with pre defined option object', () => {
    var waitUntil = new WaitUntilPromise(options);
    expect(waitUntil._interval).to.equal(options.interval);
    expect(waitUntil._timeout).to.equal(options.timeout);
  });

  it('should apply options by functional insert', () => {
    var waitUntil = new WaitUntilPromise()
      .tryEvery(options.interval)
      .stopAfter(options.timeout);

    expect(waitUntil._interval).to.equal(options.interval);
    expect(waitUntil._timeout).to.equal(options.timeout);
  });

  it('should execute runFunctions', () => {
    var waitUntil = new WaitUntilPromise();
    chai.spy.on(waitUntil, '_runFunction');

    waitUntil
      .tryEvery(options.interval)
      .stopAfter(options.timeout)
      .execute(someRandPromise);

    expect(waitUntil._runFunction).to.have.been.called();
  });

  it('should resolve the promise', (done) => {
    var waitUntil = new WaitUntilPromise();

    waitUntil
      .tryEvery(options.interval)
      .stopAfter(options.timeout)
      .execute(someRandPromise)
      .then((value) => {
        expect(value).to.equal(true);
        done();
      });
  });

  it('should resolve a stubborn promise after few attempts', (done) => {
    var waitUntil = new WaitUntilPromise();
    shouldHaltPromiseResolve = true;

    waitUntil
      .tryEvery(1)
      .stopAfter(options.timeout)
      .execute(someRandPromise)
      .then((value) => {
        expect(value).to.equal(true);
        done();
      });
  });

  it('should reject a failed promise after timeout', (done) => {
    var waitUntil = new WaitUntilPromise();
    shouldHaltPromiseResolve = true;

    chai.spy.on(waitUntil, '_shouldStopTrying', () => true);

    waitUntil
      .tryEvery(options.interval)
      .stopAfter(options.timeout)
      .execute(someRandPromise)
      .catch((value) => {
        expect(value).to.equal('Failed to wait');
        done();
      });
  });

  it('should execute a second waiting when waiting is done (exceeded timeout) but not resolved', (done) => {
    var waitUntil = new WaitUntilPromise();
    waitUntil
      .tryEvery(5)
      .stopAfter(10)
      .execute(() => Promise.resolve(false))
      .catch(() => {
        expect(waitUntil.isWaiting()).to.equal(false);
        expect(waitUntil.isResolved()).to.equal(false);
      });


    waitUntil
      .tryEvery(5)
      .stopAfter(10)
      .execute(() => Promise.resolve(true))
      .then((value) => {
        expect(value).to.equal(true);
        expect(waitUntil.isWaiting()).to.equal(false);
        expect(waitUntil.isResolved()).to.equal(true);
        done();
      });
  });
});
