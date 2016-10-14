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
			stuckLimitSelector: '.sticky-container', // must be a ancestor of el
			offsetTop: 0
		};

		// utils
		function isFunction(f) {
			return f && Object.prototype.toString.call(f) === '[object Function]';
		}

		// @contructor
		function Sticky(el, opt) {
			this.options = defaultOptions;

			if (opt) {
				this.options.stickClass = opt.stickClass || defaultOptions.stickClass;
				this.options.stuckClass = opt.stuckClass || defaultOptions.stuckClass;
				this.options.stuckLimitSelector = opt.stuckLimitSelector || defaultOptions.stuckLimitSelector;
				this.options.offsetTop = opt.offsetTop || defaultOptions.offsetTop;
			}

			this.el = el;

			this.parent = this.el.parentNode;

			this.stickyLimit = this.el.closest(this.options.stuckLimitSelector);

			this.updateStuckLimit();

			this.isSticked = null;
			this.isStucked = null;

			this.parentFromTop = 0;
			this.lastScrollY = 0;

			this.ticking = false;
			this.raf = null;

			this.init();
		}

		Sticky.prototype.init = function init() {

			// init visibility detection on parent

			if (this.stuckLimit > 0) {

				this.parent.checkVisibility = new CheckVisibility(this.parent);

				// init handler on ready

				this.onScroll();

				this.onScroll = this.onScroll.bind(this);
				this.onResize = this.onResize.bind(this);

				window.addEventListener('scroll', this.onScroll);
				window.addEventListener('resize', this.onResize);
			}
		};

		Sticky.prototype.onScroll = function onScroll() {
			this.lastScrollY = window.scrollY;
			this.requestTick();
		};

		Sticky.prototype.onResize = function onResize() {
			// refresh position
			this.parent.checkVisibility.updatePosition();

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
		};

		Sticky.prototype.enable = function enable() {
			this.init();
		};

		Sticky.prototype.updateStuckLimit = function updateStuckLimit() {
			var delta = this.parent.getBoundingClientRect().top - this.stickyLimit.getBoundingClientRect().top;
			this.stuckLimit = this.stickyLimit.offsetHeight - delta - this.getOffsetTop() - this.el.offsetHeight;
		};

		Sticky.prototype.stickOrStuck = function stickOrStuck()  {

			// console.log('scrollHandler is fired');
			this.isSticked = this.el.classList.contains(this.options.stickClass);
			this.isStucked = this.el.classList.contains(this.options.stuckClass);

			this.parentFromTop = parseInt(this.parent.checkVisibility.fromTop());

			var offsetTop = this.getOffsetTop();

			// ON STICK
			if (this.parentFromTop > -(offsetTop) && this.parentFromTop < this.stuckLimit && !this.isSticked) {
				this.el.classList.add(this.options.stickClass);
				this.el.style.top = offsetTop + 'px';
			}

			// ON DESTICK
			if (this.parentFromTop <= -(offsetTop) && this.isSticked ) {
				this.el.classList.remove(this.options.stickClass);
				this.el.style.removeProperty('top');
			}

			// ON STUCK
			if (this.parentFromTop >= this.stuckLimit && !this.isStucked) {
				this.el.classList.add(this.options.stuckClass);
			}

			// ON DESTUCK
			if (this.parentFromTop < this.stuckLimit && this.isStucked) {
				this.el.classList.remove(this.options.stuckClass);
			}

			this.ticking = false;
		};

		Sticky.prototype.getOffsetTop = function getOffsetTop() {
			return isFunction(this.options.offsetTop) ? this.options.offsetTop() : this.options.offsetTop || 0;
		};

		return Sticky;

	})(window, document);
}));
