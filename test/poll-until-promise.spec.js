const chai = require('chai');

const expect = chai.expect;
const spies = require('chai-spies');

chai.use(spies);

const PollUntil = require('../src/poll-until-promise');

describe('Unit: Wait Until Factory', () => {
  let options;
  let promiseTimeout;
  let tryingAttemptsRemaining;
  let shouldHaltPromiseResolve;
  let shouldRejectAfterHalt;

  const someRandPromise = (timeout = promiseTimeout) => new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldHaltPromiseResolve && tryingAttemptsRemaining > 0) {
        resolve(false);
        tryingAttemptsRemaining -= 1;
      } else if (shouldRejectAfterHalt) {
        reject(new Error('rejected'));
      } else {
        resolve(true);
      }
    }, timeout);
  });


  beforeEach(() => {
    promiseTimeout = 10;
    tryingAttemptsRemaining = 2;
    shouldHaltPromiseResolve = false;
    shouldRejectAfterHalt = false;
    options = {
      interval: 30,
      timeout: 100,
    };
  });

  it('should create the default wait params', () => {
    const pollUntil = new PollUntil();
    expect(pollUntil._interval).to.equal(100);
    expect(pollUntil._timeout).to.equal(1000);
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

  it('should get the promise', (done) => {
    const pollUntil = new PollUntil();

    pollUntil
      .tryEvery(options.interval)
      .stopAfter(options.timeout)
      .execute(someRandPromise);

    pollUntil
      .getPromise()
      .then((value) => {
        expect(value).to.equal(true);
        done();
      });
  });

  it('should resolve a stubborn promise after few attempts', (done) => {
    const pollUntil = new PollUntil({ verbose: true });
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
      .tryEvery(1)
      .stopAfter(5)
      .execute(someRandPromise)
      .catch((error) => {
        expect(error.message).to.contain('Failed to wait');
        done();
      });
  });

  it('should reject a failed promise when stopOnFailure is true', (done) => {
    const pollUntil = new PollUntil();

    pollUntil
      .tryEvery(options.interval)
      .stopAfter(options.timeout)
      .stopOnFailure(true)
      .execute(() => new Promise((resolve, reject) => {
        reject(new Error('wow'));
      }))
      .catch((error) => {
        expect(error.message).to.contain('wow');
        done();
      });
  });

  it('should try again until rejected for a failed promise when stopOnFailure is true', (done) => {
    const pollUntil = new PollUntil();
    shouldHaltPromiseResolve = true;
    shouldRejectAfterHalt = true;

    pollUntil
      .tryEvery(1)
      .stopAfter(options.timeout)
      .stopOnFailure(true)
      .execute(someRandPromise)
      .catch((error) => {
        expect(error.message).to.contain('rejected');
        done();
      });
  });

  it('should fail wait after timeout', (done) => {
    const pollUntil = new PollUntil();
    shouldHaltPromiseResolve = true;
    shouldRejectAfterHalt = true;
    const errorContent = 'error abcdefg';
    const specificFailedError = new Error(errorContent);
    pollUntil
      .tryEvery(1)
      .stopAfter(5)
      .execute(() => Promise.reject(specificFailedError))
      .catch((error) => {
        expect(error.message).to.contain('Failed to wait');
        expect(error.message).to.contain(errorContent);
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
        return undefined;
      })
      .then((value) => {
        expect(value).to.equal(5);
        done();
      });
  });

  it('should use an external setTimeout module', (done) => {
    shouldHaltPromiseResolve = true;
    tryingAttemptsRemaining = 2;

    const pollUntil = new PollUntil({ setTimeout });

    pollUntil
      .tryEvery(1)
      .stopAfter(options.timeout)
      .execute(someRandPromise)
      .then((value) => {
        expect(value).to.equal(true);
        done();
      });
  });
});
