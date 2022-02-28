//################################
// UTILS
// Contains utility functions
//################################

//Return the number of players in the game (3 or 4)
function getNumberOfPlayers() {
	if (!doesPlayerExist(1) || !doesPlayerExist(2) || !doesPlayerExist(3)) {
		return 3;
	}
	return 4;
}

//Correct the player numbers
//Only necessary for 3 player games
function getCorrectPlayerNumber(player) {
	if (getNumberOfPlayers() == 4) {
		return player;
	}
	if (!doesPlayerExist(1)) {
		if (player > 0) {
			return player + 1;
		}
	}
	if (!doesPlayerExist(2)) {
		if (player > 1) {
			return player + 1;
		}
	}
	return player;
}

//Return number of doras in tiles
function getNumberOfDoras(tiles) {
	var dr = 0;
	for (let tile of tiles) {
		dr += tile.doraValue;
	}
	return dr;
}

//Pairs in tiles
function getPairs(tiles) {
	var sortedTiles = sortTiles(tiles);

	var pairs = [];
	var oldIndex = 0;
	var oldType = 0;
	sortedTiles.forEach(function (tile) {
		if (oldIndex != tile.index || oldType != tile.type) {
			var ts = getTilesInTileArray(sortedTiles, tile.index, tile.type);
			if ((ts.length >= 2)) {
				pairs.push({ tile1: ts[0], tile2: ts[1] }); //Grabs highest dora tiles first
			}
			oldIndex = tile.index;
			oldType = tile.type;
		}
	});
	return pairs;
}

//Pairs in tiles as array
function getPairsAsArray(tiles) {
	var pairs = getPairs(tiles);
	var pairList = [];
	pairs.forEach(function (pair) {
		pairList.push(pair.tile1);
		pairList.push(pair.tile2);
	});
	return pairList;
}

//Return doubles in tiles
function getDoubles(tiles) {
	var doubles = [];
	tiles.forEach(function (tile) {
		if (isDouble(tiles, tile)) {
			doubles.push(tile);
		}
	});
	return doubles;
}


//Tile twice or 2 sequence or "bridge". Might even be triple
function isDouble(tiles, tile) {
	var tileNumber = getNumberOfTilesInTileArray(tiles, tile.index, tile.type);
	if (tile.type == 3) {
		return tileNumber == 2;
	}
	return ((tileNumber == 2) ||
		(((getNumberOfTilesInTileArray(tiles, tile.index - 1, tile.type) >= 1) ||
			(getNumberOfTilesInTileArray(tiles, tile.index + 1, tile.type) >= 1) ||
			(getNumberOfTilesInTileArray(tiles, tile.index - 2, tile.type) >= 1) ||
			(getNumberOfTilesInTileArray(tiles, tile.index + 2, tile.type) >= 1)) && tileNumber >= 1));
}

//Return all triplets/3-sequences and pairs as a tile array
function getTriplesAndPairs(tiles) {
	var sequences = getSequences(tiles);
	var triplets = getTriplets(tiles);
	var pairs = getPairs(tiles);
	return getBestCombinationOfTiles(tiles, sequences.concat(triplets).concat(pairs), { triples: [], pairs: [] });
}

//Return all triplets/3-tile-sequences as a tile array
function getTriples(tiles) {
	var sequences = getSequences(tiles);
	var triplets = getTriplets(tiles);
	return getBestCombinationOfTiles(tiles, sequences.concat(triplets), { triples: [], pairs: [] }).triples;
}

//Return all triplets in tile array
function getTriplets(tiles) {
	var sortedTiles = sortTiles(tiles);

	var triples = [];
	var oldIndex = 0;
	var oldType = 0;
	sortedTiles.forEach(function (tile) {
		if (oldIndex != tile.index || oldType != tile.type) {
			var ts = getTilesInTileArray(sortedTiles, tile.index, tile.type);
			if ((ts.length >= 3)) {
				triples.push({ tile1: ts[0], tile2: ts[1], tile3: ts[2] }); //Grabs highest dora tiles first because of sorting
			}
			oldIndex = tile.index;
			oldType = tile.type;
		}
	});
	return triples;
}

