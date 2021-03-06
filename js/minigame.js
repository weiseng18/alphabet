/*
	Description:
	This file contains code for manual typing print / the minigame
*/

function Minigame() {
	this.id = "minigame";

	// maximum number of nextWords
	this.nextWords_cap = 10;

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

	// wpm tracker

	// time between WPM updates (in seconds)
	this.timeBetween = 0.5;
	// last WPM update
	this.lastUpdate = null;

	// max wait threshold (in seconds)
	// how long to wait before resetting WPM to 0
	this.maxWait = 5;

	// time of last typed character
	this.lastType = null;
	// start time of counting WPM
	this.startTime = null;

	// number of errors since this.startTime
	this.errorCount = 0;
	// number of characters since this.startTime
	// includes spaces and alphabets
	this.characterCount = 0;
}

Minigame.prototype.init = function() {
	this.initHTML();
	document.body.addEventListener("keydown", this, false);
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

	let WPM_div = document.createElement("div");

		let WPM_header = document.createElement("span");
		WPM_header.innerHTML = "Current WPM: ";

		let WPM_amount = document.createElement("span");
		WPM_amount.id = this.id + "_WPM";

		WPM_div.appendChild(WPM_header);
		WPM_div.appendChild(WPM_amount);

	wrapper.appendChild(WPM_div);

	let location = get("printerRight");
	location.appendChild(wrapper);
}

Minigame.prototype.handleEvent = function(evt) {
	/*
		Description:
		handleEvent function for use in addEventListener
	*/
	if (evt.type == "keydown") {
		// do not trigger manual typing if currently manually discovering word
		let discoverWord_input = get("wordInput");
		if (document.activeElement == discoverWord_input)
			return;
		this.process(evt);
	}
	else
		return;
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

	if (this.characterCount == 0 && this.errorCount == 0)
		// update start time
		this.startTime = getEpoch();

	// update last typed time
	this.lastType = getEpoch();

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

			// check the status of the letter to be deleted
			let status = this.getStatus(deleteIndex);
			if (status == "wrong")
				// decrement the number of errors by 1
				// chance of going below 0, when user AFKs with errors, and amends after the AFK threshold causes a reset
				this.errorCount--;

			// undo last char in HTML
			this.color(deleteIndex, "neutral");
			// remove last char in JS
			this.type = this.type.slice(0, -1);
		}
	}

	// space
	else if (keyID == 32) {

		// increment number of typed characters by 1
		this.characterCount++;

		let stringIndex = this.type.length;
		// correct
		// in this situation, a full word has been typed, and charIndex points to a space.
		if (this.checkComplete()) {
			// remove the word, and award money
			this.completeWord();
		}
		// else check if it is a space
		else {
			let actualChar = this.nextWords_string[stringIndex];
			let typedChar = String.fromCharCode(keyID);
			this.type += typedChar;

			if (typedChar == actualChar)
				this.color(stringIndex, "correct");
			else {
				// increment the number of errors by 1
				this.errorCount++;

				this.color(stringIndex, "wrong");
			}
		}
	}

	// letter
	else if (97 <= keyID && keyID <= 122) {

		// increment number of typed characters by 1
		this.characterCount++;

		let stringIndex = this.type.length;
		let actualChar = this.nextWords_string[stringIndex];
		let typedChar = String.fromCharCode(keyID);

		this.type += typedChar;

		if (typedChar == actualChar)
			this.color(stringIndex, "correct");
		else {
			// increment the number of errors by 1
			this.errorCount++;

			this.color(stringIndex, "wrong");
		}
	}

	// if the index in this.nextWords_string exceeds the index of second ' ', then do forceUpdate()
	// in other words, if user has accumulated two wrong words (including the spaces), then delete the first word
	let firstFound = this.nextWords_string.indexOf(" ");
	let secondFound = this.nextWords_string.indexOf(" ", firstFound + 1);

	if (this.type.length > secondFound)
		this.forceUpdate();
}

