function Game() {
	// placeholder game data
	this.resources = {
		paper: 0,
		ink: 0,
		money: 0
	};
	this.printerUpgradeLevels = {
		speed: 1,
		inkEfficiency: 1,
		paperTraySize: 1,
		inkCartridgeSize: 1,
		fontSize: 1
	}
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
	this.printerUpgrades = [
		{name:"Speed", ref:"speed", tooltip:"Increases printing speed"},
		{name:"Ink efficiency", ref:"inkEfficiency", tooltip:"Use less ink for the same printout"},
		{name:"Paper tray size", ref:"paperTraySize", tooltip:"Increases amount of paper the tray can hold"},
		{name:"Ink cartridge size", ref:"inkCartridgeSize", tooltip:"Makes more space in the printer, to allow a larger ink cartridge to fit in"},
		{name:"Font size", ref:"fontSize", tooltip:"Better technology allows the font size to be decreased, to print more characters per page"}
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

Menu.prototype.init_printer_menu = function() {
	let menuContent = get("menuContent");

	let wrapper = document.createElement("div");
	wrapper.id = "printerMenu";

	let table = document.createElement("table");
	table.id = "printerUpgrades";

	// header row
	let THead = table.createTHead();
	let header = THead.insertRow();
	let headers = ["Name", "Tooltip", "Level", "Effect"];
	for (let i=0; i<headers.length; i++) {
		let cell = header.insertCell();
		cell.innerHTML = headers[i];
	}

	// content rows
	let TBody = table.createTBody();
	for (let i=0; i<this.printerUpgrades.length; i++) {
		let upgrade = this.printerUpgrades[i];

		let row = TBody.insertRow();
		// name
		let cell_name = row.insertCell();
		cell_name.innerHTML = upgrade["name"];
		// tooltip
		let cell_tooltip = row.insertCell();
		cell_tooltip.innerHTML = upgrade["tooltip"];
		// level
		let cell_level = row.insertCell();
		let ref = upgrade["ref"];
		cell_level.innerHTML = game.printerUpgradeLevels[ref];
	}

	wrapper.appendChild(table);
	menuContent.appendChild(wrapper);
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
	menu.init_printer_menu();
	menu.init_research_menu();
	menu.init_settings_menu();
}

window.addEventListener ? window.addEventListener("load",init,false) : window.attachEvent && window.attachEvent("onload", init);