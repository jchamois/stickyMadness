/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var APP = APP || {};

	window.Sticky = __webpack_require__(1);


	// MEDIA QUERY DEFINITION

	APP.mediaQuery = {};
	APP.mediaQuery.lg = window.matchMedia('(min-width: 1024px)');

	APP.stickyElem = document.querySelector('.js-stickable');
	APP.stickyElem.promArr = [];
	APP.stickyElem.images = APP.stickyElem.querySelectorAll('img');

	// PROMISE API

	APP.imgPromise = function (img) {

		return new Promise(function (resolve, reject) {
			img.addEventListener('load', function (e) {
				// we can do more but keep it simple for the sake of the demo
				resolve(img);
			}, false);
		});
	};

	// Create array of promises

	Array.prototype.forEach.call(APP.stickyElem.images, function (img, i) {
		// Stacking promise

		APP.imgPromise(img).then(function (rep) {
			rep.parentNode.classList.remove('loading');
		});

		APP.stickyElem.promArr.push(APP.imgPromise(img));
	});

	// Wait for all promise to be resolved

	Promise.all(APP.stickyElem.promArr).then(function (response) {

		if (APP.mediaQuery.lg.matches && !APP.stickyElem.sticky) {
			// a l'init on instancie sticky si il est null et qu on est dans la bonne MQ
			APP.stickyElem.sticky = new window.Sticky(APP.stickyElem);
		}

		APP.mediaQuery.lg.addListener(function (e) {

			if(e.matches){
				if (!APP.stickyElem.sticky) {
					console.log('Match la MQ et sticky non instancié => on init');
					APP.stickyElem.sticky = new window.Sticky(APP.stickyElem);
				}
				else {
					console.log('Match la MQ et sticky DEJA instancié => on l’enable');
					APP.stickyElem.sticky.enable();
				}
			}
			else {
				console.log('Ne Match pas la MQ et est instancié donc on disable');
				APP.stickyElem.sticky.disable();
			}
		});
	});






