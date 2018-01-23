[![Build Status](https://travis-ci.org/AlonMiz/poll-until.svg?branch=master)](https://travis-ci.org/AlonMiz/poll-until)
# Poll Until Promise
Wait until the executed promise resolved to a true value,
Execute it every x milliseconds and stop after y milliseconds.


## Install
`npm install poll-until`

## Usage

```js
const later = Date.now() + 20 * 1000;

PollUntil()
    .stopAfter(30 * 1000)
    .tryEvery(2 * 1000)
    .stopOnFailure(false) //Ignore errors
    .execute(() => {
        return new Promise(resolve, reject) => {
            if (+Date.now() >= later) {
                return resolve(true); //some truthy value
            }
            reject(false);
        }
    })
    .then((value) => console.log('Yey', value))
    .catch((err) => console.error(err));
```
