/*
	Description:
	This file contains code for manual typing print / the minigame
*/

function Minigame() {
	this.id = "minigame";

	// maximum number of nextWords
	this.nextWords_cap = 5;

	// array containing the upcoming words to be typed
	this.nextWords_array = [];
	// actual state
	this.nextWords_string = "";
}

Minigame.prototype.init = function() {
	this.initHTML();
}

Minigame.prototype.initHTML = function() {
	/*
		Description:
		set up HTML for minigame
	*/
	let wrapper = document.createElement("div");
	wrapper.id = this.id + "_wrapper";

	let header = document.createElement("h3");
	header.innerText = "Minigame";
	wrapper.appendChild(header);

	let content = document.createElement("div");
	content.id = this.id;
	wrapper.appendChild(content);

	let location = get("printerRight");
	location.appendChild(wrapper);
}

Minigame.prototype.addWords = function() {
	/*
		Description:
		keeps adding new words into #minigame until there is a overflow
	*/
	// do not attempt to add words if there aren't any discover words
	if (game.discovered_words.length == 0) return;

	let ele = get(this.id);

	// while element is not overflowed in the x-axis
	while (ele.clientWidth >= ele.scrollWidth && this.nextWords_array.length < this.nextWords_cap) {
		let word = this.getRandomWord();
		this.writeWord(word);
	}
}

Minigame.prototype.writeWord = function(word) {
	/*
		Description:
		writes word to the minigame area, #minigame.
		the word is written inside a <div>, with each letter inside a <span>.
		there is also an extra <span> containing a ' '.

		also adds word to array this.nextWords_array
		also adds word to string this.nextWords_string
	*/
	// create element
	let wrapper = document.createElement("span");
	for (let i=0; i<word.length; i++) {
		let span = document.createElement("span");
		span.innerText = word[i];
		wrapper.appendChild(span);
	}
	let space = document.createElement("span");
	space.innerText = " ";
	wrapper.appendChild(space);

	// add to div
	get(this.id).appendChild(wrapper);

	// add word to this.nextWords_array
	this.nextWords_array.push(word);

	// add word to this.nextWords_string
	if (this.nextWords_string.length > 0)
		this.nextWords_string += " ";
	this.nextWords_string += word;
}

// helper functions

Minigame.prototype.getRandomWord = function() {
	/*
		Description:
		returns a random discovered word from game.discovered_words
	*/
	let length = game.discovered_words.length;
	let index = randInt(length);
	let word = game.discovered_words[ index ];
	return word;
}