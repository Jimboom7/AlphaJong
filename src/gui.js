//################################
// GUI
// Adds elements like buttons to control the bot
//################################

var guiDiv = document.createElement("div");
var guiSpan = document.createElement("span");
var startButton = document.createElement("button");
var autorunCheckbox = document.createElement("input");
var roomCombobox = document.createElement("select");
var currentActionOutput = document.createElement("input");
var debugButton = document.createElement("button");
var hideButton = document.createElement("button");

function initGui() {
	guiDiv.style.position = "absolute";
	guiDiv.style.zIndex = "100001"; //On top of the game
	guiDiv.style.left = "0px";
	guiDiv.style.top = "0px";
	guiDiv.style.width = "100%";
	guiDiv.style.textAlign = "center";
	guiDiv.style.fontSize = "20px";

	guiSpan.style.backgroundColor = "rgba(255,255,255,0.5)";
	guiSpan.style.padding = "5px";

	startButton.innerHTML = "Start Bot";
	if (window.localStorage.getItem("alphajongAutorun") == "true") {
		startButton.innerHTML = "Stop Bot";
	}
	startButton.style.marginRight = "15px";
	startButton.onclick = function () {
		toggleRun();
	};
	guiSpan.appendChild(startButton);

	autorunCheckbox.type = "checkbox";
	autorunCheckbox.id = "autorun";
	autorunCheckbox.onclick = function () {
		autorunCheckboxClick();
	};
	if (window.localStorage.getItem("alphajongAutorun") == "true") {
		autorunCheckbox.checked = true;
	}
	guiSpan.appendChild(autorunCheckbox);
	var checkboxLabel = document.createElement("label");
	checkboxLabel.htmlFor = "autorun";
	checkboxLabel.appendChild(document.createTextNode('Autostart new Game in'));
	checkboxLabel.style.marginRight = "5px";
	guiSpan.appendChild(checkboxLabel);

	var bronzeEastOption = document.createElement("option");
	bronzeEastOption.text = "Bronze East";
	bronzeEastOption.value = "2";
	roomCombobox.appendChild(bronzeEastOption);
	var bronzeSouthOption = document.createElement("option");
	bronzeSouthOption.text = "Bronze South";
	bronzeSouthOption.value = "3";
	roomCombobox.appendChild(bronzeSouthOption);
	var silverEastOption = document.createElement("option");
	silverEastOption.text = "Silver East";
	silverEastOption.value = "5";
	roomCombobox.appendChild(silverEastOption);
	var silverSouthOption = document.createElement("option");
	silverSouthOption.text = "Silver South";
	silverSouthOption.value = "6";
	roomCombobox.appendChild(silverSouthOption);
	var goldEastOption = document.createElement("option");
	goldEastOption.text = "Gold East";
	goldEastOption.value = "8";
	roomCombobox.appendChild(goldEastOption);
	var goldSouthOption = document.createElement("option");
	goldSouthOption.text = "Gold South";
	goldSouthOption.value = "9";
	roomCombobox.appendChild(goldSouthOption);
	var bronzeEast3Option = document.createElement("option");
	bronzeEast3Option.text = "Bronze East 3P";
	bronzeEast3Option.value = "17";
	roomCombobox.appendChild(bronzeEast3Option);
	var bronzeSouth3Option = document.createElement("option");
	bronzeSouth3Option.text = "Bronze South 3P";
	bronzeSouth3Option.value = "18";
	roomCombobox.appendChild(bronzeSouth3Option);
	var silverEast3Option = document.createElement("option");
	silverEast3Option.text = "Silver East 3P";
	silverEast3Option.value = "19";
	roomCombobox.appendChild(silverEast3Option);
	var silverSouth3Option = document.createElement("option");
	silverSouth3Option.text = "Silver South 3P";
	silverSouth3Option.value = "20";
	roomCombobox.appendChild(silverSouth3Option);
	var goldEast3Option = document.createElement("option");
	goldEast3Option.text = "Gold East 3P";
	goldEast3Option.value = "21";
	roomCombobox.appendChild(goldEast3Option);
	var goldSouth3Option = document.createElement("option");
	goldSouth3Option.text = "Gold South 3P";
	goldSouth3Option.value = "22";
	roomCombobox.appendChild(goldSouth3Option);
	roomCombobox.style.marginRight = "15px";
	roomCombobox.onchange = function () {
		roomChange();
	};
	roomCombobox.value = ROOM;
	if (window.localStorage.getItem("alphajongAutorun") != "true") {
		roomCombobox.disabled = true;
	}
	guiSpan.appendChild(roomCombobox);

	currentActionOutput.readOnly = "true";
	currentActionOutput.size = "20";
	currentActionOutput.style.marginRight = "15px";
	currentActionOutput.value = "Bot is not running.";
	if (window.localStorage.getItem("alphajongAutorun") == "true") {
		currentActionOutput.value = "Bot started.";
	}
	guiSpan.appendChild(currentActionOutput);

	debugButton.innerHTML = "Debug";
	debugButton.onclick = function () {
		showDebugString();
	};
	if (DEBUG_BUTTON) {
		guiSpan.appendChild(debugButton);
	}

	hideButton.innerHTML = "Hide GUI";
	hideButton.onclick = function () {
		toggleGui();
	};
	guiSpan.appendChild(hideButton);

	guiDiv.appendChild(guiSpan);
	document.body.appendChild(guiDiv);
	toggleGui();
}

function toggleGui() {
	if (guiDiv.style.display == "block") {
		guiDiv.style.display = "none";
	}
	else {
		guiDiv.style.display = "block";
	}
}

function showDebugString() {
	alert("If you notice a bug while playing please go to the correct turn in the replay (before the bad discard), press this button, copy the Debug String from the textbox and include it in your issue on github.");
	if (isInGame()) {
		setData();
		currentActionOutput.value = getDebugString();
	}
}

function roomChange() {
	window.localStorage.setItem("alphajongRoom", roomCombobox.value);
	ROOM = roomCombobox.value;
}

function hideButtonClick() {
	guiDiv.style.display = "none";
}

function autorunCheckboxClick() {
	if (autorunCheckbox.checked) {
		roomCombobox.disabled = false;
		window.localStorage.setItem("alphajongAutorun", "true");
		AUTORUN = true;
	}
	else {
		roomCombobox.disabled = true;
		window.localStorage.setItem("alphajongAutorun", "false");
		AUTORUN = false;
	}
}