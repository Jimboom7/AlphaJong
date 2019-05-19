//################################
// UTILS
//################################

//Return Number of Doras in Hand
function getNumberOfDorasInHand(hand) {
	var dr = 0;
	for(var i = 0; i < hand.length; i++) {
		dr += hand[i].doraValue;
	}
	return dr;
}

function getHandOfType(inputHand, type) {
	var hand = [...inputHand];
	if(type == 4) {
		return hand;
	}
	if(type >= 0 && type <= 3) {
		return hand.filter(tile => tile.type == type);
	}
	return hand;
}

//Pairs in Hand
function getPairsInHand(input_hand) {
	var hand = [...input_hand];
	hand = sortHand(hand);
	
	var pairs = [];
	var oldIndex = 0;
	var oldType = 0;
	hand.forEach(function(tile) {
		if(oldIndex != tile.index || oldType != tile.type) {
			var tiles = getTilesInHand(hand, tile.index, tile.type);
			if((tiles.length >= 2)) {
				pairs.push(tiles[0]); //Grabs highest dora tiles first
				pairs.push(tiles[1]);
			}
			oldIndex = tile.index;
			oldType = tile.type;
		}
	});
	return pairs;
}

//Return Doubles in hand
function getDoublesInHand(hand) {
	var doubles = [];
	hand.forEach(function(tile) {
		if(isDouble(hand, tile)) {
			doubles.push(tile);
		}
	});
	//log("Number of Doubles in Hand: " + doubles);
	return doubles;
}


//Tile twice or 2 sequence or "bridge". Might even be triple
function isDouble(hand, tile) {
	var tileNumber = getNumberOfTilesInHand(hand, tile.index, tile.type);
	if(tile.type == 3) {
		return tileNumber == 2;
	}
	return ((tileNumber == 2) ||
	(((getNumberOfTilesInHand(hand, tile.index - 1, tile.type) >= 1) ||
	  (getNumberOfTilesInHand(hand, tile.index + 1, tile.type) >= 1) ||
	  (getNumberOfTilesInHand(hand, tile.index - 2, tile.type) >= 1) ||
	  (getNumberOfTilesInHand(hand, tile.index + 2, tile.type) >= 1)) && tileNumber >= 1));
}

//Return all Pons/Chis in hand
function getTriplesInHand(hand) {
	
	var currentHand = [...hand];
	
	var triples = getPonsInHand(currentHand);
	currentHand = getHandWithoutTriples(currentHand, triples);
	var straights = getBestChisInHand(currentHand);
	
	currentHand = [...hand];

	var straights2 = getBestChisInHand(currentHand);
	currentHand = getHandWithoutTriples(currentHand, straights2);
	var triples2 = getPonsInHand(currentHand);
	
	var t1 = triples.concat(straights);
	var t2 = triples2.concat(straights2);
	
	if(t1.length > t2.length || (t1.length == t2.length && getNumberOfDorasInHand(t1) > getNumberOfDorasInHand(t2))) {
		return t1; //If same: Priorize Chis -> Still double in hand. TODO: Sometimes priorize Pon is better
	}

	return t2;
}

//Return all Pons/Chis and Pairs in Hand -> 4 and 1 result: Winning Hand
function getTriplesAndPairsInHand(hand) {
	
	var currentHand = [...hand];
	
	var triples = getPonsInHand(currentHand);
	currentHand = getHandWithoutTriples(currentHand, triples);
	var p1 = getPairsInHand(currentHand);
	currentHand = getHandWithoutTriples(currentHand, p1);
	var straights = getBestChisInHand(currentHand);
	
	currentHand = [...hand];

	var straights2 = getBestChisInHand(currentHand);
	currentHand = getHandWithoutTriples(currentHand, straights2);
	var triples2 = getPonsInHand(currentHand);
	currentHand = getHandWithoutTriples(currentHand, triples2);
	var p2 = getPairsInHand(currentHand);
	
	var t1 = triples.concat(straights);
	var t2 = triples2.concat(straights2);
	
	if(t1.length > t2.length || (t1.length == t2.length && p1.length > p2.length) || (t1.length == t2.length && p1.length == p2.length && getNumberOfDorasInHand(t1) > getNumberOfDorasInHand(t2))) {
		return {triples: t1, pairs: p1}; //If same: Priorize Chis -> Still double in hand. TODO: Sometimes priorize Pon is better
	}

	return {triples: t2, pairs: p2};
}


