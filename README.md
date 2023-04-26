[![Build Status][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![NPM Version][npm-image]][npm-url]


# Poll Until Promise
Wait until the executed promise resolved to a true value,
Execute it every x milliseconds and stop after y milliseconds.


## Install
`npm install poll-until-promise`

## Usage

### Fetching data
```js
const { waitFor } = require('poll-until-promise');

waitFor(() => fetch('/get-data'), { interval: 100 })
    // Tries every 100ms (from the last failure)
    .then(value => console.log('Yey', value))
    .catch(err => console.error(err));

```

### Using async
```js
import { waitFor, AbortError } from 'poll-until-promise';

async function waitForDomElement(cssSelector = 'div') {
  try {
    const element = await waitFor(() => {
      const element = window.document.querySelector(cssSelector);
      if (!element) throw new Error(`failed to find element: ${cssSelector}`);
      return element;
    }, { timeout: 60_000 });

    return element;
  } catch (e) {
    console.error('faled to find dom element:', e);
    throw e;
  }
}

async function retryFetch(path = '/get-data') {
  try {
    const data = await waitFor(async () => {
      const res = await fetch(path);

      // Stop immediately if the resource doesn't exist
      if (res.status === 404) {
        throw new AbortError(res.statusText);
      }

      return res.json();
    }, { timeout: 60_000, interval: 1000 });
  } catch (e) {
    console.error('faled to fetch:', e);
    throw e;
  }
}
```


### Waiting for something to be successful
```js
const { waitFor } = require('poll-until-promise');

waitFor(() => {
  if (Math.random() >= 0.5) {
    throw new Error('try again');
  } else {
    console.log('all good')
  }
})
  .then(() => console.log('Yey'))
  .catch(err => console.error(err));
```

### Using the class
```js
const { PollUntil } = require('poll-until-promise');

const later = Date.now() + 1000; // 1 seconds into the future

let pollUntilPromise = new PollUntil();
pollUntilPromise
    .stopAfter(2 * 1000)    // Stop trying after 2 seconds
    .tryEvery(100)          // Tries every 100ms (from the last failure)
    .execute(() => {
        return new Promise((resolve, reject) => {
            if (+Date.now() >= later) {
                return resolve(true); // Some truthy value
            }
            reject(false);
        })
    })
    .then(value => console.log('Yey', value))
    .catch(err => console.error(err));

```


## Options
```js
const options = {
    interval: 100,
    backoffFactor: 1, // Exponential interval increase. Defaults to 1, which means no backoff
    backoffMaxInterval: 250, // Sets a maximum interval when using backoff. Defaults to the timeout value
    timeout: 1000,
    stopOnFailure: false, // Ignores promise rejections
    verbose: false,
    message: 'Waiting for time to pass :)', // custom message to display on failure
    maxAttempts: 5, // maximum attempts to make (default: no limit). Will still fail to wait if reaching timeout before attempts exhausted
};
let pollUntilPromise = new PollUntil(options);
```


## Methods

* isResolved
```js
pollUntilPromise.isResolved()
```

* isWaiting
```js
pollUntilPromise.isWaiting()
```

* getPromise
```js
pollUntilPromise.getPromise().then(() => console.log('OMG'))
```

## Static Function

```js
const PollUntil = require('poll-until-promise');
const later = Date.now() + 1000; // 1 seconds into the future

let pollUntilPromise = new PollUntil();
pollUntilPromise
    .stopAfter(2 * 1000)
    .tryEvery(100)
    .execute(() => {
        if (+Date.now() >= later) {
            return true;
        }
        return false;
    })
    .then((value) => console.log('Yey', value))
    .catch((err) => console.error(err));

```

[travis-url]: https://travis-ci.org/AlonMiz/poll-until-promise
[travis-image]: https://travis-ci.org/AlonMiz/poll-until-promise.svg?branch=master

[npm-url]: https://npmjs.org/package/poll-until-promise
[npm-image]: https://img.shields.io/npm/v/poll-until-promise.svg

[coveralls-url]: https://coveralls.io/github/AlonMiz/poll-until-promise
[coveralls-image]: https://img.shields.io/coveralls/AlonMiz/poll-until-promise.svg
