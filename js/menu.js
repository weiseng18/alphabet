function Menu() {
	this.tabs = [
		"Printer",
		"Discover",
		"Statistics",
		"Achievements",
		"Settings",
		"Tutorial"
	];
	this.activeMenu = "tutorialMenu";
	this.color = {
		selected: "#555",
		notSelected: "#fff",
		hover: "#a3a3a3"
	};

	// keeps track if tutorial is maximized or not
	this.tutorialMaximized = false;
	// maximize prepend ID
	this.maximizedID = "maximized";
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
			if (this.activeMenu == "discoverMenu")
				get(this.activeMenu).style.display = "flex";
			else
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
	let headers = ["Name", "Tooltip", "Level", "Current effect", "Cost to level up", "Level up"];
	for (let i=0; i<headers.length; i++) {
		let cell = header.insertCell();
		cell.innerHTML = headers[i];
		if (headers[i] == "Tooltip")
			cell.style.width = "30%";
		else if (headers[i] == "Level")
			cell.style.width = "5%";
		else if (headers[i] == "Current effect")
			cell.style.width = "15%";
	}

	// content rows
	let TBody = table.createTBody();
	for (const upgradeRef in game.upgrades) {
		let upgrade = game.upgrades[ upgradeRef ];

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
		// effect
		let cell_effect = row.insertCell();
		let amount = upgrade.effectFormula();
		cell_effect.innerHTML = upgrade.effect( amount );
		// cost
		let cell_cost = row.insertCell();
		let cost = upgrade.costFormula();
		cell_cost.innerHTML = "$" + cost;
		// level up button
		let cell_button = row.insertCell();
		let button = document.createElement("button");
		button.innerHTML = "Level up - " + upgrade["name"];
		button.addEventListener("click", ()=>{ game.levelUp_upgrade(upgradeRef); } );
		cell_button.appendChild(button);
	}

	wrapper.appendChild(table);
	menuContent.appendChild(wrapper);

	if (wrapper.id != this.activeMenu)
		wrapper.style.display = "none";
	else
		get(wrapper.id + "_button").style.backgroundColor = this.color.selected;
}

Menu.prototype.update_printer_menu = function() {
	/*
		Description:
		This updates levels, effects, and costs in the printer upgrades menu.
		To be called after an upgrade is levelled up.
	*/
	let allRows = get("printerUpgrades").children[1].children;
	let index = 0;
	for (const upgradeRef in game.upgrades) {
		let row = allRows[index];
		let upgrade = game.upgrades[upgradeRef];

		row.children[2].innerHTML = upgrade["level"];
		let amount = upgrade.effectFormula();
		row.children[3].innerHTML = upgrade.effect( amount );
		row.children[4].innerHTML = "$" + upgrade.costFormula();
		index++;
	}
}