//Return Hand without given tiles
function getHandWithoutTriples(inputHand, triples) {
	var hand = [...inputHand];
	
	for(var i = 0; i < triples.length; i++) {
		for(var j = 0; j < hand.length; j++) {
			if(triples[i].index == hand[j].index && triples[i].type == hand[j].type && triples[i].dora == hand[j].dora) {
				hand.splice(j, 1);
				break;
			}
		}
	}
	
	return hand;
}

//Return Hand without given tiles
function getHandWithoutTile(inputHand, tile) {
	var hand = [...inputHand];
	
	for(var j = 0; j < hand.length; j++) {
		if(tile.index == hand[j].index && tile.type == hand[j].type && tile.dora == hand[j].dora) {
			hand.splice(j, 1);
			break;
		}
	}
	
	return hand;
}

//Return all Pons in Hand
function getPonsInHand(input_hand) {
	var hand = [...input_hand];
	hand = sortHand(hand);
	
	var triples = [];
	var oldIndex = 0;
	var oldType = 0;
	hand.forEach(function(tile) {
		if(oldIndex != tile.index || oldType != tile.type) {
			var tiles = getTilesInHand(hand, tile.index, tile.type);
			if((tiles.length >= 3)) {
				triples.push(tiles[0]); //Grabs highest dora tiles first because of sorting
				triples.push(tiles[1]);
				triples.push(tiles[2]);
			}
			oldIndex = tile.index;
			oldType = tile.type;
		}
	});
	return triples;
}

function getBestChisInHand(inputHand) {
	var straights = getChisInHand(inputHand, []);
	var straightsB = getChisInHandDownward(inputHand, []);
	if(getNumberOfDorasInHand(straightsB) > getNumberOfDorasInHand(straights)) {
		straights = straightsB;
	}
	return straights;
}

//Return all 3-Sequences in Hand
function getChisInHand(inputHand, sequences) {
	
	var hand = [...inputHand];
	hand = sortHand(hand);

	if(hand.length <= 2 || hand[0].type == 3) {
		return sequences;
	}
	var index = hand[0].index;
	var type = hand[0].type;

	var tiles2 = getTilesInHand(hand, index + 1, type);
	var tiles3 = getTilesInHand(hand, index + 2, type);

	if(tiles2.length >= 1 && tiles3.length >= 1) {
		sequences.push(hand[0]);
		sequences.push(tiles2[0]);
		sequences.push(tiles3[0]);
		
		for(var i = 0; i < hand.length; i++) {
			if(hand[i].index == index + 1 && hand[i].type == type) {
				hand.splice(i, 1);
				break;
			}
		}
		for(var i = 0; i < hand.length; i++) {
			if(hand[i].index == index + 2 && hand[i].type == type) {
				hand.splice(i, 1);
				break;
			}
		}
		hand.splice(0, 1);
		return getChisInHand(hand, sequences);
	}
	else {
		hand.splice(0, 1);
		return getChisInHand(hand, sequences);
	}
}

//Return all 3-Sequences in Hand
function getChisInHandDownward(inputHand, sequences) {
	
	var hand = [...inputHand];
	hand = sortHandBackwards(hand);

	if(hand.length <= 2 || hand[0].type == 3) {
		return sequences;
	}
	var index = hand[0].index;
	var type = hand[0].type;

	var tiles2 = getTilesInHand(hand, index - 1, type);
	var tiles3 = getTilesInHand(hand, index - 2, type);

	if(tiles2.length >= 1 && tiles3.length >= 1) {
		sequences.push(hand[0]);
		sequences.push(tiles2[0]);
		sequences.push(tiles3[0]);
		
		for(var i = 0; i < hand.length; i++) {
			if(hand[i].index == index - 1 && hand[i].type == type) {
				hand.splice(i, 1);
				break;
			}
		}
		for(var i = 0; i < hand.length; i++) {
			if(hand[i].index == index - 2 && hand[i].type == type) {
				hand.splice(i, 1);
				break;
			}
		}
		hand.splice(0, 1);
		return getChisInHand(hand, sequences);
	}
	else {
		hand.splice(0, 1);
		return getChisInHand(hand, sequences);
	}
}