//Triplets in tiles as array
function getTripletsAsArray(tiles) {
	var triplets = getTriplets(tiles);
	var tripletsList = [];
	triplets.forEach(function (triplet) {
		tripletsList.push(triplet.tile1);
		tripletsList.push(triplet.tile2);
		tripletsList.push(triplet.tile3);
	});
	return tripletsList;
}

//Returns the best combination of sequences. 
//Small Bug: Can return red dora tiles multiple times, but doesn't matter for the current use cases
function getBestSequenceCombination(inputHand) {
	return getBestCombinationOfTiles(inputHand, getSequences(inputHand), { triples: [], pairs: [] }).triples;
}

//Check if there is already a red dora tile in the tiles array.
//More or less a workaround for a problem with the getBestCombinationOfTiles function...
function pushTileAndCheckDora(tiles, arrayToPush, tile) {
	if (tile.dora && tiles.some(t => t.type == tile.type && t.dora)) {
		nonDoraTile = { ...tile };
		nonDoraTile.dora = false;
		nonDoraTile.doraValue = getTileDoraValue(nonDoraTile);
		arrayToPush.push(nonDoraTile);
		return;
	}
	arrayToPush.push(tile);
}

//Return the best combination of 3-tile Sequences, Triplets and pairs in array of tiles
//Recursive Function, weird code that can probably be optimized
function getBestCombinationOfTiles(inputTiles, possibleCombinations, chosenCombinations) {
	var originalC = { triples: [...chosenCombinations.triples], pairs: [...chosenCombinations.pairs] };
	for (var i = 0; i < possibleCombinations.length; i++) {
		var cs = { triples: [...originalC.triples], pairs: [...originalC.pairs] };
		var tiles = possibleCombinations[i];
		var hand = [...inputTiles];
		if (!("tile3" in tiles)) { // Pairs
			if (tiles.tile1.index == tiles.tile2.index && getNumberOfTilesInTileArray(hand, tiles.tile1.index, tiles.tile1.type) < 2) {
				continue;
			}
		}
		else if (getNumberOfTilesInTileArray(hand, tiles.tile1.index, tiles.tile1.type) == 0 ||
			getNumberOfTilesInTileArray(hand, tiles.tile2.index, tiles.tile2.type) == 0 ||
			getNumberOfTilesInTileArray(hand, tiles.tile3.index, tiles.tile3.type) == 0 ||
			(tiles.tile1.index == tiles.tile2.index && getNumberOfTilesInTileArray(hand, tiles.tile1.index, tiles.tile1.type) < 3)) {
			continue;
		}
		if ("tile3" in tiles) {
			pushTileAndCheckDora(cs.pairs.concat(cs.triples), cs.triples, tiles.tile1);
			pushTileAndCheckDora(cs.pairs.concat(cs.triples), cs.triples, tiles.tile2);
			pushTileAndCheckDora(cs.pairs.concat(cs.triples), cs.triples, tiles.tile3);
			hand = removeTilesFromTileArray(hand, [tiles.tile1, tiles.tile2, tiles.tile3]);
		}
		else {
			pushTileAndCheckDora(cs.pairs.concat(cs.triples), cs.pairs, tiles.tile1);
			pushTileAndCheckDora(cs.pairs.concat(cs.triples), cs.pairs, tiles.tile2);
			hand = removeTilesFromTileArray(hand, [tiles.tile1, tiles.tile2]);
		}
		var anotherChoice = getBestCombinationOfTiles(hand, possibleCombinations.slice(i + 1), cs);
		if (anotherChoice.triples.length > chosenCombinations.triples.length ||
			(anotherChoice.triples.length == chosenCombinations.triples.length &&
				anotherChoice.pairs.length > chosenCombinations.pairs.length) ||
			(anotherChoice.triples.length == chosenCombinations.triples.length &&
				anotherChoice.pairs.length == chosenCombinations.pairs.length &&
				getNumberOfDoras(anotherChoice.triples.concat(anotherChoice.pairs)) > getNumberOfDoras(chosenCombinations.triples.concat(chosenCombinations.pairs)))) {
			chosenCombinations = anotherChoice;
		}
	}

	return chosenCombinations;
}

