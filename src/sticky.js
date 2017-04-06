(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['checkvisibility', 'element-closest'], factory);
    } else if (typeof exports === 'object') {
        // Node, CommonJS-like
        module.exports = factory(require('checkvisibility'), require('element-closest'));
    } else {
        // Browser globals (root is window)
        root.Sticky = factory(root.CheckVisibility);
    }
}(this, function (CheckVisibility) {

		return (function (window, document) {

			var defaultOptions = {
				stickClass: 'js-sticked',
				stuckClass: 'js-stuck',
				stuckLimitSelector: '.js-sticky-container', // must be a ancestor of el
				offsetTop: 0,
				spacerElem: null,
				onInit: function(elem){},
				onEnabling: function(elem){},
				onDisabling: function(elem){},
				onStick: function(elem){},
				onUnStick: function(elem){},
				onStuck: function(elem){},
				onUnStuck: function(elem){}
			};

			// utils
			function isFunction(f) {
				return f && Object.prototype.toString.call(f) === '[object Function]';
			}

			// @contructor
			function Sticky(el, opt, jeaj) {

				this.options = defaultOptions;

				if (opt) {
					this.options.stickClass = opt.stickClass || defaultOptions.stickClass;
					this.options.stuckClass = opt.stuckClass || defaultOptions.stuckClass;
					this.options.stuckLimitSelector = opt.stuckLimitSelector || defaultOptions.stuckLimitSelector;
					this.options.offsetTop = opt.offsetTop || defaultOptions.offsetTop;

					this.options.onInit = opt.onInit || defaultOptions.onInit;
					this.options.onEnabling = opt.onEnabling || defaultOptions.onEnabling;
					this.options.onDisabling = opt.onDisabling || defaultOptions.onDisabling;

					this.options.onStick = opt.onStick || defaultOptions.onStick;
					this.options.onUnStick = opt.onUnStick || defaultOptions.onUnStick;
					this.options.onStuck = opt.onStuck || defaultOptions.onStuck;
					this.options.onUnStuck = opt.onUnStuck || defaultOptions.onUnStuck;
					this.options.spacerElem = opt.spacerElem || defaultOptions.spacerElem;
				}

				this.el = el;
				this.parent = this.el.parentNode;
				this.stickyLimit = this.el.closest(this.options.stuckLimitSelector);
				this.stickyLimitHeight = this.stickyLimit.offsetHeight;
				this.spacerHeight = (this.options.spacerElem) ? this.options.spacerElem.offsetHeight : 0;
				this.stuckLimit = (this.stickyLimit.offsetHeight - this.el.offsetHeight) - this.spacerHeight;

				this.isSticked = null;
				this.isStucked = null;

				this.parentFromTop = 0;
				this.lastScrollY = 0;

				this.ticking = false;
				this.raf = null;

				this.isOffsetFunction = isFunction(this.options.offsetTop);

				this.offsetTop = this.isOffsetFunction ? this.options.offsetTop() : this.options.offsetTop || 0;

				this.initialized = false;
				this.init();
			}

			Sticky.prototype.init = function init() {
				if(this.initialized || this.stickyLimit.offsetHeight <= this.parent.offsetHeight){
					return;
				}

				this.options.onInit(this.el);

				this.parent.checkVisibility = new CheckVisibility(this.parent);

				// init handler on ready
				this.onScroll();

				this.onScroll = this.onScroll.bind(this);
				this.onResize = this.onResize.bind(this);

				window.addEventListener('scroll', this.onScroll);
				window.addEventListener('resize', this.onResize);

				this.initialized = true;
			};

			Sticky.prototype.onScroll = function onScroll() {
				this.lastScrollY = window.scrollY;
				this.requestTick();
			};

			Sticky.prototype.onResize = function onResize() {
				// refresh calculation
				this.updateStuckLimit();
			};

			Sticky.prototype.requestTick = function requestTick() {

				if (!this.ticking) {
					this.raf = window.requestAnimationFrame(this.stickOrStuck.bind(this));
					this.ticking = true;
				}
			};

			Sticky.prototype.disable = function disable() {

				// remove event handler and clean class relative to the sticky state
				window.removeEventListener('scroll', this.onScroll);
				window.removeEventListener('resize', this.onResize);

				this.el.classList.remove(this.options.stickClass);
				this.el.classList.remove(this.options.stuckClass);

				this.options.onDisabling(this.el);
				this.el.style.removeProperty('top');
			};

			Sticky.prototype.enable = function enable() {

				this.options.onEnabling(this.el);

				this.onScroll();

				this.onScroll = this.onScroll.bind(this);
				this.onResize = this.onResize.bind(this);

				window.addEventListener('scroll', this.onScroll);
				window.addEventListener('resize', this.onResize);

			};

			Sticky.prototype.updateStuckLimit = function updateStuckLimit() {

				this.stuckLimit = (this.stickyLimit.offsetHeight - this.el.offsetHeight) - this.spacerHeight;
				this.offsetTop = this.isOffsetFunction ? this.options.offsetTop() : this.options.offsetTop || 0;

				// var delta = this.parent.getBoundingClientRect().top - this.stickyLimit.getBoundingClientRect().top;
				// this.stuckLimit = this.stickyLimit.offsetHeight - delta - this.getOffsetTop() - this.el.offsetHeight;
			};

			Sticky.prototype.stickOrStuck = function stickOrStuck()  {

				// console.log('scrollHandler is fired');

				this.isSticked = this.el.classList.contains(this.options.stickClass);
				this.isStucked = this.el.classList.contains(this.options.stuckClass);

				this.parentFromTop = parseInt(this.parent.checkVisibility.fromTop());

				// ON STICK
				if (this.parentFromTop > this.offsetTop && this.parentFromTop < this.stuckLimit && !this.isSticked) {
					this.el.classList.add(this.options.stickClass);
					this.options.onStick(this.el);
					this.el.style.top = this.spacerHeight + 'px';
				}

				// ON DESTICK
				if (this.parentFromTop <= this.offsetTop && this.isSticked ) {
					this.el.classList.remove(this.options.stickClass);
					this.options.onUnStick(this.el);
					this.el.style.removeProperty('top');
				}

				// ON STUCK
				if (this.parentFromTop >= this.stuckLimit  && !this.isStucked) {
					this.el.classList.add(this.options.stuckClass);
					this.options.onStuck(this.el);
				}

				// ON DESTUCK
				if (this.parentFromTop < this.stuckLimit  && this.isStucked) {
					this.el.classList.remove(this.options.stuckClass);
					this.options.onUnStuck(this.el);
				}

				this.ticking = false;
			};

			return Sticky;

		})(window, document);
}));
