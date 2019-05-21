//################################
// LOGGING
// Contains logging functions
//################################

//Print string to HTML or console
function log(t) {
	if(isDebug()) {
		document.body.innerHTML += t + "<br>";
	}
	else {
		console.log(t);
	}
}

//Print all tiles in hand
function printHand(hand) {
	var handString = "";
	var oldType = "";
	hand.forEach(function(tile) {
		if(getNameForType(tile.type) != oldType) {
			handString += oldType + " ";
			oldType = getNameForType(tile.type);
		}
		handString += tile.index;
		if(tile.dora == 1) {
			handString += "!";
		}
	});
	handString += oldType;
	log("Hand:" + handString);
}

//Print tile name
function printTile(tile) {
	log(getTileName(tile));
}

//Print given tile priorities
function printTilePriority(tiles) {
	for(var i = 0; i < tiles.length && i < LOG_AMOUNT; i++) {
		log(getTileName(tiles[i].tile) + ": Value: <" + Number(tiles[i].value).toFixed(3) + "> Efficiency: <" + Number(tiles[i].efficiency).toFixed(3) + "> Yakus Open: <" + Number(tiles[i].yaku.open).toFixed(3) + "> Yakus Closed: <" + Number(tiles[i].yaku.closed).toFixed(3) + "> Dora: <" + Number(tiles[i].dora).toFixed(3) + "> Waits: <" + tiles[i].waits + "> Safety: " + Number(getTileSafety(tiles[i].tile)).toFixed(2));
	}
}

//Input string to get an array of tiles (e.g. "123m456p789s1z")
function getHandFromString(inputString) {
	var numbers = [];
	var tiles = [];
	for(var i = 0; i < inputString.length; i++) {
		var type = 4;
		switch(inputString[i]) {
			case "p":
				type = 0;
				break;
			case "m":
				type = 1;
				break;
			case "s":
				type = 2;
				break;
			case "z":
				type = 3;
				break;
			default:
				numbers.push(inputString[i]);
				break;
		}
		if(type != "4") {
			for(var j = 0; j < numbers.length; j++) {
				tiles.push({index: parseInt(numbers[j]), type: type, dora: false, doraValue: 0});
			}
			numbers = [];
		}
	}
	return tiles;
}

//Returns the name for a tile
function getTileName(tile) {
	if(tile.dora == true) {
		return "0" + getNameForType(tile.type);
	}
	return tile.index + getNameForType(tile.type);
}

//Returns the corresponding char for a type
function getNameForType(type) {
	switch(type) {
		case 0:
			return "p"
			break;
		case 1:
			return "m"
			break;
		case 2:
			return "s"
			break;
		case 3:
			return "z"
		break;
	}
}