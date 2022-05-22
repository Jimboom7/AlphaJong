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

function isSameTile(tile1, tile2, checkDora = false) {
	if (typeof tile1 == 'undefined' || typeof tile2 == 'undefined') {
		return false;
	}
	if (checkDora) {
		return tile1.index == tile2.index && tile1.type == tile2.type && tile1.dora == tile2.dora;
	}
	return tile1.index == tile2.index && tile1.type == tile2.type;
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
	tiles = sortTiles(tiles);
	var doubles = [];
	for (let i = 0; i < tiles.length - 1; i++) {
		if (tiles[i].type == tiles[i + 1].type && (
			tiles[i].index == tiles[i + 1].index ||
			(tiles[i].type != 3 &&
				tiles[i].index + 2 >= tiles[i + 1].index))) {
			doubles.push(tiles[i]);
			doubles.push(tiles[i + 1]);
			i++;
		}
	}
	return doubles;
}

//Return all triplets/3-sequences and pairs as a tile array
function getTriplesAndPairs(tiles) {
	var sequences = getSequences(tiles);
	var triplets = getTriplets(tiles);
	var pairs = getPairs(tiles);
	return getBestCombinationOfTiles(tiles, sequences.concat(triplets).concat(pairs), { triples: [], pairs: [], shanten: 8 });
}

//Return all triplets/3-tile-sequences as a tile array
function getTriples(tiles) {
	var sequences = getSequences(tiles);
	var triplets = getTriplets(tiles);
	return getBestCombinationOfTiles(tiles, sequences.concat(triplets), { triples: [], pairs: [], shanten: 8 }).triples;
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
	return getBestCombinationOfTiles(inputHand, getSequences(inputHand), { triples: [], pairs: [], shanten: 8 }).triples;
}

//Check if there is already a red dora tile in the tiles array.
//More or less a workaround for a problem with the getBestCombinationOfTiles function...
function pushTileAndCheckDora(tiles, arrayToPush, tile) {
	if (tile.dora && tiles.some(t => t.type == tile.type && t.dora)) {
		var nonDoraTile = { ...tile };
		nonDoraTile.dora = false;
		nonDoraTile.doraValue = getTileDoraValue(nonDoraTile);
		arrayToPush.push(nonDoraTile);
		return nonDoraTile;
	}
	arrayToPush.push(tile);
	return tile;
}

