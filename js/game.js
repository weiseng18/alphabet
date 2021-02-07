function Game() {
	this.resources = {
		paper: 0,
		ink: 0,
		money: 0
	};
	this.resources_max = {};
	this.upgrades = [];
	this.discovered_words = [];
	this.discovered_letters = [];

	// possible words that can be discovered
	this.possible_words = [];

	// possible letters that can be discovered
	this.possible_letters = [];
	/*
		this is to check if starting a new game. if this is true, then init_possible_letters sets possible_letters to ["a", "i"].
		after the first run of discover_letter, it then sets possible letters to [a-z], and removes the discovered letter in that first run.
	*/
	this.gameInit = true;

	// time of last print
	this.time_lastPrint = null;

	// time of last auto discover
	this.time_lastAutoDiscover = null;
	// whether to auto discover or not
	// null before auto discover is unlocked
	this.autoDiscover = null;

	// how often is Game.run executed
	this.tickSpeed = 1000 / 60;

	// revenues of each letter
	this.letterRevenue = [1,3,3,2,1,4,2,4,1,8,5,1,3,1,1,3,10,1,1,1,1,4,4,8,4,10];

	// recent printed words
	// resets after there is a duplicate
	this.uniqueWords = [];
}

/*
	Update HTML and Init HTML
*/

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

