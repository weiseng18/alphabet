function Achievements() {
	// storing achievements
	this.list = [];
	// map of key to index
	this.keyToIndex = {};
}

function Achievement(key, shortDesc, thresholdFunction) {
	// key
	this.key = key;
	// short description to be used in HTML
	this.shortDesc = shortDesc;
	// threshold function to determine if the achievement target is achieved
	this.thresholdFunction = thresholdFunction;
	// boolean for obtained or not
	this.obtained = false;
}