function Notification(type, data) {
	this.type = type;
	this.data = data;
	this.addNotification();
}

Notification.prototype.addNotification = function() {
	// build innerHTML
	let time = "[" + getCurrentTime() + "]";
	let message;
	if (this.type == "word" || this.type == "letter")
		message = "You discovered a new " + this.type + ": <strong>" + this.data + "</strong>";
	else if (this.type == "insufficient")
		message = "You have insufficient <strong>" + this.data + "</strong>";

		// check if notification is the same as the immediate previous one
		if (get("notifications").children.length > 1) {
			let previousNotification = get("notifications").children[1].innerHTML;
			let split = previousNotification.split(" ");
			split.shift();
			previousNotification = split.join(" ");
			if (message == previousNotification)
				return;
		}

	innerHTML = time + " " + message;

	// wrapper div element
	let div = document.createElement("div");
	div.innerHTML = innerHTML;
	// div.style.opacity = 0;

	// fade-in animation
	// can reference trigger_wordAnimation() when implementing this

	// insert after <h2>
	get("notifications").insertBefore(div, get("notifications").children[0].nextSibling);
}