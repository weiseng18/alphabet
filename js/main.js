function Game() {
	// placeholder game data
	this.resources = {
		paper: 0,
		ink: 0,
		money: 0
	};
	this.upgrades = [];
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

Game.prototype.init_upgrades = function() {
	let upgrades = [
		{
			name:"Speed",
			ref:"speed",
			tooltip:"Increases printing speed",
			baseAmount: 5,
			baseMultiplier: 0.9,
			level: 1,
			formula: () => {return this.baseAmount*(this.baseMultiplier)^(this.level-1);}
		},
		{
			name:"Ink efficiency",
			ref:"inkEfficiency",
			tooltip:"Use less ink for the same printout",
			baseAmount: 10,
			baseMultiplier: 0.9,
			level: 1,
			formula: () => {return this.baseAmount*(this.baseMultiplier)^(this.level-1);}
		},
		{
			name:"Paper tray size",
			ref:"paperTraySize",
			tooltip:"Increases amount of paper the tray can hold",
			baseAmount: 50,
			baseMultiplier: 1.1,
			level: 1,
			formula: () => {return this.baseAmount*(this.baseMultiplier)^(this.level-1);}
		},
		{
			name:"Ink cartridge size",
			ref:"inkCartridgeSize",
			tooltip:"Makes more space in the printer, to allow a larger ink cartridge to fit in",
			baseAmount: 1000,
			baseMultiplier: 1.1,
			level: 1,
			formula: () => {return this.baseAmount*(this.baseMultiplier)^(this.level-1);}
		},
		{
			name:"Font size",
			ref:"fontSize",
			tooltip:"Better technology allows the font size to be decreased, to print more characters per page",
			level: 1,
			formula: () => {return this.level;}
		}
	]

	for (let i=0; i<upgrades.length; i++) {
		let data = upgrades[i];
		let upgrade = new Upgrade(data.name, data.ref, data.tooltip, data.baseAmount, data.baseMultiplier, data.level, data.formula);
		this.upgrades.push(upgrade);
	}
}

function Upgrade(name, ref, tooltip, baseAmount, baseMultiplier, level, formula) {
	// constants
	this.name = name;
	this.ref = ref;
	this.tooltip = tooltip;
	this.baseAmount = baseAmount;
	this.baseMultiplier = baseMultiplier;

	// values
	this.level = level;

	// function
	this.formula = formula;
}

function Menu() {
	this.tabs = [
		"Printer",
		"Research",
		"Settings"
	];
	this.activeMenu = "printerMenu";
	this.color = {
		selected: "#555",
		notSelected: "#fff",
		hover: "#a3a3a3"
	};
}

Menu.prototype.init_menu = function() {
	let menuSelect = get("menuSelect");
	for (let i=0; i<this.tabs.length; i++) {
		let header = this.tabs[i];

		let div = document.createElement("div");
		div.innerHTML = header;
		div.className = "menuItem";
		div.id = div.innerHTML.toLowerCase() + "Menu_button";

		div.addEventListener("click", () => {
			// hide previous menu
			get(this.activeMenu + "_button").style.backgroundColor = this.color.notSelected;
			get(this.activeMenu).style.display = "none";

			// show new menu
			let menuID = div.id.split("_")[0];
			this.activeMenu = menuID;

			get(this.activeMenu + "_button").style.backgroundColor = this.color.selected;
			get(this.activeMenu).style.display = "block";
		});
		div.addEventListener("mouseover", () => {
			div.style.backgroundColor = this.color.hover;
		});
		div.addEventListener("mouseout", () => {
			let menuID = div.id.split("_")[0];
			div.style.backgroundColor = menuID == this.activeMenu ? this.color.selected : this.color.notSelected;
		});

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
	for (let i=0; i<game.upgrades.length; i++) {
		let upgrade = game.upgrades[i];

		let row = TBody.insertRow();
		// name
		let cell_name = row.insertCell();
		cell_name.innerHTML = upgrade["name"];
		// tooltip
		let cell_tooltip = row.insertCell();
		cell_tooltip.innerHTML = upgrade["tooltip"];
		// level
		let cell_level = row.insertCell();
		cell_level.innerHTML = upgrade["level"];
	}

	wrapper.appendChild(table);
	menuContent.appendChild(wrapper);

	if (wrapper.id != this.activeMenu)
		wrapper.style.display = "none";
	else
		get(wrapper.id + "_button").style.backgroundColor = this.color.selected;
}

Menu.prototype.init_research_menu = function() {
	let menuContent = get("menuContent");

	let wrapper = document.createElement("div");
	wrapper.id = "researchMenu";

	wrapper.innerHTML = "placeholder";

	menuContent.appendChild(wrapper);

	if (wrapper.id != this.activeMenu)
		wrapper.style.display = "none";
	else
		get(wrapper.id + "_button").style.backgroundColor = this.color.selected;
}

Menu.prototype.init_settings_menu = function() {
	let menuContent = get("menuContent");

	let wrapper = document.createElement("div");
	wrapper.id = "settingsMenu";

	wrapper.innerHTML = "placeholder";

	menuContent.appendChild(wrapper);

	if (wrapper.id != this.activeMenu)
		wrapper.style.display = "none";
	else
		get(wrapper.id + "_button").style.backgroundColor = this.color.selected;
}

var game;

function init() {
	game = new Game();
	game.init_resources();
	game.init_upgrades();

	menu = new Menu();
	menu.init_menu();
	menu.init_printer_menu();
	menu.init_research_menu();
	menu.init_settings_menu();
}

window.addEventListener ? window.addEventListener("load",init,false) : window.attachEvent && window.attachEvent("onload", init);