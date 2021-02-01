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

	// string containing the letters typed so far
	// up to a maximum of 1 'wrong' letter
	// e.g. current word to type is available
	// 		user types "avsil"
	//      this.type == "avs"
	this.type = "";

	// if seen error in this.type
	this.seenError = false;
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

Minigame.prototype.process = function(e) {
	/*
		Description:
		handles keydown, main process of minigame

		Info:
		[A-Z] == [65-90]
		[a-z] == [97-122]
		[Space] == [32]
		[Backspace] == [8]
	*/
	let keyID = e.which;

	if (this.nextWords_array.length == 0) return;

	// turn everything to uppercase
	if (65 <= keyID && keyID <= 90) keyID += 32;

	// backspace
	if (keyID == 8) {
		// string is empty, do nothing
		if (this.type == "")
			return;
		// else trigger a delete, in HTML and JS
		else {
			let deleteIndex = this.type.length-1;
			// undo last char in HTML
			this.color(deleteIndex, "neutral");
			// remove last char in JS
			this.type = this.type.slice(0, -1);

			// reset seenError
			this.seenError = false;
		}
	}

	// space
	else if (keyID == 32) {
		if (this.seenError) return;

		let stringIndex = this.type.length;
		let index = this.getIndexInfo(stringIndex);
		// correct
		// in this situation, a full word has been typed, and charIndex points to a space.
		if (index.wordIndex == 1 && index.charIndex == -1) {
			// remove the word, and award money
			this.completeWord();
		}
		// else color wrong
		else {
			this.color(stringIndex, "wrong");
			this.seenError = true;
			this.type += " ";
		}
	}

	// letter
	else if (97 <= keyID && keyID <= 122) {
		if (this.seenError) return;

		let stringIndex = this.type.length;
		let actualChar = this.nextWords_string[stringIndex];
		let typedChar = String.fromCharCode(keyID);

		this.type += typedChar;

		if (typedChar == actualChar)
			this.color(stringIndex, "correct");
		else {
			this.color(stringIndex, "wrong");
			this.seenError = true;
		}
	}
}

Minigame.prototype.color = function(stringIndex, type) {
	/*
		Description:
		Colors a character at [stringIndex] depending on [type].

		correct: green (letter)
		wrong: red (letter)
		neutral: black (backspace)
	*/
	let index = this.getIndexInfo(stringIndex);
	// adjust index only if charIndex = -1
	if (index.charIndex == -1) {
		index.wordIndex--;
		index.charIndex = this.nextWords_array[index.wordIndex].length;
	}
	let letterEle = get(this.id).children[index.wordIndex].children[index.charIndex];

	if (type == "neutral") {
		// check if the element trying to set font color is just a space
		if (letterEle.innerText == " ")
			letterEle.style.backgroundColor = "";
		else
			letterEle.style.color = "";
	}
	else if (type == "correct")
		letterEle.style.color = "green";
	else if (type == "wrong") {
		// check if the element trying to set font color is just a space
		if (letterEle.innerText == " ")
			letterEle.style.backgroundColor = "red";
		else
			letterEle.style.color = "red";
	}
}

Minigame.prototype.completeWord = function() {
	/*
		Description:
		this function is called when the first word is typed correctly, including the space after it
	*/

	let word = this.nextWords_array[0];

	// step 1: remove the word

	// remove from HTML
	get(this.id).children[0].remove();
	// remove from this.nextWords_array
	this.nextWords_array.shift();
	// remove from this.nextWords_string
	this.nextWords_string = this.nextWords_array.join(" ");
	// remove from this.type
	this.type = "";

	// step 2: award money
	// true parameter states that wordRevenue is called from minigame, so no bonus to be awarded
	let revenue = game.wordRevenue(word, true);
	game.gain_resource("money", revenue);
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

Minigame.prototype.getIndexInfo = function(stringIndex) {
	/*
		Description:
		converts index for this.nextWords_string, to index for this.nextWords_array

		returns an object
		data.wordIndex
		data.charIndex

		e.g.
		this.nextWords_string = "alpha beta"
		stringIndex = 7, corresponding to 'e'
		data.wordIndex = 1
		data.charIndex = 1
		number of spaces == wordIndex
	*/
	let index = -1;
	let spaceCount = 0;
	let distanceFrom_lastSpace = 0;

	while (index < stringIndex) {
		index++;
		let char = this.nextWords_string[index];
		if (char == " ") {
			spaceCount++;
			distanceFrom_lastSpace = 0;
		}
		else
			distanceFrom_lastSpace++;
	}

	// special case
	if (spaceCount == 0 && distanceFrom_lastSpace == 0)
		return {wordIndex: 0, charIndex: 0};

	// if charIndex == -1,
	// then the character is necessarily " ".
	// the wordIndex would also refer to the next word's index
	let data = {
		wordIndex: spaceCount,
		charIndex: distanceFrom_lastSpace-1
	};

	return data;
}

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