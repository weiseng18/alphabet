function Notification(type, data, isAuto) {
	this.type = type;
	this.data = data;
	// isAuto is true when the notification was initiated by an automatic action
	this.isAuto = isAuto;
	
	// time the notification was created
	this.date = new Date();

	this.addNotification();
}

Notification.prototype.addNotification = function() {
	// build innerHTML
	let time = "[" + getTime(this.date) + "]";
	if (this.type == "word" || this.type == "letter")
		this.message = "You discovered a new " + this.type + ": <strong>" + this.data + "</strong>";
	else if (this.type == "insufficient")
		this.message = "You have insufficient <strong>" + this.data + "</strong>";
	else if (this.type == "discovered") {
		// necessarily means failure
		this.message = "You have already discovered <strong>" + this.data + "</strong>";
	}
	else if (this.type == "insufficientLetters")
		this.message = "You have not discovered all the letters in <strong>" + this.data + "</strong>";
	else if (this.type == "notWord")
		this.message = "<strong>" + this.data + "</strong> is not a word";


		// check if notification is the same as the immediate previous one
		if (get("notifications").children.length > 1) {
			let previousNotification = get("notifications").children[1].innerHTML;
			let split = previousNotification.split(" ");
			split.shift();
			previousNotification = split.join(" ");
			if (this.message == previousNotification)
				return;
		}

	innerHTML = time + " " + this.message;

	// wrapper div element
	let div = document.createElement("div");
	div.innerHTML = innerHTML;
	// div.style.opacity = 0;

	// fade-in animation
	// can reference trigger_wordAnimation() when implementing this

	// insert after <h2>
	get("notifications").insertBefore(div, get("notifications").children[0].nextSibling);

	// append to notifications array
	notifications.push(this);
}