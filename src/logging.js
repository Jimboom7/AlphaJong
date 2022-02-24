//################################
// LOGGING
// Contains logging functions
//################################

//Print string to HTML or console
function log(t) {
	if (isDebug()) {
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
	hand.forEach(function (tile) {
		if (getNameForType(tile.type) != oldType) {
			handString += oldType + " ";
			oldType = getNameForType(tile.type);
		}
		handString += tile.index;
		if (tile.dora == 1) {
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
	for (var i = 0; i < tiles.length && i < LOG_AMOUNT; i++) {
		log(getTileName(tiles[i].tile) + ": Value: <" + Number(tiles[i].value).toFixed(3) + "> Efficiency: <" + Number(tiles[i].efficiency).toFixed(3) + "> Yakus Open: <" + Number(tiles[i].yaku.open).toFixed(3) + "> Yakus Closed: <" + Number(tiles[i].yaku.closed).toFixed(3) + "> Dora: <" + Number(tiles[i].dora).toFixed(3) + "> Waits: <" + Number(tiles[i].waits).toFixed(3) + "> Safety: " + Number(getTileSafety(tiles[i].tile)).toFixed(2));
	}
}

//Input string to get an array of tiles (e.g. "123m456p789s1z")
function getHandFromString(inputString) {
	var numbers = [];
	var tiles = [];
	for (let input of inputString) {
		var type = 4;
		switch (input) {
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
				numbers.push(input);
				break;
		}
		if (type != "4") {
			for (let number of numbers) {
				if (parseInt(number) == 0) {
					tiles.push({ index: 5, type: type, dora: true, doraValue: 1 });
				}
				else {
					tiles.push({ index: parseInt(number), type: type, dora: false, doraValue: 0 });
				}
			}
			numbers = [];
		}
	}
	return tiles;
}

//Input string to get a tiles (e.g. "1m")
function getTileFromString(inputString) {
	var type = 4;
	var dr = false;
	switch (inputString[1]) {
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
	}
	if (inputString[0] == "0") {
		inputString[0] = 5;
		dr = true;
	}
	if (type != "4") {
		var tile = { index: parseInt(inputString[0]), type: type, dora: dr };
		tile.doraValue = getTileDoraValue(tile);
		return tile;
	}
	return null;
}

//Returns the name for a tile
function getTileName(tile) {
	if (tile.dora == true) {
		return "0" + getNameForType(tile.type);
	}
	return tile.index + getNameForType(tile.type);
}

//Returns the corresponding char for a type
function getNameForType(type) {
	switch (type) {
		case 0:
			return "p";
		case 1:
			return "m";
		case 2:
			return "s";
		case 3:
			return "z";
		default:
			return "?";
	}
}