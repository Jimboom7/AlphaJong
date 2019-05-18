//################################
// LOGGING
//################################

function log(t) {
	if(isDebug()) {
		document.body.innerHTML += t + "<br>";
	}
	else {
		console.log(t);
	}
}

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

function printTile(tile) {
	if(tile.dora == 0) {
		log(tile.index + getNameForType(tile.type));
	}
	else {
		log(tile.index + "!" + getNameForType(tile.type));
	}
}

function printTilePriority(tiles) {
	for(var i = 0; i < tiles.length && i < LOG_AMOUNT; i++) {
		log(getTileName(tiles[i].tile) + ": Value: <" + Number(tiles[i].value).toFixed(3) + "> Efficiency: <" + Number(tiles[i].efficiency).toFixed(3) + "> Yakus Open: <" + Number(tiles[i].yaku.open).toFixed(3) + "> Yakus Closed: <" + Number(tiles[i].yaku.closed).toFixed(3) + "> Dora: <" + Number(tiles[i].dora).toFixed(3) + "> Safety: " + Number(getTileSafety(tiles[i].tile)).toFixed(2));
	}
}

function printTilePriority_OLD(tiles) {
	for(var i = 0; i < tiles.length && i < LOG_AMOUNT; i++) {
		var yOpen = [tiles[i].yaku[0].open, tiles[i].yaku[1].open, tiles[i].yaku[2].open];
		var yClosed = [tiles[i].yaku[0].closed, tiles[i].yaku[1].closed, tiles[i].yaku[2].closed];
		log(getTileName(tiles[i].tile) + ": Values: " + getRoundedArrayAsString(tiles[i].value) + "Efficiency: " + getRoundedArrayAsString(tiles[i].efficiency) + "Yakus Open: " + getRoundedArrayAsString(yOpen) + "Yakus Closed: " + getRoundedArrayAsString(yClosed) + "Dora: " + getRoundedArrayAsString(tiles[i].dora) + "Danger: " + Number(getTileDanger(tiles[i].tile)).toFixed(2));
	}
}

function getRoundedArrayAsString_OLD(array) {
	var string = "";
	for(var i = 0; i < array.length; i++) {
		string += Number(array[i]).toFixed(2) + ", ";
	}
	string.slice(0, 2);
	return string;
}