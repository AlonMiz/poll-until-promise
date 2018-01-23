const chai = require('chai');
const expect = chai.expect;
const spies = require('chai-spies');
chai.use(spies);

const PollUntil = require('../src/poll-until');

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
    var pollUntil = new PollUntil();
    expect(pollUntil._interval).to.equal(1000);
    expect(pollUntil._timeout).to.equal(20 * 1000);
  });

  it('should apply options with pre defined option object', () => {
    var pollUntil = new PollUntil(options);
    expect(pollUntil._interval).to.equal(options.interval);
    expect(pollUntil._timeout).to.equal(options.timeout);
  });

  it('should apply options by functional insert', () => {
    var pollUntil = new PollUntil()
      .tryEvery(options.interval)
      .stopAfter(options.timeout);

    expect(pollUntil._interval).to.equal(options.interval);
    expect(pollUntil._timeout).to.equal(options.timeout);
  });

  it('should execute runFunctions', () => {
    var pollUntil = new PollUntil();
    chai.spy.on(pollUntil, '_runFunction');

    pollUntil
      .tryEvery(options.interval)
      .stopAfter(options.timeout)
      .execute(someRandPromise);

    expect(pollUntil._runFunction).to.have.been.called();
  });

  it('should resolve the promise', (done) => {
    var pollUntil = new PollUntil();

    pollUntil
      .tryEvery(options.interval)
      .stopAfter(options.timeout)
      .execute(someRandPromise)
      .then((value) => {
        expect(value).to.equal(true);
        done();
      });
  });

  it('should resolve a stubborn promise after few attempts', (done) => {
    var pollUntil = new PollUntil();
    shouldHaltPromiseResolve = true;

    pollUntil
      .tryEvery(1)
      .stopAfter(options.timeout)
      .execute(someRandPromise)
      .then((value) => {
        expect(value).to.equal(true);
        done();
      });
  });

  it('should reject a failed promise after timeout', (done) => {
    var pollUntil = new PollUntil();
    shouldHaltPromiseResolve = true;

    chai.spy.on(pollUntil, '_shouldStopTrying', () => true);

    pollUntil
      .tryEvery(options.interval)
      .stopAfter(options.timeout)
      .execute(someRandPromise)
      .catch((value) => {
        expect(value).to.equal('Failed to wait');
        done();
      });
  });

  it('should execute a second waiting when waiting is done (exceeded timeout) but not resolved', (done) => {
    var pollUntil = new PollUntil();
    pollUntil
      .tryEvery(5)
      .stopAfter(10)
      .execute(() => Promise.resolve(false))
      .catch(() => {
        expect(pollUntil.isWaiting()).to.equal(false);
        expect(pollUntil.isResolved()).to.equal(false);
      });


    pollUntil
      .tryEvery(5)
      .stopAfter(10)
      .execute(() => Promise.resolve(true))
      .then((value) => {
        expect(value).to.equal(true);
        expect(pollUntil.isWaiting()).to.equal(false);
        expect(pollUntil.isResolved()).to.equal(true);
        done();
      });
  });
});