//Return all 3-tile Sequences in tile array
function getSequences(tiles) {
	var sortedTiles = sortTiles(tiles);
	var sequences = [];
	for (var index = 0; index <= 7; index++) {
		for (var type = 0; type <= 2; type++) {
			var tiles1 = getTilesInTileArray(sortedTiles, index, type);
			var tiles2 = getTilesInTileArray(sortedTiles, index + 1, type);
			var tiles3 = getTilesInTileArray(sortedTiles, index + 2, type);

			var i = 0;
			while (tiles1.length > i && tiles2.length > i && tiles3.length > i) {
				sequences.push({ tile1: tiles1[i], tile2: tiles2[i], tile3: tiles3[i] });
				i++;
			}
		}
	}
	return sequences;
}

//Return tile array without given tiles
function removeTilesFromTileArray(inputTiles, tiles) {
	var tileArray = [...inputTiles];

	for (let tile of tiles) {
		for (var j = 0; j < tileArray.length; j++) {
			if (tile.index == tileArray[j].index && tile.type == tileArray[j].type && tile.dora == tileArray[j].dora) {
				tileArray.splice(j, 1);
				break;
			}
		}
	}

	return tileArray;
}

//Sort tiles
function sortTiles(inputTiles) {
	var tiles = [...inputTiles];
	tiles = tiles.sort(function (p1, p2) { //Sort dora value descending
		return p2.doraValue - p1.doraValue;
	});
	tiles = tiles.sort(function (p1, p2) { //Sort index ascending
		return p1.index - p2.index;
	});
	tiles = tiles.sort(function (p1, p2) { //Sort type ascending
		return p1.type - p2.type;
	});
	return tiles;
}

//Return number of specific tiles available
function getNumberOfTilesAvailable(index, type) {
	if (index < 1 || index > 9) {
		return 0;
	}
	if (getNumberOfPlayers() == 3 && (index > 1 && index < 9 && type == 1)) {
		return 0;
	}

	return 4 - visibleTiles.filter(tile => tile.index == index && tile.type == type).length;
}

//Return number of specific non furiten tiles available
function getNumberOfNonFuritenTilesAvailable(index, type, lastTiles) {
	if (typeof lastTiles != "undefined" && lastTiles.length == 2) { // Sequence furiten
		lastTiles = sortTiles(lastTiles);
		if (lastTiles[0].type == lastTiles[1].type && lastTiles[1].index - lastTiles[0].index == 1) { //Is it a 2-tile sequence
			if (index == lastTiles[1].index + 1 && type == lastTiles[1].type) { //Upper Tile -> Check if lower tile is furiten
				if (discards[0].some(tile => tile.index == lastTiles[0].index - 1 && tile.type == type)) {
					return 0;
				}
			}
			else if (index == lastTiles[0].index - 1 && type == lastTiles[0].type) { //Upper Tile -> Check if lower tile is furiten
				if (discards[0].some(tile => tile.index == lastTiles[1].index + 1 && tile.type == type)) {
					return 0;
				}
			}
		}
	}
	if (discards[0].some(tile => tile.index == index && tile.type == type)) { //Same tile furiten
		return 0;
	}
	return getNumberOfTilesAvailable(index, type);
}

//Return number of specific tile in tile array
function getNumberOfTilesInTileArray(tileArray, index, type) {
	return getTilesInTileArray(tileArray, index, type).length;
}

//Return specific tiles in tile array
function getTilesInTileArray(tileArray, index, type) {
	return tileArray.filter(tile => tile.index == index && tile.type == type);
}

