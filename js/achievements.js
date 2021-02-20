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

Achievements.prototype.generateList = function() {
	/*
		Description:
		this function generates the data required to define all the achievements, to reduce duplicate info that is used in similar achievements
	*/
	let list = [];

	// wpm
	let base = (val) => ({type:"WPM", threshold:val, shortDesc:"WPM &ge; " + val, longDesc:"Obtain an average WPM of at least " + val + ", for a duration of at least 1 minute."})
	for (let i=60; i<=80; i+=10) {
		let achievement = base(i);
		list.push(achievement);
	}

	// discovered letters
	base = (val) => ({type:"discoveredLetters", threshold:val, shortDesc:"Alphabet " + val + "%", longDesc:"Discover " + Math.ceil(val / 100 * 26) + " unique letters."})
	for (let i=25; i<=100; i+=25) {
		let achievement = base(i);
		list.push(achievement);
	}

	// discovered words
	base = (val) => ({type:"discoveredWords", threshold:val, shortDesc:"Dictionary " + val + "%", longDesc:"Discover " + Math.ceil(val / 100 * statistics.getData("max_words")) + " unique words."})
	for (let i=10; i<=100; i+=10) {
		let achievement = base(i);
		list.push(achievement);
	}

	return list;
}

Achievements.prototype.init = function() {
	/*
		Description:
		init function to create and build Achievement() objects
	*/

	let list = this.generateList();

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
		else if (achievement.type == "discoveredWords")
			thresholdFunction = () => {
				let numericalThreshold = Math.ceil(achievement.threshold / 100 * statistics.getData("max_words"))

				let numWords = game.discovered_words.length;
				let requirement = numWords >= numericalThreshold;
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