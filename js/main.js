function Game() {
	// placeholder game data
	this.resources = {
		paper: 0,
		ink: 0,
		money: 0
	};
	this.resources_max = {}
	this.upgrades = [];
	this.printerUpgradeLevels = {
		speed: 1,
		inkEfficiency: 1,
		paperTraySize: 1,
		inkCartridgeSize: 1,
		fontSize: 1
	}
}

Game.prototype.update_resources_max = function() {
	this.resources_max.paper = this.upgrades["paperTraySize"].formula();
	this.resources_max.ink = this.upgrades["inkCartridgeSize"].formula();
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

		if (resource != "money") {
			// slash
			let slash = row.insertCell();
			slash.innerHTML = "/";
			// total amount
			let totalAmount = row.insertCell();
			totalAmount.innerHTML = this.resources_max[resource];
		}
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
			effect: (amount) => {return "1 page / " + amount + " seconds";}
		},
		{
			name:"Ink efficiency",
			ref:"inkEfficiency",
			tooltip:"Use less ink for the same printout",
			baseAmount: 10,
			baseMultiplier: 0.9,
			level: 1,
			effect: (amount) => {return "1 page / " + amount + " ml of ink";}
		},
		{
			name:"Paper tray size",
			ref:"paperTraySize",
			tooltip:"Increases amount of paper the tray can hold",
			baseAmount: 50,
			baseMultiplier: 1.1,
			level: 1,
			effect: (amount) => {return amount + " pages";}
		},
		{
			name:"Ink cartridge size",
			ref:"inkCartridgeSize",
			tooltip:"Makes more space in the printer, to allow a larger ink cartridge to fit in",
			baseAmount: 1000,
			baseMultiplier: 1.1,
			level: 1,
			effect: (amount) => {return amount + " ml of ink";}
		},
		{
			name:"Font size",
			ref:"fontSize",
			tooltip:"Better technology allows the font size to be decreased, to print more characters per page",
			level: 1,
			effect: (amount) => {return amount + " characters per page";}
		}
	]

	for (let i=0; i<upgrades.length; i++) {
		let data = upgrades[i];
		let upgrade = new Upgrade(data.name, data.ref, data.tooltip, data.baseAmount, data.baseMultiplier, data.level, data.effect);
		this.upgrades[data.ref] = upgrade;
	}
}

function Upgrade(name, ref, tooltip, baseAmount, baseMultiplier, level, effect) {
	// constants
	this.name = name;
	this.ref = ref;
	this.tooltip = tooltip;
	this.baseAmount = baseAmount;
	this.baseMultiplier = baseMultiplier;

	// values
	this.level = level;

	// function
	this.effect = effect;
}

Upgrade.prototype.formula = function() {
	if (this.ref == "fontSize")
		return this.level;
	else
		return this.baseAmount * (this.baseMultiplier)**(this.level-1);
}

function refill_amount_cost(material) {
	/*
		Description:
		this function returns a object with properties amount and cost
		    - amount: remaining capacity
		    - cost: cost to refill (paper) / replace (ink)
	*/
	let remainingCapacity = game.resources_max[material] - game.resources[material];
	let cost;
	// set cost to 1e9/infinity to prevent purchase when there is no capacity left
	if (remainingCapacity <= 0) return {amount:0, cost:1e9};

	if (material == "paper")
		cost = remainingCapacity / 5;
	else if (material == "ink")
		cost = game.resources_max["ink"] / 100;

	return {amount: remainingCapacity, cost: cost};

}

function add_printerRefillButtons() {
	/*
		Description:
		this function adds the paper tray refill and ink cartridge refill buttons
	*/
	let paperRefill = document.createElement("div");
	paperRefill.className = "refillButton";
	paperRefill.id = "refillButton_paper";
	paperRefill.innerHTML = "paper refill placeholder";
	get("printerRight").appendChild(paperRefill);

	let inkRefill = document.createElement("div");
	inkRefill.className = "refillButton";
	inkRefill.id = "refillButton_ink";
	inkRefill.innerHTML = "ink refill placeholder";
	get("printerRight").appendChild(inkRefill);
}

function update_printerRefillButtons() {
	/*
		Description:
		this function updates the innerHTML of the paper tray refill and ink cartridge refill buttons
		    - amount to refill
		    - cost to refill
	*/

	let paper = refill_amount_cost("paper");
	let paper_text = "Load " + paper.amount + " more paper at $" + paper.cost;
	get("refillButton_paper").innerHTML = paper_text;

	let ink = refill_amount_cost("ink");
	let ink_text = "Replace ink cartridge at $" + ink.cost;
	get("refillButton_ink").innerHTML = ink_text;

}

var game;

function init() {
	game = new Game();
	game.init_upgrades();
	game.update_resources_max();

	game.init_resources();

	menu = new Menu();
	menu.init_menu();
	menu.init_printer_menu();
	menu.init_research_menu();
	menu.init_settings_menu();

	add_printerRefillButtons();
	update_printerRefillButtons();
}

window.addEventListener ? window.addEventListener("load",init,false) : window.attachEvent && window.attachEvent("onload", init);