//Sort Hand
function sortHand(inputHand) {
	var hand = [...inputHand];
	hand = hand.sort(function (p1, p2) { //Sort by descending Dora value
		return p2.doraValue - p1.doraValue;
	});
	hand = hand.sort(function (p1, p2) { //Sort index ascending
		return p1.index - p2.index;
	});
	hand = hand.sort(function (p1, p2) { //Sort type ascending
		return p1.type - p2.type;
	});
	return hand;
}

//Sort Hand Backwards (For Chi Search)
function sortHandBackwards(inputHand) {
	var hand = [...inputHand];
	hand = hand.sort(function (p1, p2) { //Sort by descending Dora value
		return p2.doraValue - p1.doraValue;
	});
	hand = hand.sort(function (p1, p2) { //Sort index ascending
		return p2.index - p1.index;
	});
	hand = hand.sort(function (p1, p2) { //Sort type ascending
		return p1.type - p2.type;
	});
	return hand;
}

//Return Number of specific Tiles available
function getNumberOfTilesAvailable(index, type) {
	if(index < 1 || index > 9) {
			return 0;
	}
	
	return 4 - visibleTiles.filter(tile => tile.index == index && tile.type == type).length;
}

//Return Number of specific Non Furiten Tiles available
function getNumberOfNonFuritenTilesAvailable(index, type) {
	if(discards[0].some(tile => tile.index == index && tile.type == type)) {
		return 0;
	}
	return getNumberOfTilesAvailable(index, type);
}

//Return Number of specific Tile in Hand
function getNumberOfTilesInHand(hand, index, type) {
	return hand.filter(tile => tile.index == index && tile.type == type).length;
}

//Return specific Tiles in Hand
function getTilesInHand(inputHand, index, type) {
	var hand = [...inputHand];
	return hand.filter(tile => tile.index == index && tile.type == type);
}

//Update the available tile pool
function updateAvailableTiles() {
	visibleTiles = dora.concat(ownHand, discards[0], discards[1], discards[2], discards[3], calls[0], calls[1], calls[2], calls[3]);
	availableTiles = [];
	for (var i = 0; i <= 3; i++) {
		for (var j = 1; j <= 9; j++) {
			if(i == 3 && j == 8) {
				break;
			}
			for(var k = 1; k <= getNumberOfTilesAvailable(j, i); k++) {
				availableTiles.push({
					index: j,
					type: i,
					dora: false,
					doraValue: getTileDoraValue({index: j, type: i, dora: false})
				});
			}
		}
	}
	for(var i = 0; i < visibleTiles.length; i++) {
		visibleTiles[i].doraValue = getTileDoraValue(visibleTiles[i]);
	}
}

//Return Sum of Red Dora/Dora Indicators for tile
function getTileDoraValue(tile) {
	var dr = 0;
	
	for(var i = 0; i < dora.length; i++) {
		if(dora[i].type == tile.type && getHigherTileIndex(dora[i]) == tile.index) {
			dr++;
		}
	}
	
	if(!tile.dora) {
		return dr;
	}
	else {
		return dr + 1;
	}
}

//Helper Function for Dora Indicators
function getHigherTileIndex(tile) {
	if(tile.type == 3) {
		if(tile.index == 4) {
			return 1;
		}
		return tile.index == 7 ? 5 : tile.index + 1;
	}
	else {
		return tile.index == 9 ? 1 : tile.index + 1;
	}
}

//Returns 0 if not winning hand. Returns value of yaku/dora otherwise.
function checkWin(hand) {
	var win = getTriplesAndPairsInHand(hand);
	if(parseInt((win.triples.length/3)) >= 4 && parseInt((win.pairs.length/2)) >= 1) {
		var value = getTilePriorities(hand.concat([{index: 0, type: 3, dora: false, doraValue: 0}])); //Hand with "useless" tile. TODO: Improve this
		return value[0].doras + value[0].yaku;
	}
	return 0;
}



