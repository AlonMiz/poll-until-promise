# Wait Until Promise

Wait until the executed promise resolved to a true value,
Execute it every x milliseconds and stop after y milliseconds.


## Install
`npm install wait-until-promise`

## Usage

```js
const later = +Date.now() + 20 * 1000;

WaitUntilPromise()
    .stopAfter(30 * 1000)
    .tryEvery(2 * 1000)
    .stopOnFailure(true) //Ignore errors
    .execute(() => {
        return new Promise(resolve, reject) => {
            if (+Date.now() >= later) {
                return resolve(true); //some truthy value
            }
            reject(false);
        }
    })
    .then(() => {
        console.log('Yey')
    })
    .catch(() => {
        console.log('Ay')
    });
```
