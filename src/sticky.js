// REQUIRE CLOSEST POLYFILL JAVASCRIPT

// matches polyfill

this.Element && function (ElementPrototype) {
	ElementPrototype.matches = ElementPrototype.matches ||
	ElementPrototype.matchesSelector ||
	ElementPrototype.webkitMatchesSelector ||
	ElementPrototype.msMatchesSelector ||
	function (selector) {
		var node = this, nodes = (node.parentNode || node.document).querySelectorAll(selector), i = -1;
		while (nodes[++i] && nodes[i] != node);
		return !!nodes[i];
	};
}(Element.prototype);

// closest polyfill require matches

this.Element && function (ElementPrototype) {
	ElementPrototype.closest = ElementPrototype.closest ||
	function (selector) {
		var el = this;
		while (el.matches && !el.matches(selector)) el = el.parentNode;
		return el.matches ? el : null;
	};
}(Element.prototype);


// LET'S DO A STICKY

window.sticky = (function () {

	function sticky(el, cssStickClass, cssStuckClass, stickyLimitClass) {

		var self = this;

		self.el = el;
		self.cssStickClass = cssStickClass;
		self.cssStuckClass = cssStuckClass;
		self.parent = self.el.parentNode;
		self.stickyLimitClass = stickyLimitClass;
		self.stickyLimit = self.el.closest('.'+self.stickyLimitClass);

		self.stickyLimitHeight = self.stickyLimit.offsetHeight;
		self.el.height = self.el.offsetHeight;

		var stuckLimit = (self.stickyLimit.offsetHeight - self.el.offsetHeight);
		var isSticked;
		var isStucked;
		var parentFromTop;
		var lastScrollY = 0;

		self.ticking = false;
		self.raf = null;

		self.onScroll = function(){
			lastScrollY = window.scrollY;
			self.requestTick();
		};

		self.requestTick = function(){

			if(!self.ticking) {
				self.raf = window.requestAnimationFrame(self.StickOrStuck);
				self.ticking = true;
			}
		};

		this.disable = function(){

			// remove scroll handler and clean class relative to the sticky state
			window.removeEventListener('scroll', self.onScroll);

			self.el.classList.remove(self.cssStickClass);
			self.el.classList.remove(self.cssStuckClass);
		};

		this.enable = function(){
			_init();
		};

		this.updateStuckLimit = function(){
			stuckLimit = (self.stickyLimit.offsetHeight - self.el.offsetHeight);
		};

		this.StickOrStuck = function() {

			//console.log('scrollHandler is fired');
			isSticked = self.el.classList.contains(self.cssStickClass);
			isStucked = self.el.classList.contains(self.cssStuckClass);

			parentFromTop = parseInt(self.parent.checkVisibility.fromTop());

			// ON STICK

			if(parentFromTop > 0 && parentFromTop < stuckLimit && !isSticked ) {

				self.el.classList.add(self.cssStickClass);
			}

			// ON DESTICK

			if(parentFromTop <= 0 && isSticked ) {

				self.el.classList.remove(self.cssStickClass);
			}

			// ON STUCK

			if(parentFromTop >= stuckLimit && !isStucked) {

				self.el.classList.add(self.cssStuckClass);
			}

			// ON DESTUCK

			if(parentFromTop < stuckLimit && isStucked) {

				self.el.classList.remove(self.cssStuckClass);
			}

			self.ticking = false;
		};

		function _init() {

			// init visibility detection on parent

			if(self.stickyLimit.offsetHeight > self.el.offsetHeight){

				self.parent.checkVisibility = new checkVisibility(self.parent);

				// init handler on ready

				self.onScroll();

				window.addEventListener('scroll', self.onScroll);

				window.addEventListener('resize', function() {

					// refresh position
					self.parent.checkVisibility.updatePosition();

					stuckLimit = (self.stickyLimit.offsetHeight - self.el.offsetHeight);
				});
			}
		}

		_init();
	}

	return sticky;

})();
