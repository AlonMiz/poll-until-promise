# Wait Until Promise

/** wait until the executed promise resolved to a true value,
 *  execute it every x milliseconds and stop after y milliseconds
 *  example

```js
  var later = +Date.now() + 5000;
  WaitUntil()
      .stopAfter(30 * 1000)
      .tryEvery(2 * 1000)
      .stopOnFailure(true)
      .execute(function () {
         var promise = Q.defer()
         if (+Date.now() >= later) {
             promise.resolve('wow'); //some true value
         } else {
             promise.resolve(false);
         }
         return promise.promise;
      })
      .then(function () {
             console.log('YEY')
      })
      .catch(function(){
             console.log('AYY')
      });

/