//################
//String Functions
//################
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


function getTileName(tile) {
	return tile.index + getNameForType(tile.type);
}

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

function isDebug() {
	return typeof DEBUG != "undefined";
}

function getHandWithCalls(inputHand) {
	var hand = inputHand.concat(calls[0]);
	return hand;
}

function pushTileIfNotExists(tiles, index, type) {
	if(tiles.findIndex(t => t.index == index && t.type == type) === -1) {
		var tile = {index: index, type: type, dora: false};
		tile.doraValue = getTileDoraValue(tile);
		tiles.push(tile);
	}
}

function canRiichi() {
	if(!isDebug()) {
		var operations = getOperationList();
		for(var i = 0; i < operations.length; i++) {
			if(operations[i].type == getOperations().liqi) {
				return true;
			}
		}
	}
	return false;
}


//Returns tiles that can form a triple in one turn for a given hand
function getUsefulTilesForTriple(hand) {
	var tiles = [];
	for(var i = 0; i < hand.length; i++) {
		
		var amount = getNumberOfTilesInHand(hand, hand[i].index, hand[i].type);
		if(hand[i].type == 3 && amount >= 2) {
			pushTileIfNotExists(tiles, hand[i].index, hand[i].type);
			continue;
		}

		if(amount >= 2) {
			pushTileIfNotExists(tiles, hand[i].index, hand[i].type);
		}
		
		var amountLower = getNumberOfTilesInHand(hand, hand[i].index - 1, hand[i].type);
		var amountLower2 = getNumberOfTilesInHand(hand, hand[i].index - 2, hand[i].type);
		var amountUpper = getNumberOfTilesInHand(hand, hand[i].index + 1, hand[i].type);
		var amountUpper2 = getNumberOfTilesInHand(hand, hand[i].index + 2, hand[i].type);
		if(hand[i].index - 1 >= 1 && (amount == amountLower + 1 && (amountUpper > 0 || amountLower2 == amount))) { //No need to check if index in bounds
			pushTileIfNotExists(tiles, hand[i].index - 1, hand[i].type);
		}
		
		if(hand[i].index + 1 <= 9 && (amount == amountUpper + 1 && (amountLower > 0 || amountUpper2 == amount))) {
			pushTileIfNotExists(tiles, hand[i].index + 1, hand[i].type);
		}
	}
	return tiles;
}

//Returns tiles that can form at least a double in one turn for a given hand
function getUsefulTilesForDouble(hand) {
	var tiles = [];
	for(var i = 0; i < hand.length; i++) {
		pushTileIfNotExists(tiles, hand[i].index, hand[i].type);
		if(hand[i].type == 3) {
			continue;
		}

		var amount = getNumberOfTilesInHand(hand, hand[i].index, hand[i].type);
		
		var amountLower = getNumberOfTilesInHand(hand, hand[i].index - 1, hand[i].type);
		var amountUpper = getNumberOfTilesInHand(hand, hand[i].index + 1, hand[i].type);
		if(amountLower == 0 && hand[i].index - 1 >= 1) {
			pushTileIfNotExists(tiles, hand[i].index - 1, hand[i].type);
		}
		
		if(amountUpper == 0 && hand[i].index + 1 <= 9) {
			pushTileIfNotExists(tiles, hand[i].index + 1, hand[i].type);
		}
	}
	return tiles;
}

function isTenpai(triplesAndPairs, doubles) {
	if(strategy == STRATEGIES.CHIITOITSU) {
		return parseInt(triplesAndPairs.pairs.length / 2) >= 6;
	}
	return ((parseInt(triplesAndPairs.triples.length/3) == 3 && parseInt(triplesAndPairs.pairs.length / 2) >= 1 && (doubles.length/2) >= 1 ) || parseInt(triplesAndPairs.triples.length/3) == 4);
}

function shouldFold(tiles) {
	if(getCurrentDangerLevel() > tiles[0].value * FOLD_CONSTANT) {
		log("Danger Level " + getCurrentDangerLevel() + " is bigger than " + tiles[0].value * FOLD_CONSTANT + ". FOLD!");
		return true;
	}
	return false;
}