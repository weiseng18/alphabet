function Achievements() {
	// storing achievements
	this.list = [];
	// map of key to index
	this.keyToIndex = {};
}

function Achievement(key, shortDesc, longDesc, thresholdFunction) {
	// key
	this.key = key;
	// short description to be used in HTML
	this.shortDesc = shortDesc;
	// long description to be used in HTML
	this.longDesc = longDesc;
	// threshold function to determine if the achievement target is achieved
	this.thresholdFunction = thresholdFunction;
	// boolean for obtained or not
	this.obtained = false;
}

/*
	init methods
*/

Achievements.prototype.init = function() {
	/*
		Description:
		init function to create and build Achievement() objects
	*/
	// manually defined
	let list = [
		{type:"WPM", threshold:60, shortDesc:"WPM &ge; 60", longDesc:"Obtain an average WPM of at least 60, for a duration of at least 1 minute.", getValue: () => minigame.calculate_WPM()},
		{type:"WPM", threshold:70, shortDesc:"WPM &ge; 70", longDesc:"Obtain an average WPM of at least 70, for a duration of at least 1 minute.", getValue: () => minigame.calculate_WPM()},
		{type:"WPM", threshold:80, shortDesc:"WPM &ge; 80", longDesc:"Obtain an average WPM of at least 80, for a duration of at least 1 minute.", getValue: () => minigame.calculate_WPM()}
	];

	for (let i=0; i<list.length; i++) {
		let achievement = list[i];
		
		// key is type + threshold and should be unique
		let key = achievement.type + achievement.threshold;

		// thresholdFunction is determined by
		// getValue(): the value to compare with
		// comp: how to compare
		// threshold: target
		let thresholdFunction;
		if (achievement.type == "WPM")
			thresholdFunction = () => {
				let wpm = minigame.calculate_WPM();
				let wpmRequirement = wpm >= achievement.threshold;

				let duration = minigame.timeDelta();
				let durationRequirement = duration >= 60;

				return wpmRequirement && durationRequirement;
			}

		this.init_append(key, achievement.shortDesc, achievement.longDesc, thresholdFunction);
	}
}

Achievements.prototype.init_append = function(key, shortDesc, longDesc, thresholdFunction) {
	/*
		Description:
		creates new achievement, adds to this.keyToIndex, pushes into this.list
	*/

	// create new
	let achievement = new Achievement(key, shortDesc, longDesc, thresholdFunction);
	// add to this.keyToIndex
	this.keyToIndex[key] = this.list.length;
	// push to this.list
	this.list.push(achievement);
}

/*
	other functions
*/

Achievements.prototype.check = function() {
	/*
		Description:
		checks through all unobtained achievements, to see if it can be considered obtained
	*/
	for (let i=0; i<this.list.length; i++) {
		let achievement = this.list[i];
		if (!achievement.obtained) {
			let key = achievement.key;
			let res = achievement.thresholdFunction();
			if (res)
				this.obtain(key);
		}
	}
}

Achievements.prototype.obtain = function(key) {
	/*
		Description:
		helper function for obtaining achievement
	*/
	let index = this.keyToIndex[key];
	// set obtained to true
	this.list[index].obtained = true;
	// update HTML
	get("achievement_" + key).style.backgroundColor = "green";
}