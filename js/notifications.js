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

	// only possible for "repeat" notifications if there has been a notification in the first place
	if (notifications.length > 0) {
		if (this.isAuto) {
			// if the notification came from an action that was performed automatically,
			// if the notification hasn't been made in the past 30 seconds: delete old and send new notification
			// otherwise, send new notification and keep old
			let delta = 30 * 1000;

			let arrayIndex = notifications.length - 1;
			let previousNotification = notifications[arrayIndex];
			while ((this.date - previousNotification.date) < delta) {
				if (previousNotification.message == this.message) {
					// remove from HTML
					get("notifications").children[notifications.length - arrayIndex].remove();
					// remove from array
					notifications.splice(arrayIndex);
					break;
				}

				// get next notification
				if (arrayIndex == 0)
					break;
				else {
					arrayIndex--;
					previousNotification = notifications[arrayIndex];
				}
			}
		}
		else {
			// else repeat the notification unless the immediate previous notification is the same
			let previousNotification = notifications[notifications.length - 1];
			if (previousNotification.message == this.message) {
				// remove from HTML
				get("notifications").children[1].remove();
				// remove from array
				notifications.pop();
			}
		}
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