//Return the best combination of 3-tile Sequences, Triplets and pairs in array of tiles
//Recursive Function, weird code that can probably be optimized
function getBestCombinationOfTiles(inputTiles, possibleCombinations, chosenCombinations) {
	var originalC = { triples: [...chosenCombinations.triples], pairs: [...chosenCombinations.pairs], shanten: chosenCombinations.shanten };
	for (var i = 0; i < possibleCombinations.length; i++) {
		var cs = { triples: [...originalC.triples], pairs: [...originalC.pairs], shanten: originalC.shanten };
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
			var tt = pushTileAndCheckDora(cs.pairs.concat(cs.triples), cs.triples, tiles.tile1);
			hand = removeTilesFromTileArray(hand, [tt]);
			tt = pushTileAndCheckDora(cs.pairs.concat(cs.triples), cs.triples, tiles.tile2);
			hand = removeTilesFromTileArray(hand, [tt]);
			tt = pushTileAndCheckDora(cs.pairs.concat(cs.triples), cs.triples, tiles.tile3);
			hand = removeTilesFromTileArray(hand, [tt]);
		}
		else {
			var tt = pushTileAndCheckDora(cs.pairs.concat(cs.triples), cs.pairs, tiles.tile1);
			hand = removeTilesFromTileArray(hand, [tt]);
			tt = pushTileAndCheckDora(cs.pairs.concat(cs.triples), cs.pairs, tiles.tile2);
			hand = removeTilesFromTileArray(hand, [tt]);
		}

		if (PERFORMANCE_MODE - timeSave <= 3) {
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
		else {
			if (cs.triples.length >= chosenCombinations.triples.length) {
				var doubles = getDoubles(hand); //This is costly, so only do it when performance mode is at maximum
				cs.shanten = calculateShanten(parseInt(cs.triples.length / 3), parseInt(cs.pairs.length / 2), parseInt(doubles.length / 2));
			}
			else {
				cs.shanten = 8;
			}

			var anotherChoice = getBestCombinationOfTiles(hand, possibleCombinations.slice(i + 1), cs);
			if (anotherChoice.shanten < chosenCombinations.shanten || anotherChoice.shanten == chosenCombinations.shanten && (anotherChoice.triples.length > chosenCombinations.triples.length ||
				(anotherChoice.triples.length == chosenCombinations.triples.length &&
					anotherChoice.pairs.length > chosenCombinations.pairs.length) ||
				(anotherChoice.triples.length == chosenCombinations.triples.length &&
					anotherChoice.pairs.length == chosenCombinations.pairs.length &&
					getNumberOfDoras(anotherChoice.triples.concat(anotherChoice.pairs)) > getNumberOfDoras(chosenCombinations.triples.concat(chosenCombinations.pairs))))) {
				chosenCombinations = anotherChoice;
			}
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
	if (index < 1 || index > 9 || type < 0 || type > 3 || (type == 3 && index > 7)) {
		return 0;
	}
	if (getNumberOfPlayers() == 3 && (index > 1 && index < 9 && type == 1)) {
		return 0;
	}

	return 4 - visibleTiles.filter(tile => tile.index == index && tile.type == type).length;
}

//Return if a tile is furiten
function isTileFuriten(index, type) {
	for (var i = 1; i < getNumberOfPlayers(); i++) { //Check if melds from other player contain discarded tiles of player 0
		if (calls[i].some(tile => tile.index == index && tile.type == type && tile.from == localPosition2Seat(0))) {
			return true;
		}
	}
	return discards[0].some(tile => tile.index == index && tile.type == type);
}

//Return number of specific non furiten tiles available
function getNumberOfNonFuritenTilesAvailable(index, type) {
	if (isTileFuriten(index, type)) {
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
	visibleTiles = visibleTiles.filter(tile => typeof tile != 'undefined');
	availableTiles = [];
	for (var i = 0; i <= 3; i++) {
		for (var j = 1; j <= 9; j++) {
			if (i == 3 && j == 8) {
				break;
			}
			for (var k = 1; k <= getNumberOfTilesAvailable(j, i); k++) {
				var isRed = (j == 5 && i != 3 && visibleTiles.concat(availableTiles).filter(tile => tile.type == i && tile.dora).length == 0) ? true : false;
				availableTiles.push({
					index: j,
					type: i,
					dora: isRed,
					doraValue: getTileDoraValue({ index: j, type: i, dora: isRed })
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

	if (getNumberOfPlayers() == 3) {
		if (tile.type == 3 && tile.index == 4) { //North Tiles
			dr = 1;
		}
	}

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
	if (getNumberOfPlayers() == 3 && tile.index == 1 && tile.type == 1) {
		return 9; // 3 player mode: 1 man indicator means 9 man is dora
	}
	return tile.index == 9 ? 1 : tile.index + 1;
}

//Returns true if DEBUG flag is set
function isDebug() {
	return typeof DEBUG != 'undefined';
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

function getUradoraChance() {
	if (getNumberOfPlayers() == 4) {
		return dora.length * 0.4;
	}
	else {
		return dora.length * 0.5;
	}
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

		if (tile.index - 1 >= 1) {
			pushTileIfNotExists(tiles, tile.index - 1, tile.type);
		}
		if (tile.index + 1 <= 9) {
			pushTileIfNotExists(tiles, tile.index + 1, tile.type);
		}

		if (PERFORMANCE_MODE - timeSave <= 2) {
			continue;
		}
		if (tile.index - 2 >= 1) {
			pushTileIfNotExists(tiles, tile.index - 2, tile.type);
		}
		if (tile.index + 2 <= 9) {
			pushTileIfNotExists(tiles, tile.index + 2, tile.type);
		}
	}
	return tiles;
}

// Returns Tile[], where all are terminal/honors.
function getAllTerminalHonorFromHand(hand) {
	return hand.filter(tile => isTerminalOrHonor(tile));
}

//Honor tile or index 1/9
function isTerminalOrHonor(tile) {
	// Honor tiles
	if (tile.type == 3) {
		return true;
	}

	// 1 or 9.
	if (tile.index == 1 || tile.index == 9) {
		return true;
	}

	return false;
}

// Returns a number how "good" the wait is. An average wait is 1, a bad wait (like a middle tile) is lower, a good wait (like an honor tile) is higher.
function getWaitQuality(tile) {
	var quality = 1.3 - (getDealInChanceForTileAndPlayer(0, tile, 1) * 5);
	quality = quality < 0.7 ? 0.7 : quality;
	return quality;
}

//Calculate the shanten number. Based on this: https://www.youtube.com/watch?v=69Xhu-OzwHM
//Fast and accurate, but original hand needs to have 14 or more tiles.
function calculateShanten(triples, pairs, doubles) {
	if (isWinningHand(triples, pairs)) {
		return -1;
	}
	if ((triples * 3) + (pairs * 2) + (doubles * 2) > 14) {
		doubles = parseInt((13 - ((triples * 3) + (pairs * 2))) / 2);
	}
	var shanten = 8 - (2 * triples) - (pairs + doubles);
	if (triples + pairs + doubles >= 5 && pairs == 0) {
		shanten++;
	}
	if (triples + pairs + doubles >= 6) {
		shanten += triples + pairs + doubles - 5;
	}
	if (shanten < 0) {
		return 0;
	}
	return shanten;
}

// Calculate Score for given han and fu. For higher han values the score is "fluid" to better account for situations where the exact han value is unknown
// (like when an opponent has around 5.5 han => 10k)
function calculateScore(player, han, fu = 30) {
	var score = (fu * Math.pow(2, 2 + han) * 4);

	if (han > 4) {
		score = 8000;
	}

	if (han > 5) {
		score = 8000 + ((han - 5) * 4000);
	}
	if (han > 6) {
		score = 12000 + ((han - 6) * 2000);
	}
	if (han > 8) {
		score = 16000 + ((han - 8) * 2666);
	}
	if (han > 11) {
		score = 24000 + ((han - 11) * 4000);
	}
	if (han >= 13) {
		score = 32000;
	}

	if (getSeatWind(player) == 1) { //Is Dealer
		score *= 1.5;
	}

	return score;
}

//Calculate the Fu Value for given parameters. Not 100% accurate, but good enough
function calculateFu(triples, openTiles, pair, waitTiles, winningTile, ron = true) {
	var fu = 20;

	var sequences = getSequences(triples);
	var closedTriplets = getTriplets(triples);
	var openTriplets = getTriplets(openTiles);

	var kans = removeTilesFromTileArray(openTiles, getTriples(openTiles));

	closedTriplets.forEach(function (t) {
		if (isTerminalOrHonor(t.tile1)) {
			if (!isSameTile(t.tile1, winningTile)) {
				fu += 8;
			}
			else { //Ron on that tile: counts as open
				fu += 4;
			}
		}
		else {
			if (!isSameTile(t.tile1, winningTile)) {
				fu += 4;
			}
			else { //Ron on that tile: counts as open
				fu += 2;
			}
		}
	});

	openTriplets.forEach(function (t) {
		if (isTerminalOrHonor(t.tile1)) {
			fu += 4;
		}
		else {
			fu += 2;
		}
	});

	//Kans: Add to existing fu of pon
	kans.forEach(function (tile) {
		if (openTiles.filter(t => isSameTile(t, tile) && t.from != localPosition2Seat(0)).length > 0) { //Is open
			if (isTerminalOrHonor(tile)) {
				fu += 12;
			}
			else {
				fu += 6;
			}
		}
		else { //Closed Kans
			if (isTerminalOrHonor(tile)) {
				fu += 28;
			}
			else {
				fu += 14;
			}
		}
	});


	if (typeof pair[0] != 'undefined' && isValueTile(pair[0])) {
		fu += 2;
		if (pair[0].index == seatWind && seatWind == roundWind) {
			fu += 2;
		}
	}

	if (fu == 20 && (sequences.findIndex(function (t) { //Is there a way to interpret the wait as ryanmen when at 20 fu? -> dont add fu
		return (isSameTile(t.tile1, winningTile) && t.tile3.index < 9) || (isSameTile(t.tile3, winningTile) && t.tile1.index > 1);
	}) >= 0)) {
		fu += 0;
	} //if we are at more than 20 fu: check if the wait can be interpreted in other ways to add more fu
	else if ((waitTiles.length != 2 || waitTiles[0].type != waitTiles[1].type || Math.abs(waitTiles[0].index - waitTiles[1].index) != 1)) {
		if (closedTriplets.findIndex(function (t) { return isSameTile(t.tile1, winningTile); }) < 0) { // 0 fu for shanpon
			fu += 2;
		}
	}

	if (ron && isClosed) {
		fu += 10;
	}

	return Math.ceil(fu / 10) * 10;
}

//Is the tile a dragon or valuable wind?
function isValueTile(tile) {
	return tile.type == 3 && (tile.index > 4 || tile.index == seatWind || tile.index == roundWind);
}

//Return a danger value which is the threshold for folding (danger higher than this value -> fold)
function getFoldThreshold(tilePrio, hand) {
	var handScore = tilePrio.score.open * 1.3; // Raise this value a bit so open hands dont get folded too quickly
	if (isClosed) {
		handScore = tilePrio.score.riichi;
	}

	var waits = tilePrio.waits;

	// Formulas are based on this table: https://docs.google.com/spreadsheets/d/172LFySNLUtboZUiDguf8I3QpmFT-TApUfjOs5iRy3os/edit#gid=212618921
	// TODO: Maybe switch to this: https://riichi-mahjong.com/2020/01/28/mahjong-strategy-push-or-fold-4-maximizing-game-ev/
	if (tilePrio.shanten == 0) {
		var foldValue = waits * handScore / 38;
		if (tilesLeft < 8) { //Try to avoid no ten penalty
			foldValue += 200 - (parseInt(tilesLeft / 4) * 100);
		}
	}
	else if (tilePrio.shanten == 1 && strategy == STRATEGIES.GENERAL) {
		waits = waits < 0.4 ? waits = 0.4 : waits;
		waits = waits > 2 ? waits = 2 : waits;
		var foldValue = waits * handScore / 45;
	}
	else {
		if (getCurrentDangerLevel() > 3000 && strategy == STRATEGIES.GENERAL) {
			return 0;
		}
		var foldValue = (((6 - (tilePrio.shanten - tilePrio.efficiency)) * 2000) + handScore) / 500;
	}

	if (isLastGame()) { //Fold earlier when first/later when last in last game
		if (getDistanceToLast() > 0) {
			foldValue *= 1.3; //Last Place -> Later Fold
		}
		else if (getDistanceToFirst() < 0) {
			var dist = (getDistanceToFirst() / 30000) > -0.5 ? getDistanceToFirst() / 30000 : -0.5;
			foldValue *= 1 + dist; //First Place -> Easier Fold
		}
	}

	foldValue *= 1 - (((getWallSize() / 2) - tilesLeft) / (getWallSize() * 2)); // up to 25% more/less fold when early/lategame.

	foldValue *= seatWind == 1 ? 1.2 : 1; //Push more as dealer (it's already in the handScore, but because of Tsumo Malus pushing is even better)

	var safeTiles = 0;
	for (let tile of hand) { // How many safe tiles do we currently have?
		if (getTileDanger(tile) < 20) {
			safeTiles++;
		}
		if (safeTiles == 2) {
			break;
		}
	}
	foldValue *= 1 + (0.5 - (safeTiles / 4)); // 25% less likely to fold when only 1 safetile, or 50% when 0 safetiles

	foldValue *= 2 - (hand.length / 14); // Less likely to fold when fewer tiles in hand (harder to defend)

	foldValue /= SAFETY;

	foldValue = foldValue < 0 ? 0 : foldValue;

	return Number(foldValue).toFixed(2);
}

//Return true if danger is too high in relation to the value of the hand
function shouldFold(tile, highestPrio = false) {
	if (tile.shanten > 0 && tile.shanten * 4 >= tilesLeft) {
		if (highestPrio) {
			log("Hand is too far from tenpai before end of game. Fold!");
			strategy = STRATEGIES.FOLD;
			strategyAllowsCalls = false;
		}
		return true;
	}

	var foldThreshold = getFoldThreshold(tile, ownHand);
	if (highestPrio) {
		log("Would fold this hand above " + foldThreshold + " danger for " + getTileName(tile.tile) + " discard.");
	}

	if (tile.danger > foldThreshold) {
		if (highestPrio) {
			log("Tile Danger " + Number(tile.danger).toFixed(2) + " of " + getTileName(tile.tile, false) + " is too dangerous.");
			strategyAllowsCalls = false; //Don't set the strategy to full fold, but prevent calls
		}
		return true;
	}
	return false;
}

//Decide whether to call Riichi
//Based on: https://mahjong.guide/2018/01/28/mahjong-fundamentals-5-riichi/
function shouldRiichi(tilePrio) {
	var badWait = tilePrio.waits < 6 - RIICHI;
	var lotsOfDoraIndicators = tilePrio.dora.length >= 3;

	//Chiitoitsu
	if (strategy == STRATEGIES.CHIITOITSU) {
		badWait = tilePrio.waits < 3 - RIICHI;
	}

	//Thirteen Orphans
	if (strategy == STRATEGIES.THIRTEEN_ORPHANS) {
		log("Decline Riichi because of Thirteen Orphan strategy.");
		return false;
	}

	//Close to end of game
	if (tilesLeft <= 7 - RIICHI) {
		log("Decline Riichi because close to end of game.");
		return false;
	}

	//No waits
	if (tilePrio.waits < 1) {
		log("Decline Riichi because of no waits.");
		return false;
	}

	// Last Place (in last game) and Riichi is enough to get third
	if (isLastGame() && getDistanceToLast() > 0 && getDistanceToLast() < tilePrio.score.riichi) {
		log("Accept Riichi because of last place in last game.");
		return true;
	}

	// Decline if last game and first place (either with 10000 points advantage or with a closed yaku)
	if (isLastGame() && (getDistanceToFirst() < -10000 || (tilePrio.yaku.closed >= 1 && getDistanceToFirst() < 0))) {
		log("Decline Riichi because of huge lead in last game.");
		return false;
	}

	// Not Dealer & bad Wait & Riichi is only yaku
	if (seatWind != 1 && badWait && tilePrio.score.riichi < 4000 - (RIICHI * 1000) && !lotsOfDoraIndicators) {
		log("Decline Riichi because of worthless hand, bad waits and not dealer.");
		return false;
	}

	// High Danger and hand not worth much or bad wait
	if (getCurrentDangerLevel() > 5000 && (tilePrio.score.riichi < 5000 - (RIICHI * 1000) || badWait)) {
		log("Decline Riichi because of worthless hand and high danger.");
		return false;
	}

	// Hand already has enough yaku and high value (Around 6000+ depending on the wait)
	if (tilePrio.yaku.closed >= 1 && tilePrio.score.closed > 4000 + (RIICHI * 1000) + (tilePrio.waits * 500)) {
		log("Decline Riichi because of high value hand with enough yaku.");
		return false;
	}

	// Hand already has high value and no yaku
	if (tilePrio.yaku.closed < 0.9 && tilePrio.score.riichi > 5000 - (RIICHI * 1000)) {
		log("Accept Riichi because of high value hand without yaku.");
		return true;
	}

	// Number of Kans(Dora Indicators) -> more are higher chance for uradora
	if (lotsOfDoraIndicators) {
		log("Accept Riichi because of multiple dora indicators.");
		return true;
	}

	// Don't Riichi when: Last round with bad waits & would lose place with -1000
	if (isLastGame() && badWait && ((getDistanceToPlayer(1) >= -1000 && getDistanceToPlayer(1) <= 0) ||
		(getDistanceToPlayer(2) >= -1000 && getDistanceToPlayer(2) <= 0) ||
		(getNumberOfPlayers() > 3 && getDistanceToPlayer(3) >= -1000 && getDistanceToPlayer(3) <= 0))) {
		log("Decline Riichi because distance to next player is < 1000 in last game.");
		return false;
	}

	// Default: Just do it.
	log("Accept Riichi by default.");
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

//Positive: Other player is in front of you
function getDistanceToPlayer(player) {
	if (getNumberOfPlayers() == 3 && player == 3) {
		return 0;
	}
	return getPlayerScore(player) - getPlayerScore(0);
}

//Check if "All Last"
function isLastGame() {
	if (isEastRound()) {
		return getRound() == 3 || getRoundWind() > 1; //East 4 or South X
	}
	return (getRound() == 2 && getRoundWind() > 1) || getRoundWind() > 2; //South 3 or West X
}

//Check if Hand is complete
function isWinningHand(numberOfTriples, numberOfPairs) {
	if (strategy == STRATEGIES.CHIITOITSU) {
		return numberOfPairs == 7;
	}
	return numberOfTriples == 4 && numberOfPairs == 1;
}

//Return the number of tiles in the wall at the start of the round
function getWallSize() {
	if (getNumberOfPlayers() == 3) {
		return 55;
	}
	else {
		return 70;
	}
}

function getCallNameByType(type) {
	switch (type) {
		case 1: return "discard";
		case 2: return "chi";
		case 3: return "pon";
		case 4: return "kan(ankan)";
		case 5: return "kan(daiminkan)";
		case 6: return "kan(shouminkan)";
		case 7: return "riichi";
		case 8: return "tsumo";
		case 9: return "ron";
		case 10: return "kyuushu kyuuhai";
		case 11: return "kita";
		default: return type;
	}
}

function getTileEmoji(tileType, tileIdx, dora) {
	if (dora) {
		tileIdx = 0;
	}
	return tileEmojiList[tileType][tileIdx];
}

//Get Emoji str by tile name
function getTileEmojiByName(name) {
	let tile = getTileFromString(name);
	return getTileEmoji(tile.type, tile.index, tile.dora);
}