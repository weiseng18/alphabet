function Menu() {
	this.tabs = [
		"Printer",
		"Discover",
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
			console.log(word);
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
	let discoveredLetters_div = get("discoveredLetters");
	let div = document.createElement("div");
	div.innerHTML = letter;
	discoveredLetters_div.appendChild(div);
}

Menu.prototype.updateHTML_word_menu = function(word) {
	/*
		Description:
		This appends "word" to the discovered words list displayed in #discoveredWords
	*/
	let discoveredWords_div = get("discoveredWords");
	let div = document.createElement("div");
	div.innerHTML = word;
	discoveredWords_div.appendChild(div);
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