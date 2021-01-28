function Notification(type, data, isAuto) {
	this.type = type;
	this.data = data;
	// isAuto is true when the notification was initiated by an automatic action
	this.isAuto = isAuto;
	
	// time the notification was created
	this.date = new Date();

	// this keeps track of how many manual action triggered notifications (in a row) are the same
	this.count = 1;

	this.addNotification();
}

Notification.prototype.addNotification = function() {
	// build innerHTML
	let time = "[" + getTime(this.date) + "]";
	switch(this.type) {
		case "word":
		case "letter":
			// discovered a new word/letter
			this.message = "You discovered a new " + this.type + ": <strong>" + this.data + "</strong>";
			break;

		case "insufficient":
			// insufficient resources to perform an action
			this.message = "You have insufficient <strong>" + this.data + "</strong>";
			break;

		case "noneLeft":
			// no more new letters/words to discover
			this.message = "You have no more new " + this.data + " to discover";
			if (game.possible_letters.length > 0)
				this.message += ". Consider discovering new letters or upgrading font size";
			break;

		// this and below are used for discover_word error messages
		case "discovered":
			// discovered word before
			this.message = "You have already discovered <strong>" + this.data + "</strong>";
			break;

		case "insufficientLetters":
			// have not discovered all letters, in the word tried to discover
			this.message = "You have not discovered all the letters in <strong>" + this.data + "</strong>";
			break;

		case "notWord":
			// not a valid word in dictionary.js
			this.message = "<strong>" + this.data + "</strong> is not a word";
			break;

		case "fontSize":
			// level of fontSize < length of word tried to discover
			this.message = "Your font size is still too large!";
			break;

		case "zeroWords":
			this.message = "You cannot print if you have not discovered any words";
			break;
		// end discover_word error messages

		case "custom":
			this.message = this.data;
			break;
	}

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
					notifications.splice(arrayIndex, 1);
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
			// else
			// if the notification has been made in the past 5 seconds: delete old, send new and add a counter to it
			// otherwise just send a new notification
			let delta = 5 * 1000;

			let arrayIndex = notifications.length - 1;
			let previousNotification = notifications[arrayIndex];

			while ((this.date - previousNotification.date) < delta) {
				if (previousNotification.message == this.message) {
					this.count = notifications[arrayIndex].count + 1;

					// remove from HTML
					get("notifications").children[notifications.length - arrayIndex].remove();
					// remove from array
					notifications.splice(arrayIndex, 1);
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
	}

	let countString = "(" + this.count + "x)";

	innerHTML = time + " " + this.message + (this.count != 1 ? " " + countString : "");

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