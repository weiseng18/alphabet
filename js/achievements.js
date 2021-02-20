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
		{type:"WPM", threshold:60, shortDesc:"WPM &ge; 60", longDesc:"Obtain an average WPM of at least 60, for a duration of at least 1 minute."},
		{type:"WPM", threshold:70, shortDesc:"WPM &ge; 70", longDesc:"Obtain an average WPM of at least 70, for a duration of at least 1 minute."},
		{type:"WPM", threshold:80, shortDesc:"WPM &ge; 80", longDesc:"Obtain an average WPM of at least 80, for a duration of at least 1 minute."},
		{type:"discoveredLetters", threshold:25, shortDesc:"Alphabet 25%", longDesc:"Discover at least 25% of the alphabet."},
		{type:"discoveredLetters", threshold:50, shortDesc:"Alphabet 50%", longDesc:"Discover at least 50% of the alphabet."},
		{type:"discoveredLetters", threshold:75, shortDesc:"Alphabet 75%", longDesc:"Discover at least 75% of the alphabet."},
		{type:"discoveredLetters", threshold:100, shortDesc:"Alphabet 100%", longDesc:"Discover every letter of the alphabet."}
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
		else if (achievement.type == "discoveredLetters")
			thresholdFunction = () => {
				let numericalThreshold = Math.ceil(achievement.threshold / 100 * 26)

				let numLetters = game.discovered_letters.length;
				let requirement = numLetters >= numericalThreshold;
				return requirement;
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
	// make achievement box green
	get("achievement_" + key).style.backgroundColor = "green";
	// make longDesc text white for visibility
	get("achievement_" + key).children[1].style.color = "white";

	// send notification
	let notification = new Notification("achievement", this.list[index].shortDesc);
}