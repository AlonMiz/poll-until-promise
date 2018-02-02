[![Build Status](https://travis-ci.org/AlonMiz/poll-until-promise.svg?branch=master)](https://travis-ci.org/AlonMiz/poll-until-promise)
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
    .stopAfter(2 * 1000)
    .tryEvery(100)
    .stopOnFailure(false) //Ignore errors
    .execute(() => {
        return new Promise((resolve, reject) => {
            if (+Date.now() >= later) {
            return resolve(true); //some truthy value
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
pollUntilPromise.isResolved() // false
```

* isWaiting
```js
pollUntilPromise.isWaiting() // true
```

* getPromise
```js
pollUntilPromise.getPromise().then(() => console.log('OMG')) //OMG
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
