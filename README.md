[![Build Status](https://travis-ci.org/AlonMiz/poll-until-promise.svg?branch=master)](https://travis-ci.org/AlonMiz/poll-until-promise)
[![Coverage Status](https://coveralls.io/repos/github/AlonMiz/poll-until-promise/badge.svg?branch=master)](https://coveralls.io/github/AlonMiz/poll-until-promise?branch=master)

# Poll Until Promise
Wait until the executed promise resolved to a true value,
Execute it every x milliseconds and stop after y milliseconds.


## Install
`npm install poll-until-promise`

## Usage

```js
const PollUntil = require('poll-until-promise');

const later = Date.now() + 1 * 1000; // 1 seconds into the future

let pollUntilPromise = new PollUntil();
pollUntilPromise
    .stopAfter(2 * 1000)    // Stop trying after 2 seconds
    .tryEvery(100)          // Tries every 100ms (from the last failure)
    .stopOnFailure(false)   // Ignore errors
    .execute(() => {
        return new Promise((resolve, reject) => {
            if (+Date.now() >= later) {
            return resolve(true); // Some truthy value
            }
            reject(false);
        })
    })
    .then((value) => console.log('Yey', value))
    .catch((err) => console.error(err));

```

## Options
```js
const options = {
    interval: 1000,
    timeout: 20 * 1000,
    stopOnFailure: false
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

## Another Example - Static Function

```js
const PollUntil = require('poll-until-promise');
const later = Date.now() + 1 * 1000; // 1 seconds into the future

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
