function Notification(type, data) {
	this.type = type;
	this.data = data;
	this.addNotification();
}

Notification.prototype.addNotification = function() {
	// build innerHTML
	let time = "[" + getCurrentTime() + "]";
	let innerHTML;
	if (this.type == "word" || this.type == "letter")
		innerHTML = time + " You discovered a new " + this.type + ": <strong>" + this.data + "</strong>";
	else if (this.type == "insufficient")
		innerHTML = time + " You have insufficient <strong>" + this.data + "</strong>";

	// wrapper div element
	let div = document.createElement("div");
	div.innerHTML = innerHTML;
	// div.style.opacity = 0;

	// fade-in animation
	// can reference trigger_wordAnimation() when implementing this

	// insert after <h2>
	get("notifications").insertBefore(div, get("notifications").children[0].nextSibling);
}