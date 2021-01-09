function Game() {
	// placeholder game data
	this.resources = {
		paper: 0,
		ink: 0,
		money: 0
	};
}

Game.prototype.init_resources = function() {
	let table = get("resources");
	for (const resource in this.resources) {
		let row = table.insertRow();
		// resource
		let resourceType = row.insertCell();
		resourceType.innerHTML = resource;
		// amount
		let amount = row.insertCell();
		amount.innerHTML = this.resources[resource];
	}
}

function Menu() {
	this.tabs = [
		"Printer",
		"Research",
		"Settings"
	];
}

Menu.prototype.init_menu = function() {
	let menuSelect = get("menuSelect");
	for (let i=0; i<this.tabs.length; i++) {
		let header = this.tabs[i];

		let div = document.createElement("div");
		div.innerHTML = header;
		div.className = "menuItem";
		menuSelect.appendChild(div);
	}
}

Menu.prototype.init_research_menu = function() {
	let menuContent = get("menuContent");

	let wrapper = document.createElement("div");
	wrapper.id = "researchMenu";

	wrapper.innerHTML = "placeholder";

	menuContent.appendChild(wrapper);
}

Menu.prototype.init_settings_menu = function() {
	let menuContent = get("menuContent");

	let wrapper = document.createElement("div");
	wrapper.id = "settingsMenu";

	wrapper.innerHTML = "placeholder";

	menuContent.appendChild(wrapper);
}

var game;

function init() {
	game = new Game();
	game.init_resources();

	menu = new Menu();
	menu.init_menu();
	menu.init_research_menu();
	menu.init_settings_menu();
}

window.addEventListener ? window.addEventListener("load",init,false) : window.attachEvent && window.attachEvent("onload", init);