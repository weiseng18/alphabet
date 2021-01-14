function Game() {
	// placeholder game data
	this.resources = {
		paper: 0,
		ink: 0,
		money: 0
	};
	this.resources_max = {};
	this.upgrades = [];
	this.printerUpgradeLevels = {
		speed: 1,
		inkEfficiency: 1,
		paperTraySize: 1,
		inkCartridgeSize: 1,
		fontSize: 1
	}
	this.discovered_words = [];
	this.discovered_letters = [];

	// time since last print
	this.time_lastPrint = null;

	// Game.run
	this.tickSpeed = 1000 / 60;
}

Game.prototype.updateHTML_resources = function() {
	/*
		Description:
		updates the resource values in HTML table
	*/
	let numRows = get("resources").children[0].children.length;
	for (let i=0; i<numRows; i++) {
		let row = get("resources").children[0].children[i];
		let resourceType = row.children[0].innerHTML;
		row.children[1].innerHTML = this.resources[resourceType];
	}
}

Game.prototype.update_resources_max = function() {
	this.resources_max.paper = this.upgrades["paperTraySize"].effectFormula();
	this.resources_max.ink = this.upgrades["inkCartridgeSize"].effectFormula();
}

Game.prototype.updateHTML_printerRefillButtons = function() {
	/*
		Description:
		this function updates the innerHTML of the paper tray refill and ink cartridge refill buttons
		    - amount to refill
		    - cost to refill
	*/

	let paper = this.query_refill_data("paper");
	let paper_text = "Load " + paper.amount + " more paper at $" + paper.cost;
	get("refillButton_paper").innerHTML = paper_text;

	let ink = this.query_refill_data("ink");
	let ink_text = "Replace ink cartridge at $" + ink.cost;
	get("refillButton_ink").innerHTML = ink_text;

}

Game.prototype.initHTML_resources = function() {
	/*
		Description:
		this function fills the HTML table #resources with resources data
	*/
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

Game.prototype.initHTML_printerRefillButtons = function() {
	/*
		Description:
		this function adds the paper tray refill and ink cartridge refill buttons
	*/
	let paperRefill = document.createElement("div");
	paperRefill.className = "refillButton";
	paperRefill.id = "refillButton_paper";
	paperRefill.innerHTML = "paper refill placeholder";
	paperRefill.addEventListener("click", ()=>{this.refill_resource("paper")});
	get("printerRight").appendChild(paperRefill);

	let inkRefill = document.createElement("div");
	inkRefill.className = "refillButton";
	inkRefill.id = "refillButton_ink";
	inkRefill.innerHTML = "ink refill placeholder";
	inkRefill.addEventListener("click", ()=>{this.refill_resource("ink")});
	get("printerRight").appendChild(inkRefill);
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

Game.prototype.query_refill_data = function(material) {
	/*
		Description:
		this function returns a object with properties amount and cost
		    - amount: remaining capacity
		    - cost: cost to refill (paper) / replace (ink)
	*/
	let remainingCapacity = this.resources_max[material] - this.resources[material];
	let cost;
	// set cost to 1e9/infinity to prevent purchase when there is no capacity left
	if (remainingCapacity <= 0) return {amount:0, cost:1e9};

	if (material == "paper")
		cost = remainingCapacity / 5;
	else if (material == "ink")
		cost = this.resources_max["ink"] / 100;

	return {amount: remainingCapacity, cost: cost};

}

Game.prototype.refill_resource = function(resource) {
	/*
		Description:
		this function attempts to refill a resource
		only succeeds if there is sufficient money, and that resource's amount is not at max capacity
	*/
	let purchase = this.query_refill_data(resource);
	if (purchase.cost > this.resources["money"]) return;

	// deduct cost
	this.resources["money"] -= purchase.cost;
	// set to max
	this.resources[resource] = this.resources_max[resource];

	this.updateHTML_resources();
}

Game.prototype.discover_letter = function(specify=null) {
	/*
		Description:
		Generates a random letter to be discovered, unless specify is defined - then that is used as the discovered letter.
		Also creates a notification which goes to #notifications div

		Parameters:
		specify: a single character [a-z]. likely only to be "a" or "i"
	*/

	// either random, or the specified letter (probably "a" or "i")
	let letter = specify == null ? randLetter() : specify;

	game.discovered_letters.push(letter);
	let notification = new Notification("letter", letter);
}

Game.prototype.discover_word = function(specify=null) {
	/*
		Description:
		Generates a random word to be discovered, unless specify is defined - then that is used as the discovered word.
		Also creates a notification which goes to #notifications div

		Parameters:
		specify: a single character [a-z]. likely only to be "a" or "i"
	*/

	// either random, or the specified letter (probably "a" or "i")
	let word = specify == null ? randWord() : specify;

	game.discovered_words.push(word);
	let notification = new Notification("word", word);
}

Game.prototype.print = function(currentTime) {
	/*
		Description:
		prints a random word from this.discovered_words
		- triggers word animation
		- increases money, decreases paper and ink
		currently the "delay" for printing is put inside this function. might be better to incorporate in the tick function?

		Parameters:
		currentTime - time measured in number of milliseconds since January 1 1970.
	*/
	// step 1: preprocessing

	// calculate resources used

		let inkCost = this.upgrades["inkEfficiency"].effectFormula();
		let paperCost = 1;

	// check if there is enough resources
		if (inkCost > this.resources["ink"] || paperCost > this.resources["paper"]) return;

	// set the time of the last successful print
		this.time_lastPrint = currentTime;

	// get random word and calculate money gained

		let word = this.discovered_words[ randInt(this.discovered_words.length) ];
		// tentative formula
		let moneyEarned = word.length;

	// step 2: actually trigger the print

		// word animation
		trigger_wordAnimation(word);

		// deduct resources and add money
		this.resources["ink"] -= inkCost;
		this.resources["paper"] -= paperCost;
		this.resources["money"] += moneyEarned;

	// step 3: update information

		// update buttons
		this.updateHTML_printerRefillButtons();

		// update new values for resources
		this.updateHTML_resources();
}

Game.prototype.run = function() {
	setInterval( () => {

		let currentTime = new Date().getTime();
		let time_betweenPrints = game.upgrades["speed"].effectFormula() * 1000;


		// attempt a print
		// subtracting null is equal to subtracting 0
		let timeSinceLastPrint = currentTime - this.time_lastPrint;
		if (this.time_lastPrint == null)
			this.print(currentTime);
		else if (timeSinceLastPrint > time_betweenPrints)
			this.print(currentTime);

	}, this.tickSpeed);
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

Upgrade.prototype.effectFormula = function() {
	/*
		Description:
		Returns the effect of the upgrade
	*/
	if (this.ref == "fontSize")
		return this.level;
	else
		return this.baseAmount * (this.baseMultiplier)**(this.level-1);
}