/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (root, factory) {
	    if (true) {
	        // AMD
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2), __webpack_require__(3)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else if (typeof exports === 'object') {
	        // Node, CommonJS-like
	        module.exports = factory(require('checkvisibility'), require('element-closest'));
	    } else {
	        // Browser globals (root is window)
	        root.returnExports = factory(root.CheckVisibility);
	    }
	}(this, function (CheckVisibility) {

		return (function (window, document, exportName) {

			var defaultOptions = {
				stickClass: 'is-sticked',
				stuckClass: 'is-stuck',
				stuckLimitSelector: '.sticky-container' // must be a ancestor of el
			};

			function Sticky(el, opt) {
				this.options = defaultOptions;

				if (opt) {
					this.options.stickClass = opt.stickClass || defaultOptions.stickClass;
					this.options.stuckClass = opt.stuckClass || defaultOptions.stuckClass;
					this.options.stuckLimitSelector = opt.stuckLimitSelector || defaultOptions.stuckLimitSelector;
				}

				this.el = el;
				this.parent = this.el.parentNode;

				this.stickyLimit = this.el.closest(this.options.stuckLimitSelector);

				this.stickyLimitHeight = this.stickyLimit.offsetHeight;
				this.el.height = this.el.offsetHeight;

				this.stuckLimit = (this.stickyLimit.offsetHeight - this.el.offsetHeight);

				this.isSticked = null;
				this.isStucked = null;

				var parentFromTop;
				var lastScrollY = 0;

				this.ticking = false;
				this.raf = null;

				this.init();
			}

			Sticky.prototype.init = function init() {

				// init visibility detection on parent

				if (this.stickyLimit.offsetHeight > this.el.offsetHeight) {

					this.parent.checkVisibility = new CheckVisibility(this.parent);

					// init handler on ready

					this.onScroll();

					window.addEventListener('scroll', this.onScroll.bind(this));

					window.addEventListener('resize', this.onResize.bind(this));
				}
			};


			Sticky.prototype.onScroll = function onScroll() {
				lastScrollY = window.scrollY;
				this.requestTick();
			};

			Sticky.prototype.onResize = function onResize() {
				// refresh position
				this.parent.checkVisibility.updatePosition();

				this.stuckLimit = this.stickyLimit.offsetHeight - this.el.offsetHeight;
			};

			Sticky.prototype.requestTick = function requestTick() {

				if (!this.ticking) {
					this.raf = window.requestAnimationFrame(this.stickOrStuck.bind(this));
					this.ticking = true;
				}
			};

			Sticky.prototype.disable = function disable() {

				// remove event handler and clean class relative to the sticky state
				window.removeEventListener('scroll', this.onScroll.bind(this));
				window.removeEventListener('resize', this.onResize.bind(this));

				this.el.classList.remove(this.options.stickClass);
				this.el.classList.remove(this.options.stuckClass);
			};

			Sticky.prototype.enable = function enable() {
				this.init();
			};

			Sticky.prototype.updateStuckLimit = function updateStuckLimit() {
				this.stuckLimit = this.stickyLimit.offsetHeight - this.el.offsetHeight;
			};

			Sticky.prototype.stickOrStuck = function stickOrStuck()  {

				// console.log('scrollHandler is fired');
				this.isSticked = this.el.classList.contains(this.options.stickClass);
				this.isStucked = this.el.classList.contains(this.options.stuckClass);

				parentFromTop = parseInt(this.parent.checkVisibility.fromTop());

				// ON STICK
				if (parentFromTop > 0 && parentFromTop < this.stuckLimit && !this.isSticked) {
					this.el.classList.add(this.options.stickClass);
				}

				// ON DESTICK
				if (parentFromTop <= 0 && this.isSticked ) {
					this.el.classList.remove(this.options.stickClass);
				}

				// ON STUCK
				if (parentFromTop >= this.stuckLimit && !this.isStucked) {
					this.el.classList.add(this.options.stuckClass);
				}

				// ON DESTUCK
				if (parentFromTop < this.stuckLimit && this.isStucked) {
					this.el.classList.remove(this.options.stuckClass);
				}

				this.ticking = false;
			};

			return Sticky;

		})(window, document, 'Sticky');
	}));


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;(function(window, document, exportName) {

		var win = window;
		var doc = document.documentElement;
		var docBody = document.body;

		var scrollY;
		var scrollX;

		var winHeight;
		var winWidth;

		var docHeight;

		var viewport = {};

		var trackLength;

		/** @constructor
		 *
	     * @param {element} elem - DOM element.
	     */
		var CheckVisibility  = function (elem) {
			this.elem = elem;

			this.bounds = {};
			this.deltas = {};

			// init
			this.updatePosition();
		};

		/** @function
		 * Measure position of viewport
		 */
		CheckVisibility.prototype.updatePosition = function updatePosition() {
			docHeight = Math.max(docBody.offsetHeight, doc.scrollHeight);
			winHeight = Math.max(win.innerHeight, doc.clientHeight);
			winWidth = Math.max(win.innerWidth, doc.clientWidth);
		};

		/** @function
		 * Measure bounds and delta of element
		 *
		 * @param {Number} y - >0 and <1
		 */
		CheckVisibility.prototype.measure = function measure(y) {
			var elemHeight = this.elem.offsetHeight;
			var elemWidth = this.elem.offsetWidth;
			var rect = this.elem.getBoundingClientRect(); // getBoundingClientRect CAUSES MAJOR REPAINT == fallback needed but no solution yet

			scrollY = win.pageYOffset; // IE 10 + purpose
			//scrollX = win.pageXOffset;

			viewport = {};

			viewport.top = scrollY;

			//viewport.right = viewport.left + winWidth;
			viewport.bottom = viewport.top + winHeight;

			this.bounds = {
				top :  rect.top + scrollY
				//left :  rect.left + scrollX
			};

			//bounds.right = bounds.left + elemWidth;
			this.bounds.bottom = this.bounds.top + elemHeight;

			if (y !== undefined) {
				this.deltas = {
					top : Math.min(1, (this.bounds.bottom - viewport.top) / elemHeight),
					bottom : Math.min(1, (viewport.bottom -  this.bounds.top) / elemHeight)
				};
			}
		};

		CheckVisibility.prototype.percentageScrolled = function percentageScrolled() {
			trackLength = docHeight - winHeight;

			return Math.floor(win.scrollY / trackLength * 100);
		};

		/** @function
		 * check if element is inView
		 *
		 * @param {Number} y - >0 and <1
		 * @return {Boolean}
		 */
		CheckVisibility.prototype.inView = function inView(y) {
			y = y || 0;

			this.measure(y);

			return (this.deltas.top * this.deltas.bottom) >= y; // true if elem is y x 100 % visible
		};

		/** @function
		 *
		 * @return {Number}
		 */
		CheckVisibility.prototype.fromBottom = function fromBottom() {
			this.measure();

			return viewport.bottom - this.bounds.bottom; // distance from bottom window
		};

		/** @function
		 *
		 * @return {Number}
		 */
		CheckVisibility.prototype.fromTop = function fromTop() {
			this.measure();

			return viewport.top - this.bounds.top; // distance from top window
		};

		/** @function
		 *
		 * @return {Number}
		 */
		CheckVisibility.prototype.viewportTop = function viewportTop() {
			this.measure();

			return viewport.top; // Same as scrollY
		};

		/** @function
		 *
		 * @return {Number}
		 */
		CheckVisibility.prototype.viewportBottom = function viewportBottom() {
			this.measure();

			return viewport.bottom; // distance from bottom scroll
		};

		/** @function
		 *
		 * @return {Boolean}
		 */
		CheckVisibility.prototype.bottomOfWindow = function bottomOfWindow() {
			this.measure();

			return (viewport.top + winHeight) >= (docHeight); // return true if window scrolled to bottom
		};

		// Export our constructor
		if (true) {
			!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
				return CheckVisibility;
			}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		}
		else if (typeof module !== 'undefined' && module.exports) {
			module.exports = CheckVisibility;
		}
		else {
			window[exportName] = CheckVisibility;
		}

		return CheckVisibility;

	})(window, document, 'CheckVisibility');


/***/ },
/* 3 */
/***/ function(module, exports) {

	// element-closest | CC0-1.0 | github.com/jonathantneal/closest

	if (typeof Element.prototype.matches !== 'function') {
		Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.webkitMatchesSelector || function matches(selector) {
			var element = this;
			var elements = (element.document || element.ownerDocument).querySelectorAll(selector);
			var index = 0;

			while (elements[index] && elements[index] !== element) {
				++index;
			}

			return Boolean(elements[index]);
		};
	}

	if (typeof Element.prototype.closest !== 'function') {
		Element.prototype.closest = function closest(selector) {
			var element = this;

			while (element && element.nodeType === 1) {
				if (element.matches(selector)) {
					return element;
				}

				element = element.parentNode;
			}

			return null;
		};
	}


/***/ }
/******/ ]);