/*
	Description:
	This file contains code for manual typing print / the minigame
*/

function Minigame() {
	this.id = "minigame";
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