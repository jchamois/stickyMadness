var APP = APP || {};

window.Sticky = require('../src/sticky.js');


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




