function Stats() {
	// stat categories
	this.categories = ["Resources used", "Printing", "Discovery", "Minigame"];

	// map key to category #
	// assume that this is in ascending order
	this.key_to_category = [0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3];

	// the stat keys
	this.keys = ["used_ink", "used_paper", "printed_words", "longest_word", "highest_revenue", "highest_base_revenue", "num_discovered_letters", "num_discovered_words", "num_possible_words_left", "max_words", "num_typed_words"];

	// contains the stats
	// dictionary: stat => data
	this.data = {
		// resources used
		used_ink: 0,
		used_paper: 0,

		// printing
		printed_words: 0,
		longest_word: {
			data: "",
			value: 0
		},
		highest_revenue: {
			data: "",
			value: 0
		},
		highest_base_revenue: {
			data: "",
			value: 0
		},

		// discovery
		num_discovered_letters: 0,
		num_discovered_words: 0,
		// # of possible words left, based on current discovered letters
		num_possible_words_left: 0,
		// # of words
		max_words: 0,

		// minigame
		num_typed_words: 0
	};

	// description for stats
	// dictionary: stat => description
	// this should have the same keys as this.data
	this.description = {
		used_ink: "Total ink used (ml)",
		used_paper: "Total paper used",
		printed_words: "Total words printed",
		longest_word: "Longest word printed",
		highest_revenue: "Highest revenue from one word",
		highest_base_revenue: "Highest revenue from one word (excluding bonus from unique print streak)",
		num_discovered_letters: "Number of discovered letters",
		num_discovered_words: "Number of discovered words",
		num_possible_words_left: "Number of undiscovered words that can be discovered, based on current discovered letters",
		max_words: "Number of words in this game",
		num_typed_words: "Number of correctly typed words"
	}
}

/*
	statistics update
*/

Stats.prototype.update = function(type, data) {
	/*
		Description:
		this method is called when there is a chance that ANY statistic needs to be updated
		 - data: array of parameters
	*/
	switch (type) {
		case "used_ink":
		case "used_paper":
		case "printed_words":
		case "num_discovered_letters":
		case "num_discovered_words":
		case "max_words":
		case "num_typed_words":
			// in this case, data should only have 1 item
			this.increment(type, data[0]);
			break;
		case "num_possible_words_left":
			// in this case, the statistic is replaced rather than added to
			this.set(type, data[0]);
			break;
		case "longest_word":
		case "highest_revenue":
		case "highest_base_revenue":
			// in this case, data should have 2 items
			// data[0]: the data
			// data[1]: the attribute of the data, to be used to compare for maximum
			this.max(type, data[0], data[1])
			break;
	}
	
	// update HTML whether necessary or not
	menu.updateHTML_statistics_menu();
}

Stats.prototype.set = function(type, amount) {
	this.data[type] = amount;
}

Stats.prototype.increment = function(type, amount) {
	this.data[type] = round(this.data[type] + amount);
}

Stats.prototype.max = function(type, data, value) {
	if (value > this.data[type].value) {
		this.data[type].data = data;
		this.data[type].value = value;
	}
}

/*
	get info
*/

Stats.prototype.getDescription = function(type) {
	/*
		Description:
		returns the associated description with a statistic
	*/
	return this.description[type];
}

Stats.prototype.getData = function(type) {
	/*
		Description:
		returns the data for the statistic
	*/

	switch (type) {
		case "used_ink":
		case "used_paper":
		case "printed_words":
		case "num_discovered_letters":
		case "num_discovered_words":
		case "num_possible_words_left":
		case "max_words":
		case "num_typed_words":
			return this.data[type];

		case "longest_word":
		case "highest_revenue":
		case "highest_base_revenue":
			let data = this.data[type].data;
			let value = this.data[type].value;
			let output = data + " (" + value + ")";
			return data == "" ? "NIL" : output;
	}
}