Game.prototype.updateHTML_resources_max = function() {
	/*
		Description:
		updates the resource capacity values in HTML table
	*/
	let numRows = get("resources").children[0].children.length;
	for (let i=0; i<numRows; i++) {
		let row = get("resources").children[0].children[i];
		let numCells = row.children.length;

		// constant, 4 means 4 cells i.e. there is a maximum
		if (numCells == 4) {
			let resourceType = row.children[0].innerHTML;
			let ref = resourceType == "paper" ? "paperTraySize" : "inkCartridgeSize";
			row.children[3].innerHTML = this.upgrades[ref].effectFormula();
		}
	}
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

Game.prototype.initHTML_autoWordButton = function() {
	/*
		Description:
		This function adds a button to toggle on/off auto word discovery.
	*/
	let button = document.createElement("button");
	button.innerHTML = "Turn off auto word discovery";
	button.addEventListener("click", () => {
		let status = game.autoDiscover;

		// whether the next click will be to turn off or on
		let which = status ? "on" : "off";
		// update button
		button.innerHTML = "Turn " + which + " auto word discovery";

		// update status
		game.autoDiscover = !game.autoDiscover;
	});

	let parent = get("wordsMenu");

	let h3 = Array.prototype.slice.call(parent.children)
				.filter(ele => ele.tagName == "H3")[0];
	parent.insertBefore(button, h3);
}

/*
	Refill
*/

Game.prototype.query_refill_data = function(material) {
	/*
		Description:
		this function returns a object with properties amount and cost
		    - amount: remaining capacity
		    - cost: cost to refill (paper) / replace (ink)
	*/
	let remainingCapacity = round(this.resources_max[material] - this.resources[material]);
	let cost;
	// set cost to 1e9/infinity to prevent purchase when there is no capacity left
	if (remainingCapacity <= 0) return {amount:-1, cost:1e9};

	if (material == "paper")
		cost = round(remainingCapacity / 5);
	else if (material == "ink")
		cost = round(this.resources_max["ink"] / 100);

	return {amount: remainingCapacity, cost: cost};

}

Game.prototype.refill_resource = function(resource) {
	/*
		Description:
		this function attempts to refill a resource
		only succeeds if there is sufficient money, and that resource's amount is not at max capacity
	*/
	let purchase = this.query_refill_data(resource);
	if (purchase.amount == -1) {
		// no need to refill
		let notification = new Notification("atMax", resource);
		return;
	}
	if (this.cannotAfford(purchase.cost, "money")) {
		let notification = new Notification("insufficient", "money");
		return;
	}

	this.consume_resource("money", purchase.cost);

	// set to max
	this.resources[resource] = this.resources_max[resource];

	this.updateHTML_resources();
}

/*
	Letter
*/

Game.prototype.discover_letter = function() {
	/*
		Description:
		Generates a random letter to be discovered, unless specify is defined - then that is used as the discovered letter.
		Also creates a notification which goes to #notifications div
	*/

	// check for letters still available
	let length = this.possible_letters.length;
	if (length == 0) {
		let notification = new Notification("noneLeft", "letters");
		return;
	}

	// check for sufficient funds
	let cost = this.cost_discover_letter();
	if (this.cannotAfford(cost, "money")) {
		let notification = new Notification("insufficient", "money");
		return;
	}

	this.consume_resource("money", cost);

	// execute randLetter() and get info
	let info = randLetter();
	let letter = info.letter;
	let index = info.index;

	// add letter into game.discovered_letters, and send notification
	game.discovered_letters.push(letter);
	let notification = new Notification("letter", letter);

	// remove letter from game.possible_letters
	game.possible_letters.splice(index, 1);

	// possible_letters start off as ["a", "i"], this will correct it
	if (this.gameInit) {
		this.gameInit = false;
		this.init_possible_letters();
		let notification = new Notification("custom", "Discover a word from the <strong>Discover</strong> tab");
	}
	
	this.init_possible_words();

	menu.updateHTML_letter_cost();
	menu.updateHTML_letter_menu(letter);
}

Game.prototype.cost_discover_letter = function() {
	let total = this.discovered_letters.length;
	let cost = 150 * (1.5) ** total;
	return cost;
}

Game.prototype.init_possible_letters = function() {
	/*
		Description:
		initializes Game.possible_letters
	*/

	// if start of game, only allow discover "a" or "i" so that single letter words can be discovered
	if (this.gameInit)
		this.possible_letters = ["a", "i"];

	else {
		// add [a-z]
		this.possible_letters = [];
		let a = "a".charCodeAt(0);
		for (let i=0; i<26; i++) {
			let letter = String.fromCharCode(a + i);
			this.possible_letters.push(letter);
		}
		// remove the sole discovered letter so far
		let index = this.discovered_letters[0].charCodeAt(0) - "a".charCodeAt(0);
		this.possible_letters.splice(index, 1);
	}
}

/*
	Word
*/

Game.prototype.discover_word = function(specify=null) {
	/*
		Description:
		Generates a random word to be discovered, unless specify is defined - then this function tries to use that as the discovered word
		The discovered word is now necessarily made up only of letters in this.discovered_letters
		Also creates a notification which goes to #notifications div

		Parameters:
		specify: a word
	*/

	// step 1: check if possible to discover a word
	let length = this.possible_words.length;
	// auto discover
	if (specify == null) {
		// if no word is specified, check if it is possible to generate a random word
		if (length == 0) {
			let notification = new Notification("noneLeft", "words", true);
			return false;
		}
	}
	// manual discover
	else {
		// if a word is specified, check if the specified word cannot be discovered
		if (!this.possible_words.includes(specify)) {

			// preparation
			// letter string to check if the word is solely made up of discovered letters
				// step 1: generate letters, a string of all the discovered letters
				let letters = "";
				for (let i=0; i<this.discovered_letters.length; i++)
					letters += this.discovered_letters[i];

				// step 2: create RegExp
				let exp = new RegExp("^[" + letters + "]+$");

			// actual check
			// case 1: word has been discovered
			// case 2: fontSize upgrade level not high enough
			// case 3: haven't unlocked all the letters but valid word
			// case 4: is not a word
			let notification;
			// has been discovered
			if (this.discovered_words.includes(specify))
				notification = new Notification("discovered", specify);

			// fontSize upgrade level not high enough
			else if (specify.length > this.upgrades["fontSize"].level)
				notification = new Notification("fontSize");

			// haven't unlocked all the letters but valid word
			else if (dictionary.includes(specify) && !exp.test(specify))
				notification = new Notification("insufficientLetters", specify);

			// is not a word
			else
				notification = new Notification("notWord", specify);

			return false;

		}
	}

	// step 2: either random, or the specified word
	let word = specify == null ? this.possible_words[ randInt(length) ] : specify;

	game.discovered_words.push(word);
	let notification = new Notification("word", word);

	// step 3: update possible words, specify word so that only need to remove it
	this.update_possible_words(word);

	menu.updateHTML_word_menu(word);

	return true;
}

Game.prototype.auto_word = function(currentTime) {
	/*
		Description:
		This function is called when discovering a word via auto. The difference is that there is an update to the Game.time_lastAutoDiscover
	*/
	let res = this.discover_word();
	if (res) {
		// set the time of the last successful auto discover
		this.time_lastAutoDiscover = currentTime;
	}
}

Game.prototype.init_possible_words = function() {
	/*
		Description:
		This function initializes Game.possible_words based on Game.discovered_letters. To be called in Game.discover_letter
	*/

	// step 1: generate letters, a string of all the discovered letters
	let letters = "";
	for (let i=0; i<this.discovered_letters.length; i++)
		letters += this.discovered_letters[i];

	// step 2: create RegExp
	let maxLength = this.upgrades["fontSize"].level;
	let exp = new RegExp("^[" + letters + "]{1," + maxLength + "}$");

	// step 3: filter
	this.possible_words = dictionary.filter(word => exp.test(word));
}

Game.prototype.update_possible_words = function(remove) {
	/*
		Description:
		This function updates Game.possible_words and dictionary. To be called in Game.discover_word

		Parameters:
		remove: a word that has just been discovered, to remove from possible_words and dictionary
	*/

	// remove from Game.possible_words
	let index = this.possible_words.indexOf(remove);
	this.possible_words.splice(index, 1);

	// remove from dictionary
	let index2 = dictionary.indexOf(remove);
	dictionary.splice(index2, 1);
}

Game.prototype.wordRevenue = function(word, isMinigame) {
	// word base revenue

	let sum = 0;
	for (let i=0; i<word.length; i++) {
		let char = word[i];
		let index = char.charCodeAt(0) - 'a'.charCodeAt(0);
		sum += this.letterRevenue[index];
	}

	// bonus revenue based on unique words
	// bonus = number of words in a row that do not have any duplicates
	// min bonus = 1

	let bonus = 0;
	// no bonus for minigame
	if (!isMinigame) {
		// if this word will break the streak
		if (this.uniqueWords.includes(word)) {
			// reset uniqueWords and set to only contain this word
			this.uniqueWords = [word];
			bonus = 1;
		}
		else {
			this.uniqueWords.push(word);
			bonus = this.uniqueWords.length;
		}
	}

	return sum + bonus;
}

/*
	Print
*/

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
		let notification;
		if (this.cannotAfford(inkCost, "ink")) {
			notification = new Notification("insufficient", "ink", true);
		}
		if (this.cannotAfford(paperCost, "paper")) {
			notification = new Notification("insufficient", "paper", true);
		}
		if (notification != undefined)
			return;

	// check if there is at least 1 discovered word
		if (this.discovered_words.length == 0)
			notification = new Notification("zeroWords", null, true);
		if (notification != undefined)
			return;

	// set the time of the last successful print
		this.time_lastPrint = currentTime;

	// get random word and calculate money gained

		let word = this.discovered_words[ randInt(this.discovered_words.length) ];
		// tentative formula
		let moneyEarned = this.wordRevenue(word, false);

	// step 2: actually trigger the print

		// word animation
		trigger_wordAnimation(word);

		// deduct resources and add money
		this.consume_resource("ink", inkCost);
		this.consume_resource("paper", paperCost);
		this.gain_resource("money", moneyEarned);

	// step 3: update information

		// update buttons
		this.updateHTML_printerRefillButtons();
}

