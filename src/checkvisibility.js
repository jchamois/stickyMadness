
window.checkVisibility = (function(window){

	function checkVisibility(elem){

		var self = this;

		var win = window;
		var doc = document.documentElement;
		var docBody = document.body;

		var winHeight;
		var winWidth;
		var rect;
		var elemHeight;
		var elemWidth;
		var docHeight;
		var bounds = {};
		var deltas = {};
		var scrollY;
		var scrollX;
		var rectTop;
		var offsetTop;
		var elemOffsetTop;
		var viewport;
		var trackLength;

		//var docClientTop

		self.elem = elem;

		this.updatePosition = function(){

			elemHeight = self.elem.offsetHeight;
			elemWidth = self.elem.offsetWidth;
			elemOffsetTop = self.elem.offsetTop;

			docHeight = Math.max(docBody.offsetHeight, doc.scrollHeight);
			winHeight = Math.max(win.innerHeight, doc.clientHeight);
			winWidth = Math.max(win.innerWidth, doc.clientWidth);
		};

		function is(elem, y){

			scrollY = win.pageYOffset; // IE 10 + purpose
			//scrollX = win.pageXOffset;

			// getBoundingClientRect CAUSES MAJOR REPAINT == fallback needed but no solution yet

			rect = self.elem.getBoundingClientRect();
			viewport = {
				top : scrollY
			};

			//viewport.right = viewport.left + winWidth;
			viewport.bottom = viewport.top + winHeight;

			bounds = {
				top :  rect.top + scrollY
				//left :  rect.left + scrollX
			};

			//bounds.right = bounds.left + elemWidth;
			bounds.bottom = bounds.top + elemHeight;

			if(y !== undefined){
				deltas = {
					top : Math.min( 1, ( bounds.bottom - viewport.top ) / elemHeight),
					bottom : Math.min(1, ( viewport.bottom -  bounds.top ) / elemHeight)
				};
			}
		}

		this.percentageScrolled = function(){

			trackLength = docHeight - winHeight;

			var pctScrolled = Math.floor(win.scrollY / trackLength * 100);

			return pctScrolled;
		};

		this.inView = function(y){

			var y = (y == undefined || y == 0) ? 0 : y;

			is(self.elem, y);

			return (deltas.top * deltas.bottom) >= y; // true si elem est visible a y x 100 %
		};

		this.fromBottom = function(){
			is(self.elem);

			return viewport.bottom - bounds.bottom; // distance du bottom window
		};

		this.fromTop = function(){
			is(self.elem);

			return viewport.top - bounds.top; // distance du top window
		};

		this.viewportTop = function(){
			is(self.elem);

			return viewport.top; // Same as scrollY
		};

		this.viewportBottom = function(){
			is(self.elem);

			return viewport.bottom; // distance from bottom scroll
		};

		this.bottomOfWindow = function(){

			is(self.elem);
			return (viewport.top + winHeight) >= (docHeight); // return si on a scroll toute la window
		};

		function _init(){
			self.updatePosition();
		}

		_init();
	}

	return checkVisibility;

})(window);
