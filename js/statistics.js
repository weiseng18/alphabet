function Stats() {
	// the stat keys
	this.keys = ["used_ink", "used_paper", "printed_words", "longest_word", "highest_revenue"];

	// contains the stats
	// dictionary: stat => data
	this.data = {
		// resources used
		used_ink: 0,
		used_paper: 0,

		// words
		printed_words: 0,
		longest_word: {
			data: "",
			value: 0
		},
		highest_revenue: {
			data: "",
			value: 0
		}
	};

	// description for stats
	// dictionary: stat => description
	// this should have the same keys as this.data
	this.description = {
		used_ink: "Total ink used",
		used_paper: "Total paper used",
		printed_words: "Total number of printed words",
		longest_word: "Longest word printed",
		highest_revenue: "Highest revenue from a printed word"
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
			// in this case, data should only have 1 item
			this.increment(type, data[0]);
			break;
		case "longest_word":
		case "highest_revenue":
			// in this case, data should have 2 items
			// data[0]: the data
			// data[1]: the attribute of the data, to be used to compare for maximum
			this.max(type, data[0], data[1])
			break;
	}
}

Stats.prototype.increment = function(type, amount) {
	this.data[type] += amount;
}

Stats.prototype.max = function(type, data, value) {
	if (value > this.data[type].value) {
		this.data[type].data = data;
		this.data[type].value = value;
	}
}