/*
	Run (game loop)
*/

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

		let time_betweenAuto = game.upgrades["autoWord"].effectFormula() * 1000;
		// attempt to discover a word automatically
		// upgrade must be level > 0 and user must have allowed auto discover
		if (this.upgrades["autoWord"].level > 0 && this.autoDiscover) {
			let timeSinceLastAutoDiscover = currentTime - this.time_lastAutoDiscover;
			if (timeSinceLastAutoDiscover > time_betweenAuto)
				this.auto_word(currentTime);
		}

		// minigame
		minigame.addWords();

		let time_betweenUpdates = minigame.timeBetween * 1000;
		let timeSinceLastWPM = currentTime - minigame.lastUpdate;
		// attempt to update WPM
		if (timeSinceLastWPM > time_betweenUpdates)
			minigame.updateHTML_WPM(currentTime);

	}, this.tickSpeed);
}

/*
	Upgrade
*/

Game.prototype.update_resources_max = function() {
	/*
		Description:
		updates the capacity of resources. called after upgrading any capacity
	*/
	this.resources_max.paper = this.upgrades["paperTraySize"].effectFormula();
	this.resources_max.ink = this.upgrades["inkCartridgeSize"].effectFormula();
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
		},
		{
			name:"Auto discover words",
			ref:"autoWord",
			tooltip:"Magic allows the printer to form words on its own",
			baseAmount: 15,
			baseMultiplier: 0.9,
			level: 0,
			effect: function(amount) {
				if (this.level > 0)
					return "1 word / " + amount + " seconds";
				else
					return "No effect";
			}
		}
	]

	for (let i=0; i<upgrades.length; i++) {
		let data = upgrades[i];
		let upgrade = new Upgrade(data.name, data.ref, data.tooltip, data.baseAmount, data.baseMultiplier, data.level, data.effect);
		this.upgrades[data.ref] = upgrade;
	}
}

