function Game() {
	// placeholder game data
	this.resources = {
		paper: 0,
		ink: 0,
		money: 0
	};
}
var game;

function init() {
	game = new Game();
}

window.addEventListener ? window.addEventListener("load",init,false) : window.attachEvent && window.attachEvent("onload", init);