//Update the available tile pool
function updateAvailableTiles() {
	visibleTiles = dora.concat(ownHand, discards[0], discards[1], discards[2], discards[3], calls[0], calls[1], calls[2], calls[3]);
	visibleTiles = visibleTiles.filter(tile => tile != undefined);
	availableTiles = [];
	for (var i = 0; i <= 3; i++) {
		for (var j = 1; j <= 9; j++) {
			if (i == 3 && j == 8) {
				break;
			}
			for (var k = 1; k <= getNumberOfTilesAvailable(j, i); k++) {
				availableTiles.push({
					index: j,
					type: i,
					dora: false,
					doraValue: getTileDoraValue({ index: j, type: i, dora: false })
				});
			}
		}
	}
	for (let vis of visibleTiles) {
		vis.doraValue = getTileDoraValue(vis);
	}
}

//Return sum of red dora/dora indicators for tile
function getTileDoraValue(tile) {
	var dr = 0;

	for (let d of dora) {
		if (d.type == tile.type && getHigherTileIndex(d) == tile.index) {
			dr++;
		}
	}

	if (tile.dora) {
		return dr + 1;
	}
	return dr;
}

//Helper function for dora indicators
function getHigherTileIndex(tile) {
	if (tile.type == 3) {
		if (tile.index == 4) {
			return 1;
		}
		return tile.index == 7 ? 5 : tile.index + 1;
	}
	return tile.index == 9 ? 1 : tile.index + 1;
}

//Returns 0 if not winning hand. Returns value of yaku/dora otherwise.
//Only used for benchmark
function checkWin(hand) {
	var win = getTriplesAndPairs(hand);
	if (parseInt((win.triples.length / 3)) >= 4 && parseInt((win.pairs.length / 2)) >= 1) {
		if (isClosed) {
			return getNumberOfDoras(hand) + getYaku(hand).closed;
		}
		else {
			return getNumberOfDoras(hand) + getYaku(hand).open;
		}
	}
	return 0;
}

//Returns true if DEBUG flag is set
function isDebug() {
	return typeof DEBUG != "undefined";
}

//Adds calls of player 0 to the hand
function getHandWithCalls(inputHand) {
	return inputHand.concat(calls[0]);
}

//Adds a tile if not in array
function pushTileIfNotExists(tiles, index, type) {
	if (tiles.findIndex(t => t.index == index && t.type == type) === -1) {
		var tile = { index: index, type: type, dora: false };
		tile.doraValue = getTileDoraValue(tile);
		tiles.push(tile);
	}
}

//Returns true if player can call riichi
function canRiichi() {
	if (isDebug()) {
		return false;
	}
	var operations = getOperationList();
	for (let op of operations) {
		if (op.type == getOperations().liqi) {
			return true;
		}
	}
	return false;
}

//Returns tiles that can form a triple in one turn for a given tile array
function getUsefulTilesForTriple(tileArray) {
	var tiles = [];
	for (let tile of tileArray) {
		var amount = getNumberOfTilesInTileArray(tileArray, tile.index, tile.type);
		if (tile.type == 3 && amount >= 2) {
			pushTileIfNotExists(tiles, tile.index, tile.type);
			continue;
		}

		if (amount >= 2) {
			pushTileIfNotExists(tiles, tile.index, tile.type);
		}

		var amountLower = getNumberOfTilesInTileArray(tileArray, tile.index - 1, tile.type);
		var amountLower2 = getNumberOfTilesInTileArray(tileArray, tile.index - 2, tile.type);
		var amountUpper = getNumberOfTilesInTileArray(tileArray, tile.index + 1, tile.type);
		var amountUpper2 = getNumberOfTilesInTileArray(tileArray, tile.index + 2, tile.type);
		if (tile.index > 1 && (amount == amountLower + 1 && (amountUpper > 0 || amountLower2 > 0))) { //No need to check if index in bounds
			pushTileIfNotExists(tiles, tile.index - 1, tile.type);
		}

		if (tile.index < 9 && (amount == amountUpper + 1 && (amountLower > 0 || amountUpper2 > 0))) {
			pushTileIfNotExists(tiles, tile.index + 1, tile.type);
		}
	}
	return tiles;
}

