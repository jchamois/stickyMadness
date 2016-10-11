(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['checkvisibility', 'element-closest'], factory);
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
			stuckLimitSelector: '.sticky-container', // must be a ancestor of el
			getStickyLimitTop: null,
			getStickyLimitBottom: null
		};

		function Sticky(el, opt) {
			this.options = defaultOptions;

			if (opt) {
				this.options.stickClass = opt.stickClass || defaultOptions.stickClass;
				this.options.stuckClass = opt.stuckClass || defaultOptions.stuckClass;
				this.options.stuckLimitSelector = opt.stuckLimitSelector || defaultOptions.stuckLimitSelector;
				this.getStickyLimitTop = opt.getStickyLimitTop;
				this.getStickyLimitBottom = opt.getStickyLimitBottom;
			}

			this.el = el;

			this.parent = this.el.parentNode;

			this.stickyLimit = this.el.closest(this.options.stuckLimitSelector);

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

				this.onScroll = this.onScroll.bind(this);
				this.onResize = this.onResize.bind(this);

				window.addEventListener('scroll', this.onScroll);
				window.addEventListener('resize', this.onResize);
			}
		};

		Sticky.prototype.onScroll = function onScroll() {
			lastScrollY = window.scrollY;
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
