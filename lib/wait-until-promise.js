(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("wait-until-promise", [], factory);
	else if(typeof exports === 'object')
		exports["wait-until-promise"] = factory();
	else
		root["wait-until-promise"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(1);

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/** wait until the executed promise resolved to a true value,
 *  execute it every x milliseconds and stop after y milliseconds
 *  example
 *  var later = +Date.now() + 5000;
 *  WaitUntil()
 *      .stopAfter(30 * 1000)
 *      .tryEvery(2 * 1000)
 *      .stopOnFailure(true)
 *      .execute(function () {
 *         var promise = Q.defer()
 *         if (+Date.now() >= later) {
 *             promise.resolve('wow'); //some true value
 *         } else {
 *             promise.resolve(false);
 *         }
 *         return promise.promise;
 *      })
 *      .then(function () {
 *             console.log('YEY')
 *      })
 *      .catch(function(){
 *             console.log('AYY')
 *      });
 *
 * @options {object} - optional option object
 */
Promise.defer = function () {
    var resolve, reject;
    var promise = new Promise(function () {
        resolve = arguments[0];
        reject = arguments[1];
    });
    return {
        resolve: resolve,
        reject: reject,
        promise: promise
    };
};

var WaitUntilPromise = function () {
    function WaitUntilPromise(options) {
        _classCallCheck(this, WaitUntilPromise);

        options = options || {};
        this._interval = options.interval || 1000;
        this._timeout = options.timeout || 20 * 1000;
        this._isWaiting = false;
        this._isResolved = false;
        this._stopOnFailure = false;
    }

    _createClass(WaitUntilPromise, [{
        key: 'tryEvery',
        value: function tryEvery(interval) {
            this._interval = interval;
            return this;
        }
    }, {
        key: 'stopAfter',
        value: function stopAfter(timeout) {
            this._timeout = timeout;
            return this;
        }
    }, {
        key: 'execute',
        value: function execute(_execute) {
            this.defer = Promise.defer();
            this.executeFn = _execute;
            this.start = Date.now();
            this._isWaiting = true;

            this._runFunction();

            return this.defer.promise;
        }
    }, {
        key: 'getPromise',
        value: function getPromise() {
            return this.defer.promise;
        }
    }, {
        key: 'isResolved',
        value: function isResolved() {
            return this._isResolved;
        }
    }, {
        key: 'isWaiting',
        value: function isWaiting() {
            return this._isWaiting;
        }
    }, {
        key: 'stopOnFailure',
        value: function stopOnFailure(stop) {
            this._stopOnFailure = stop;
            return this;
        }
    }, {
        key: '_timeFromStart',
        value: function _timeFromStart() {
            return Date.now() - this.start;
        }
    }, {
        key: '_shouldStopTrying',
        value: function _shouldStopTrying() {
            return this._timeFromStart() > this._timeout;
        }
    }, {
        key: '_executeAgain',
        value: function _executeAgain() {
            var _this = this;

            setTimeout(function () {
                _this._runFunction();
            }, this._interval);
        }
    }, {
        key: '_runFunction',
        value: function _runFunction() {
            var _this2 = this;

            if (this._shouldStopTrying()) {
                this._isWaiting = false;
                this.defer.reject('Failed to wait');
                return;
            }

            this.executeFn().then(function (result) {
                if (result) {
                    _this2.defer.resolve(result);
                    _this2._isWaiting = false;
                    _this2._isResolved = true;
                    return;
                }
                _this2._executeAgain();
            }).catch(function (err) {
                console.error(err);
                if (_this2._stopOnFailure) {
                    return _this2.defer.reject(err);
                }
                _this2._executeAgain();
            });
        }
    }]);

    return WaitUntilPromise;
}();

module.exports = WaitUntilPromise;

/***/ })
/******/ ]);
});
//# sourceMappingURL=wait-until-promise.js.map