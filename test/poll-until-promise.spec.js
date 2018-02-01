const chai = require('chai');
const expect = chai.expect;
const spies = require('chai-spies');
chai.use(spies);

const PollUntil = require('../lib/poll-until-promise.min');

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
          tryingAttemptsRemaining -= 1;
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
    const pollUntil = new PollUntil();
    expect(pollUntil._interval).to.equal(1000);
    expect(pollUntil._timeout).to.equal(20 * 1000);
  });

  it('should apply options with pre defined option object', () => {
    const pollUntil = new PollUntil(options);
    expect(pollUntil._interval).to.equal(options.interval);
    expect(pollUntil._timeout).to.equal(options.timeout);
  });

  it('should apply options by functional insert', () => {
    const pollUntil = new PollUntil()
      .tryEvery(options.interval)
      .stopAfter(options.timeout);

    expect(pollUntil._interval).to.equal(options.interval);
    expect(pollUntil._timeout).to.equal(options.timeout);
  });

  it('should execute runFunctions', () => {
    const pollUntil = new PollUntil();
    chai.spy.on(pollUntil, '_runFunction');

    pollUntil
      .tryEvery(options.interval)
      .stopAfter(options.timeout)
      .execute(someRandPromise);

    expect(pollUntil._runFunction).to.have.been.called();
  });

  it('should resolve the promise', (done) => {
    const pollUntil = new PollUntil();

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
    const pollUntil = new PollUntil();
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
    const pollUntil = new PollUntil();
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
    const pollUntil = new PollUntil();
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

  it('should throw an error if the execute function is not a function', (done) => {
    const pollUntil = new PollUntil();
    try {
      pollUntil
        .execute(5);
    } catch (e) {
      expect(e.message).to.contain('executor is not a function.');
      done();
    }
  });

  it('should convert a static function to a promise', (done) => {
    const pollUntil = new PollUntil();
    pollUntil
      .execute(() => 5)
      .then((value) => {
        expect(value).to.equal(5);
        done();
      });
  });

  it('should convert a static function that sometimes return undefined to a promise', (done) => {
    const pollUntil = new PollUntil();
    let counter = 0;
    pollUntil
      .tryEvery(2)
      .stopAfter(10)
      .execute(() => {
        if (counter > 0) {
          return 5;
        }
        counter += 1;
      })
      .then((value) => {
        expect(value).to.equal(5);
        done();
      });
  });
});
