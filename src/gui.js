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
	if(window.localStorage.getItem("alphajongAutorun") == "true") {
		startButton.innerHTML = "Stop Bot";
	}
	startButton.style.marginRight = "15px";
	startButton.onclick = function() {
		toggleRun();
    };
	guiSpan.appendChild(startButton);
	
	autorunCheckbox.type = "checkbox";
	autorunCheckbox.id = "autorun";
	autorunCheckbox.onclick = function() {
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
	var jadeEastOption = document.createElement("option");
	jadeEastOption.text = "Jade East";
	jadeEastOption.value = "8";
	roomCombobox.appendChild(jadeEastOption);
	var jadeSouthOption = document.createElement("option");
	jadeSouthOption.text = "Jade South";
	jadeSouthOption.value = "9";
	roomCombobox.appendChild(jadeSouthOption);
	roomCombobox.style.marginRight = "15px";
	roomCombobox.onchange = function() {
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
	if(window.localStorage.getItem("alphajongAutorun") == "true") {
		currentActionOutput.value = "Bot started.";
	}
	guiSpan.appendChild(currentActionOutput);
	
	hideButton.innerHTML = "Hide GUI";
	hideButton.onclick = function() {
		toggleGui();
	};
	guiSpan.appendChild(hideButton);
	
	guiDiv.appendChild(guiSpan);
	document.body.appendChild(guiDiv);
	toggleGui();
}

function toggleGui() {
	if(guiDiv.style.display == "block") {
		guiDiv.style.display = "none";
	}
	else {
		guiDiv.style.display = "block";
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
	if(autorunCheckbox.checked) {
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