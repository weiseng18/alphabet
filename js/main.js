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

function wordAnimation(singleDistance, singleOpacity) {
	/*
		Description:
		this function is a single pass for the animation on the word

		Parameters:
		singleDistance (in px)
		singleOpacity
	*/

	// update opacity
	let opacity = this.style.opacity;
	let newOpacity = opacity - singleOpacity;
	this.style.opacity = newOpacity;

	// update y
	let y = parseFloat(this.style.top);
	let newY = y - singleDistance;
	this.style.top = newY + "px";

}

function trigger_wordAnimation(word) {
	/*
		Description:
		this function will create a word element, and then set up the following animation for a specific word:
			- word spawns on #printerArt
			- word floats up and fades away and disappears
		wordAnimation() contains a single pass for the animation on the word
	*/

	// step 1: calculate center location to spawn the word
	let rect = get("printerArt").getBoundingClientRect();

	let middleLocation = {
		x: (rect.left + rect.right) / 2,
		y: (rect.top + rect.bottom) / 2
	};

	// step 2: create floater element

	// step 2.1: HTML element

		// step 2.1.1: basic HTML element details
		let floater = document.createElement("span");
		floater.innerHTML = word;

		// step 2.1.2: set basic style
		floater.style.position = "absolute";
		floater.style.opacity = 1;
		floater.style.zIndex = 100;

	// step 2.2: calculate location

		// step 2.2.1: inject into DOM to use .getBoundingClientRect()
		floater.style.visibility = "hidden";
		document.body.appendChild(floater);
		let dimensions = floater.getBoundingClientRect();
		document.body.removeChild(floater);
		floater.style.visibility = "visible";

		// step 2.2.2: calculate and set location
		let spawnLocation = {
			x: middleLocation.x - dimensions.width / 2,
			y: middleLocation.y - dimensions.height / 2
		};

		floater.style.top = spawnLocation.y + "px";
		floater.style.left = spawnLocation.x + "px";

	// step 3: animation

		// step 3.1: define constants

		// note: duration, updateRate (in milliseconds)
		let duration = 1000;
		let updateRate = 10;
		// note: distance (in px)
		let distance = 100;

		// divide duration by updateRate, to get the iterations required
		let iterations = duration / updateRate;

		// calculate change required in one pass
		let singleDistance = distance / iterations;
		let singleOpacity = 1.0 / iterations;

		// step 3.2: attach setInterval and setTimeout

		var interval = setInterval( wordAnimation.bind(floater, singleDistance, singleOpacity), updateRate);

		// delete element after all passes complete
		setTimeout( () => {
			floater.parentNode.removeChild(floater);
			clearInterval(interval);
		}, duration);

	// step 4: append to body
	document.body.appendChild(floater);
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
	paperRefill.addEventListener("click", ()=>{game.refill_resource("paper")});
	get("printerRight").appendChild(paperRefill);

	let inkRefill = document.createElement("div");
	inkRefill.className = "refillButton";
	inkRefill.id = "refillButton_ink";
	inkRefill.innerHTML = "ink refill placeholder";
	inkRefill.addEventListener("click", ()=>{game.refill_resource("ink")});
	get("printerRight").appendChild(inkRefill);
}

function update_printerRefillButtons() {
	/*
		Description:
		this function updates the innerHTML of the paper tray refill and ink cartridge refill buttons
		    - amount to refill
		    - cost to refill
	*/

	let paper = game.query_refill_data("paper");
	let paper_text = "Load " + paper.amount + " more paper at $" + paper.cost;
	get("refillButton_paper").innerHTML = paper_text;

	let ink = game.query_refill_data("ink");
	let ink_text = "Replace ink cartridge at $" + ink.cost;
	get("refillButton_ink").innerHTML = ink_text;

}

var game;

function init() {
	game = new Game();
	game.init_upgrades();
	game.update_resources_max();

	game.initHTML_resources();

	menu = new Menu();
	menu.init_menu();
	menu.init_printer_menu();
	menu.init_research_menu();
	menu.init_settings_menu();

	add_printerRefillButtons();
	update_printerRefillButtons();
}

window.addEventListener ? window.addEventListener("load",init,false) : window.attachEvent && window.attachEvent("onload", init);