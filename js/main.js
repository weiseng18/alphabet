function wordAnimation(singleDistance, singleOpacity) {
	/*
		Description:
		this function is a single pass for the animation on the word

		Parameters:
		singleDistance (in px)
		singleOpacity
	*/

	// update opacity
	let opacity = this.style.opacity;
	let newOpacity = opacity - singleOpacity;
	this.style.opacity = newOpacity;

	// update y
	let y = parseFloat(this.style.top);
	let newY = y - singleDistance;
	this.style.top = newY + "px";

}

function trigger_wordAnimation(word) {
	/*
		Description:
		this function will create a word element, and then set up the following animation for a specific word:
			- word spawns on #printerArt
			- word floats up and fades away and disappears
		wordAnimation() contains a single pass for the animation on the word
	*/

	// step 1: calculate center location to spawn the word
	let rect = get("printerArt").getBoundingClientRect();

	let middleLocation = {
		x: (rect.left + rect.right) / 2,
		y: (rect.top + rect.bottom) / 2
	};

	// step 2: create floater element

	// step 2.1: HTML element

		// step 2.1.1: basic HTML element details
		let floater = document.createElement("span");
		floater.innerHTML = word;

		// step 2.1.2: set basic style
		floater.style.position = "absolute";
		floater.style.opacity = 1;
		floater.style.zIndex = 100;

	// step 2.2: calculate location

		// step 2.2.1: inject into DOM to use .getBoundingClientRect()
		floater.style.visibility = "hidden";
		document.body.appendChild(floater);
		let dimensions = floater.getBoundingClientRect();
		document.body.removeChild(floater);
		floater.style.visibility = "visible";

		// step 2.2.2: calculate and set location
		let spawnLocation = {
			x: middleLocation.x - dimensions.width / 2,
			y: middleLocation.y - dimensions.height / 2
		};

		floater.style.top = spawnLocation.y + "px";
		floater.style.left = spawnLocation.x + "px";

	// step 3: animation

		// step 3.1: define constants

		// note: duration, updateRate (in milliseconds)
		let duration = 1000;
		let updateRate = 10;
		// note: distance (in px)
		let distance = 100;

		// divide duration by updateRate, to get the iterations required
		let iterations = duration / updateRate;

		// calculate change required in one pass
		let singleDistance = distance / iterations;
		let singleOpacity = 1.0 / iterations;

		// step 3.2: attach setInterval and setTimeout

		var interval = setInterval( wordAnimation.bind(floater, singleDistance, singleOpacity), updateRate);

		// delete element after all passes complete
		setTimeout( () => {
			floater.parentNode.removeChild(floater);
			clearInterval(interval);
		}, duration);

	// step 4: append to body
	document.body.appendChild(floater);
}

var game, menu;

function init() {
	// set up game 
	game = new Game();
	game.init_upgrades();
	game.update_resources_max();

	game.initHTML_resources();

	game.initHTML_printerRefillButtons();
	game.updateHTML_printerRefillButtons();

	// set up menu
	menu = new Menu();
	menu.init_menu();
	menu.init_printer_menu();
	menu.init_letter_menu();
	menu.init_word_menu();
	menu.init_research_menu();
	menu.init_settings_menu();

	// as the game is still in development, this section gives a huge amount of starting money for testing purposes.
	game.resources["money"] = 10000;
	game.updateHTML_resources();

	// begin game
	game.discover_letter("a");
	game.discover_word("a");
	game.run();

}

window.addEventListener ? window.addEventListener("load",init,false) : window.attachEvent && window.attachEvent("onload", init);