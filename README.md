[![Build Status][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![NPM Version][npm-image]][npm-url]


# Poll Until Promise
Wait until the executed promise resolved to a true value,
Execute it every x milliseconds and stop after y milliseconds.


## Install
`npm install poll-until-promise`

## Usage

```js
const { waitFor } = require('poll-until-promise');

waitFor(() => fetch('/get-data'), { interval: 100 })
    // Tries every 100ms (from the last failure)
    .then(value => console.log('Yey', value))
    .catch(err => console.error(err));

```

```js
const { PollUntil } = require('poll-until-promise');

const later = Date.now() + 1 * 1000; // 1 seconds into the future

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
    timeout: 1000,
    stopOnFailure: false, // Ignores promise rejections
    verbose: false,

    // External Modules - e.g angularJs compatible
    setTimeout: $timeout,
    Promise: $q
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

## Used in AngularJs
An AngularJs compatible library based on `poll-until-promise` [angular-wait-until](https://github.com/AlonMiz/angular-wait-until).

[travis-url]: https://travis-ci.org/AlonMiz/poll-until-promise
[travis-image]: https://travis-ci.org/AlonMiz/poll-until-promise.svg?branch=master

[npm-url]: https://npmjs.org/package/poll-until-promise
[npm-image]: https://img.shields.io/npm/v/poll-until-promise.svg

[coveralls-url]: https://coveralls.io/github/AlonMiz/poll-until-promise
[coveralls-image]: https://img.shields.io/coveralls/AlonMiz/poll-until-promise.svg