Menu.prototype.init_discover_menu = function() {
	let menuContent = get("menuContent");

	let wrapper = document.createElement("div");
	wrapper.id = "discoverMenu";

	// letter menu
	let lettersMenu = document.createElement("div");
	lettersMenu.className = "discover_half";
	lettersMenu.id = "lettersMenu";

		// discover area
		let discoverArea = document.createElement("div");
			let letter_button = document.createElement("button");
			letter_button.innerHTML = "Discover a random letter";
			letter_button.addEventListener("click", ()=>{ game.discover_letter(); });

			let cost = document.createElement("span");
			cost.id = "letter_cost";
			cost.style.paddingLeft = "10px";

			discoverArea.appendChild(letter_button);
			discoverArea.appendChild(cost);
		lettersMenu.appendChild(discoverArea);

		let letter_header = document.createElement("h3");
		letter_header.innerHTML = "Discovered Letters";
		lettersMenu.appendChild(letter_header);

		let letter_content = document.createElement("div");
		letter_content.id = "discoveredLetters";
		lettersMenu.appendChild(letter_content);

	wrapper.appendChild(lettersMenu);

	// word menu
	let wordsMenu = document.createElement("div");
	wordsMenu.className = "discover_half";
	wordsMenu.id = "wordsMenu";

		// manually discover word section

		let input = document.createElement("input");
		input.id = "wordInput";
		// ensure only alpha characters
		input.addEventListener("keypress", (e) => {
			if (e.which == 13) {
				let word = get("wordInput").value;
				game.discover_word(word);

				get("wordInput").value = "";
			}
			else {
				let value = String.fromCharCode(e.which);
				let pattern = new RegExp(/[a-z]/i);
				let res = pattern.test(value);

				// if non alphabet
				if (res == false) {
					if (e.preventDefault)
						e.preventDefault();
					else
						e.returnValue = false;
				}
			}
		});
		let word_button = document.createElement("button");
		word_button.innerHTML = "Discover this word";
		word_button.addEventListener("click", () => {
			let word = get("wordInput").value;
			get("wordInput").value = "";
			game.discover_word(word);
		});

		wordsMenu.appendChild(input);
		wordsMenu.appendChild(word_button);

		// discovered words section

		let word_header = document.createElement("h3");
		word_header.innerHTML = "Discovered Words";
		wordsMenu.appendChild(word_header);

		let word_content = document.createElement("div");
		word_content.id = "discoveredWords";
		wordsMenu.appendChild(word_content);

	wrapper.appendChild(wordsMenu);

	// add to HTML
	menuContent.appendChild(wrapper);

	// update cost of discovering a letter
	this.updateHTML_letter_cost();

	// check if this is the active menu
	if (wrapper.id != this.activeMenu)
		wrapper.style.display = "none";
	else
		get(wrapper.id + "_button").style.backgroundColor = this.color.selected;
}

Menu.prototype.updateHTML_letter_cost = function() {
	let cost = round(game.cost_discover_letter());
	get("letter_cost").innerHTML = "$" + cost;
}

Menu.prototype.updateHTML_letter_menu = function(letter) {
	/*
		Description:
		This appends "letter" to the discovered letters list displayed in #discoveredLetters
	*/

	// get array of letters
	let discoveredLetters = get("discoveredLetters").children;
	let array = [];
	for (let i=0; i<discoveredLetters.length; i++)
		array.push(discoveredLetters[i].innerHTML);

	// calculate insert index
	let index = insertSorted(array, letter);

	// create element
	let newDiv = document.createElement("div");
	newDiv.innerHTML = letter;

	// insert element
	let discoveredLetters_div = get("discoveredLetters");
	discoveredLetters_div.insertBefore(newDiv, discoveredLetters_div.children[index]);

}

Menu.prototype.updateHTML_word_menu = function(word) {
	/*
		Description:
		This appends "word" to the discovered words list displayed in #discoveredWords
	*/
	
	// get array of words
	let discoveredWords = get("discoveredWords").children;
	let array = [];
	for (let i=0; i<discoveredWords.length; i++)
		array.push(discoveredWords[i].innerHTML);

	// calculate insert index
	let index = insertSorted(array, word);

	// create element
	let newDiv = document.createElement("div");
	newDiv.innerHTML = word;

	// insert element
	let discoveredWords_div = get("discoveredWords");
	discoveredWords_div.insertBefore(newDiv, discoveredWords_div.children[index]);
}

