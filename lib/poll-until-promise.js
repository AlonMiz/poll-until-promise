(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("PollUntil", [], factory);
	else if(typeof exports === 'object')
		exports["PollUntil"] = factory();
	else
		root["PollUntil"] = factory();
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


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PollUntil = function () {
  function PollUntil() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, PollUntil);

    // Used for angularJs internal functions, eg. $interval, $q, $timeout
    this._PromiseModule = options.Promise || Promise;
    this._useNewPromise = options.useNewPromise !== false;
    this._setTimeoutModule = options.setTimeout;

    this._interval = options.interval || 1000;
    this._timeout = options.timeout || 20 * 1000;
    this._stopOnFailure = options.stopOnFailure || false;
    this._isWaiting = false;
    this._isResolved = false;

    this.ERRORS = {
      NOT_FUNCTION: 'Your executor is not a function. functions and promises are valid.',
      FAILED_TO_WAIT: 'Failed to wait'
    };
  }

  _createClass(PollUntil, [{
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
    value: function execute(executeFn) {
      this._executeFn = executeFn;

      this._applyPromiseHandlers();
      this._validateExecution();

      this.start = Date.now();
      this._isWaiting = true;

      this._runFunction();

      return this.promise;
    }
  }, {
    key: 'getPromise',
    value: function getPromise() {
      return this.promise;
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
    key: '_applyPromiseHandlers',
    value: function _applyPromiseHandlers() {
      var _this = this;

      this.promise = this._getNewPromise(function (resolve, reject) {
        _this.resolve = resolve;
        _this.reject = reject;
      });
    }
  }, {
    key: '_getNewPromise',
    value: function _getNewPromise(promiseFn) {
      return this._useNewPromise ? new this._PromiseModule(promiseFn) : this._PromiseModule(promiseFn);
    }
  }, {
    key: '_validateExecution',
    value: function _validateExecution() {
      if (typeof this._executeFn !== 'function') {
        throw new Error(this.ERRORS.NOT_FUNCTION);
      }
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
      if (this._setTimeoutModule) {
        this._setTimeoutModule(this._runFunction.bind(this), this._interval);
      } else {
        setInterval(this._runFunction.bind(this), this._interval);
      }
    }
  }, {
    key: '_failedToWait',
    value: function _failedToWait() {
      return this.ERRORS.FAILED_TO_WAIT + ' after ' + this._timeFromStart() + 'ms';
    }
  }, {
    key: '_runFunction',
    value: function _runFunction() {
      var _this2 = this;

      if (this._shouldStopTrying()) {
        this._isWaiting = false;
        this.reject(this._failedToWait());
        return;
      }

      var executor = this._executeFn();
      if ((typeof executor === 'undefined' ? 'undefined' : _typeof(executor)) !== 'object' || typeof executor.then !== 'function') {
        executor = this._getNewPromise(function (resolve) {
          return resolve(executor);
        });
      }
      executor.then(function (result) {
        if (result) {
          _this2.resolve(result);
          _this2._isWaiting = false;
          _this2._isResolved = true;
          return;
        }
        _this2._executeAgain();
      }).catch(function (err) {
        if (_this2._stopOnFailure) {
          return _this2.reject(err);
        }
        return _this2._executeAgain();
      });
    }
  }]);

  return PollUntil;
}();

module.exports = PollUntil;

/***/ })
/******/ ]);
});
//# sourceMappingURL=poll-until-promise.js.map