Minigame.prototype.getStatus = function(stringIndex) {
	/*
		Description:
		returns either "correct", "wrong", or "neutral", depending on the character typed at [stringIndex]
	*/

	// calculate index
	let index = this.getIndexInfo(stringIndex);
	// adjust index only if charIndex = -1
	if (index.charIndex == -1) {
		index.wordIndex--;
		index.charIndex = this.nextWords_array[index.wordIndex].length;
	}
	let letterEle = get(this.id).children[index.wordIndex].children[index.charIndex];

	let color;
	if (letterEle.innerHTML == " ")
		color = letterEle.style.backgroundColor;
	else
		color = letterEle.style.color;
	
	if (color == "green")
		return "correct";
	else if (color == "red")
		return "wrong";
	else
		return "neutral";
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
			letterEle.style.borderBottom = "";
		else
			letterEle.style.color = "";
	}
	else if (type == "correct") {
		// check if the element trying to set font color is just a space
		if (letterEle.innerText == " ")
			letterEle.style.borderBottom = "solid green 2px";
		else
			letterEle.style.color = "green";
	}
	else if (type == "wrong") {
		// check if the element trying to set font color is just a space
		if (letterEle.innerText == " ")
			letterEle.style.borderBottom = "solid red 2px";
		else
			letterEle.style.color = "red";
	}
}

Minigame.prototype.completeWord = function() {
	/*
		Description:
		this function is called when the last typed word is correct, including the space after it
	*/

	// add space character to this.type first, for easier execution in the following steps
	this.type += " ";

	// remove last word from this.nextWords_string and this.type
	let stringIndex = this.type.length - 1;

	// should return {wordIndex: wordIndex + 1, charIndex: -1}
	let indexInfo = this.getIndexInfo(stringIndex);
	let wordIndex = indexInfo.wordIndex - 1;

	let userTyped, generated;
	do {
		// remove by index
		this.type = stringRemoveByIndex(this.type, stringIndex);
		this.nextWords_string = stringRemoveByIndex(this.nextWords_string, stringIndex);

		stringIndex--;
	} while (stringIndex >= 0 && this.nextWords_string[stringIndex] != ' ')

	// remove last word from this.nextWords_array
	let word = this.nextWords_array.splice(wordIndex, 1)[0];

	// remove from HTML
	get(this.id).children[wordIndex].remove();

	// award money
	let revenueInfo = game.wordRevenue(word, true);
	let revenue = revenueInfo.base + revenueInfo.bonus;
	game.gain_resource("money", revenue);

	// word animation on printer
	trigger_wordAnimation(word);

	// update statistic
	statistics.update("num_typed_words", [1]);
}

Minigame.prototype.checkComplete = function() {
	/*
		Description:
		this function is to be called after user presses space. it will check if the last word typed is spelt correctly and in the correct position.
	*/

	// the space character has not been added to this.type yet
	let index = this.type.length;
	// assumption: this.type[index] == ' '
	// check if corresponding char is also a space
	if (this.nextWords_string[index] != ' ')
		return false;
	index--;
	// check if previous word is spelt correctly
	// to terminate at the next ' ' seen in this.nextWords_string
	while (index >= 0 && this.nextWords_string[index] != ' ') {
		let userTyped = this.type[index];
		let generated = this.nextWords_string[index];
		if (userTyped != generated)
			return false;
		index--;
	}
	return true;
}

Minigame.prototype.forceUpdate = function() {
	/*
		Description:
		this function is called when the user has accumulated two wrong words (including the spaces)
		
		1. delete first word
		2. add new word
	*/

	// step 1: delete first word

		let word = this.nextWords_array[0];
		// remove from HTML
		get(this.id).children[0].remove();
		// remove from this.nextWords_array
		this.nextWords_array.shift();
		// remove from this.nextWords_string
		this.nextWords_string = this.nextWords_array.join(" ");
		// remove from this.type, up to and including first space
		this.type = this.type.substring(word.length + 1);

	// step 2: add new word

		let newWord = this.getRandomWord();
		this.writeWord(newWord);

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

Minigame.prototype.calculate_WPM = function() {
	let currTime = getEpoch();

	// in seconds
	let delta = (currTime - this.startTime) / 1000;
	// in seconds
	let timeSinceLastType = (currTime - this.lastType) / 1000;

	// check if errorCount < 0, then reset to 0
	if (this.errorCount < 0)
		this.errorCount = 0;

	// reset WPM, if the time between now and the last typed time is > this.maxWait
	if (timeSinceLastType > this.maxWait) {
		this.errorCount = 0;
		this.characterCount = 0;

		return 0;
	}
	else {
		// calculation based on
		// https://www.speedtypingonline.com/typing-equations
		let gross = (this.characterCount / 5) / (delta / 60);
		let net = gross - (this.errorCount) / (delta / 60);
		let rounded = Math.round(net);

		return rounded < 0 ? 0 : rounded;
	}
}

Minigame.prototype.updateHTML_WPM = function(currTime) {
	/*
		Description:
		updates WPM in HTML
	*/
	this.lastUpdate = currTime;
	let wpm = this.calculate_WPM();
	get(this.id + "_WPM").innerHTML = wpm;
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