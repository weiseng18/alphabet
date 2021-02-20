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

/*
	init methods
*/

Achievements.prototype.init_append = function(key, shortDesc, thresholdFunction) {
	/*
		Description:
		creates new achievement, adds to this.keyToIndex, pushes into this.list
	*/

	// create new
	let achievement = new Achievement(key, shortDesc, thresholdFunction);
	// add to this.keyToIndex
	this.keyToIndex[key] = this.list.length;
	// push to this.list
	this.list.push(achievement);
}