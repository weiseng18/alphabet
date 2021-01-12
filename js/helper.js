function get(id) {
	return document.getElementById(id);
}

function getCurrentTime() {
	/*
		Description:
		Gets time in the format HH:MM:SS
	*/
	let d = new Date();
	let formatted = d.toTimeString().split(" ")[0];
	return formatted;
}