function get(id) {
	return document.getElementById(id);
}

function getTime(date) {
	/*
		Description:
		Given a date, returns HH:MM:SS
	*/
	let formatted = date.toTimeString().split(" ")[0];
	return formatted;
}

function randInt(num) {
	/*
		Description:
		Returns a random integer from 0 to num-1.
	*/
	return Math.floor(Math.random() * num);
}

function randLetter() {
	/*
		Description:
		Returns a random letter from Game.possible_letters, and its index.
	*/
	let length = game.possible_letters.length;
	let index = randInt(length);
	return {
		letter: game.possible_letters[ index ],
		index: index
	};
}

function randWord() {
	/*
		Description:
		Returns a random word from dictionary.txt. Contents stored in var dictionary
	*/
	let length = dictionary.length;
	return dictionary[ randInt(length) ];
}

function round(num) {
	/*
		Description:
		Rounds a number to 2 decimal places.
	*/
	return parseFloat(num.toFixed(2));
}