Menu.prototype.init_statistics_menu = function() {
	let menuContent = get("menuContent");

	let wrapper = document.createElement("div");
	wrapper.id = "statisticsMenu";

	let statistics_wrapper = document.createElement("div");
	statistics_wrapper.id = "statistics";

	// start from -1, everytime see a new number (increase), write that category header
	let categoryIndex = -1;

	// content rows
	for (let i=0; i<statistics.keys.length; i++) {
		// check if need to write a new category header
		let categoryID = statistics.key_to_category[i];
		if (categoryID > categoryIndex) {
			// update categoryIndex
			categoryIndex = categoryID;
			// get header text
			let headerText = statistics.categories[categoryIndex];
			// header h-element
			let header = document.createElement("h2");
			header.innerHTML = headerText;
			statistics_wrapper.appendChild(header);
		}

		// stat div
		let div = document.createElement("div");
			let key = statistics.keys[i];

			// description
			let ele_description = document.createElement("span");
			ele_description.style.fontWeight = "bold";
			let description = statistics.getDescription(key) + ": ";
			ele_description.innerHTML = description;
			// value
			let ele_value = document.createElement("span");
			ele_value.id = key;

		div.appendChild(ele_description);
		div.appendChild(ele_value);

		statistics_wrapper.appendChild(div);
	}

	wrapper.appendChild(statistics_wrapper);

	menuContent.appendChild(wrapper);

	// force update to populate values
	this.updateHTML_statistics_menu();

	if (wrapper.id != this.activeMenu)
		wrapper.style.display = "none";
	else
		get(wrapper.id + "_button").style.backgroundColor = this.color.selected;
}

Menu.prototype.updateHTML_statistics_menu = function() {
	let div = get("statistics");
	for (let i=0; i<div.children.length; i++) {
		let row = div.children[i];
		if (row.tagName != "DIV") {
			// skip non-DIV elements, as they are headers and do not contain statistics
			continue;
		}
		let key = row.children[1].id;
		let statValue = statistics.getData(key);
		row.children[1].innerHTML = statValue;
	}
}

Menu.prototype.init_achievements_menu = function() {
	let menuContent = get("menuContent");

	let wrapper = document.createElement("div");
	wrapper.id = "achievementsMenu";

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

Menu.prototype.init_tutorial_menu = function() {
	let menuContent = get("menuContent");

	let wrapper = document.createElement("div");
	wrapper.id = "tutorialMenu";

		let header = document.createElement("div");
		header.id = "tutorialMenu_header";

			let maximizeButton = document.createElement("button");
			maximizeButton.innerHTML = "Maximize this window";
			maximizeButton.addEventListener("click", () => {
				menu.toggleTutorialSize("maximize");
			});
			header.appendChild(maximizeButton);

		wrapper.appendChild(header);

		let content = document.createElement("div");
		content.id = "tutorialMenu_content";
		wrapper.appendChild(content);

	menuContent.appendChild(wrapper);

	// loads tutorial.html content into #tutorialMenu
	loadTextFile(content.id, "./tutorial.html");

	if (wrapper.id != this.activeMenu)
		wrapper.style.display = "none";
	else
		get(wrapper.id + "_button").style.backgroundColor = this.color.selected;
}

Menu.prototype.init_maximizedTutorial = function() {
	let wrapper = document.createElement("div");
	wrapper.id = this.maximizedID + "_wrapper";

	// if click on the translucent gray area
	wrapper.addEventListener("click", (e) => {
		if (e.target == wrapper)
			menu.toggleTutorialSize("minimize");
	});

		let body = document.createElement("div");
		body.id = this.maximizedID + "_body";

			let header = document.createElement("div");

				let minimizeButton = document.createElement("button");
				minimizeButton.innerHTML = "Minimize this window";
				minimizeButton.addEventListener("click", () => {
					menu.toggleTutorialSize("minimize");
				});
				header.appendChild(minimizeButton);

			body.appendChild(header);

			let content = document.createElement("div");
			content.id = this.maximizedID + "_content";

			body.appendChild(content);

		wrapper.appendChild(body);

	document.body.appendChild(wrapper);

	// loads tutorial.html content into #tutorialMenu
	loadTextFile(content.id, "./tutorial.html");
}

Menu.prototype.toggleTutorialSize = function(which) {
	if (which == "maximize") {
		this.tutorialMaximized = true;
		get(this.maximizedID + "_wrapper").style.display = "block";
	}
	else if (which == "minimize") {
		this.tutorialMaximized = false;
		get(this.maximizedID + "_wrapper").style.display = "none";
	}
}