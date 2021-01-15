function Menu() {
	this.tabs = [
		"Printer",
		"Letters",
		"Words",
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
	let headers = ["Name", "Tooltip", "Level", "Effect", "Cost to level up", "Level up"];
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

Menu.prototype.init_letter_menu = function() {
	let menuContent = get("menuContent");

	let wrapper = document.createElement("div");
	wrapper.id = "lettersMenu";

	let header = document.createElement("h3");
	header.innerHTML = "Discovered Letters";
	wrapper.appendChild(header);

	let content = document.createElement("div");
	content.id = "discoveredLetters";
	wrapper.appendChild(content);

	menuContent.appendChild(wrapper);

	if (wrapper.id != this.activeMenu)
		wrapper.style.display = "none";
	else
		get(wrapper.id + "_button").style.backgroundColor = this.color.selected;
}

Menu.prototype.init_word_menu = function() {
	let menuContent = get("menuContent");

	let wrapper = document.createElement("div");
	wrapper.id = "wordsMenu";

	let header = document.createElement("h3");
	header.innerHTML = "Discovered Words";
	wrapper.appendChild(header);

	let content = document.createElement("div");
	contentid = "discoveredWords";
	wrapper.appendChild(content);

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