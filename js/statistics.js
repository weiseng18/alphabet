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
}