Game.prototype.levelUp_upgrade = function(ref) {
	/*
		Description:
		Levels up upgrade with reference "ref".
	*/

	// step 1: calculate cost, if insufficient money then terminate
	let cost = this.upgrades[ref].costFormula();
	if (this.cannotAfford(cost, "money")) {
		let notification = new Notification("insufficient", "money");
		return;
	}

	// step 2: deduct cost
	this.consume_resource("money", cost);

	this.upgrades[ref].level++;

	// step 3: certain upgrades unlock new features / modify values that are not necessarily re-queried
	// i.e. hardcoded section
	if (ref == "paperTraySize" || ref == "inkCartridgeSize") {
		/*
			Description:
			- update Game.resources_max
			- update max resources values in UI
			- update printer refill buttons' max resources values
		*/
		this.update_resources_max();
		this.updateHTML_resources_max();
		this.updateHTML_printerRefillButtons();
	}
	else if (ref == "fontSize") {
		/*
			Description:
			- update possible words because there is a decrease in font size, allowing longer words to be printed
		*/
		this.init_possible_words();
	}
	else if (ref == "autoWord")
		if (this.autoDiscover == null) {
			// set it to true first
			this.autoDiscover = true;
			// insert toggle into #wordsMenu
			this.initHTML_autoWordButton();
		}

	// step 4: update UI
		// update printer menu
		menu.update_printer_menu();
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
	let effect;
	if (this.ref == "fontSize")
		effect = this.level;
	else if (this.ref == "paperTraySize")
		effect = Math.round(this.baseAmount * (this.baseMultiplier)**(this.level-1));
	else
		effect = this.baseAmount * (this.baseMultiplier)**(this.level-1);

	return round(effect);
}

Upgrade.prototype.costFormula = function() {
	/*
		Description:
		Returns the cost of levelling up the upgrade
	*/
	let cost;
	if (this.ref == "fontSize")
		cost = 100 * (1.5) ** this.level;
	else if (this.ref == "speed" || this.ref == "inkEfficiency")
		cost = 80 * (1.2) ** this.level;
	else if (this.ref == "autoWord")
		cost = 1000 + 200 * (2) * this.level;
	else
		cost = 80 * (1.1) ** this.level;

	return round(cost);
}

/*
	Helper functions
*/

Game.prototype.gain_resource = function(which, amount) {
	/*
		Description:
		this function increases [amount] of [which] resource.
		calling this function means that there are sufficient funds
	*/

	// deduct amount then round
	this.resources[which] = round(this.resources[which] + amount);

	// update
	this.updateHTML_resources();
}

Game.prototype.consume_resource = function(which, amount) {
	/*
		Description:
		this function deducts [amount] of [which] resource.
		calling this function means that there are sufficient funds
	*/

	// deduct amount then round
	this.resources[which] = round(this.resources[which] - amount);

	// update
	this.updateHTML_resources();
}

Game.prototype.cannotAfford = function(cost, type) {
	/*
		Description:
		Check if there is insufficient resource (type) to perform an action that costs (cost)
	*/
	return (cost > this.resources[type]);
}