//Returns tiles that can form at least a double in one turn for a given tile array
function getUsefulTilesForDouble(tileArray) {
	var tiles = [];
	for (let tile of tileArray) {
		pushTileIfNotExists(tiles, tile.index, tile.type);
		if (tile.type == 3) {
			continue;
		}

		var amountLower = getNumberOfTilesInTileArray(tileArray, tile.index - 1, tile.type);
		var amountUpper = getNumberOfTilesInTileArray(tileArray, tile.index + 1, tile.type);
		if (amountLower == 0 && tile.index - 1 >= 1) {
			pushTileIfNotExists(tiles, tile.index - 1, tile.type);
		}

		if (amountUpper == 0 && tile.index + 1 <= 9) {
			pushTileIfNotExists(tiles, tile.index + 1, tile.type);
		}
	}
	return tiles;
}

//Return true if: Not last place and the danger level is too high
function shouldFold(tiles) {
	var factor = FOLD_CONSTANT;
	if (isLastGame()) { //Fold earlier when first/later when last in last game
		if (getDistanceToLast() > 0) {
			factor *= 1.5; //Last Place -> Later Fold
		}
		else if (getDistanceToFirst() < 0) {
			var dist = (getDistanceToFirst() / 30000) > -0.5 ? getDistanceToFirst() / 30000 : -0.5;
			factor *= 1 + dist; //First Place -> Easier Fold
		}
	}
	factor *= seatWind == 1 ? 1.1 : 1; //Fold later as dealer
	log("Would fold this hand below " + Number((1 - (((tiles[0].value * tiles[0].value * factor) + (factor / 3)) / 100))).toFixed(2) + " safety.");

	var top3Safety = -1;
	if (typeof tiles[2] != "undefined") {
		top3Safety = (getTileSafety(tiles[0].tile) + getTileSafety(tiles[1].tile) + getTileSafety(tiles[2].tile)) / 3;
	}

	var valueFactor = 1 - ((tiles[0].value * tiles[0].value * factor) + (factor / 3)) / 100;
	if (valueFactor > getTileSafety(tiles[0].tile) && valueFactor > top3Safety) {
		log("Tile Safety " + getTileSafety(tiles[0].tile) + " of " + getTileName(tiles[0].tile) + " is too dangerous. FOLD!");
		return true;
	}
	return false;
}

//Only Call Riichi if enough waits and not first with yaku
function shouldRiichi(waits, yaku) {
	if (waits < WAITS_FOR_RIICHI - (2 - (tilesLeft / 35))) { //Not enough waits? -> No Riichi
		return false;
	}
	if (yaku.closed >= 1 && isLastGame() && (getDistanceToFirst() < 0 || (getDistanceToLast() < 0 && getDistanceToLast() >= -1000))) { //First place (or < 1000 before last) and other yaku? -> No Riichi
		return false;
	}
	return true;
}

//Negative number: Distance to second
//Positive number: Distance to first
function getDistanceToFirst() {
	if (getNumberOfPlayers() == 3) {
		return Math.max(getPlayerScore(1), getPlayerScore(2)) - getPlayerScore(0);
	}
	return Math.max(getPlayerScore(1), getPlayerScore(2), getPlayerScore(3)) - getPlayerScore(0);
}

//Negative number: Distance to last
//Positive number: Distance to third
function getDistanceToLast() {
	if (getNumberOfPlayers() == 3) {
		return Math.min(getPlayerScore(1), getPlayerScore(2)) - getPlayerScore(0);
	}
	return Math.min(getPlayerScore(1), getPlayerScore(2), getPlayerScore(3)) - getPlayerScore(0);
}

//Check if "All Last"
function isLastGame() {
	if (isEastRound()) {
		return getRound() == 3 || getRoundWind() > 1; //East 4 or South X
	}
	return (getRound() == 3 && getRoundWind() > 1) || getRoundWind() > 2; //South 4 or West X
}

//Returns the binomialCoefficient for two numbers. Needed for chance to draw tile calculation. Fails if a faculty of > 134 is needed (should not be the case since there are 134 tiles)
function binomialCoefficient(a, b) {
	var numerator = facts[a];
	var denominator = facts[a - b] * facts[b];
	return numerator / denominator;
} 
