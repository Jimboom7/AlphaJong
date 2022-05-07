//################################
// AI DEFENSE
// Defensive part of the AI
//################################

//Returns danger of tile for all players (from a specific players perspective, see second param) as a number from 0-100+
//Takes into account Genbutsu (Furiten for opponents), Suji, Walls and general knowledge about remaining tiles.
//From the perspective of playerPerspective parameter
function getTileDanger(tile, hand, playerPerspective = 0) {
	var dangerPerPlayer = [0, 0, 0, 0];
	for (var player = 0; player < getNumberOfPlayers(); player++) { //Foreach Player
		if (player == playerPerspective) {
			continue;
		}

		dangerPerPlayer[player] = getDealInChanceForTileAndPlayer(player, tile, playerPerspective);

		if (playerPerspective == 0) { //Multiply with expected deal in value
			dangerPerPlayer[player] *= getExpectedDealInValue(player);
		}

		if (playerPerspective == 0 && typeof hand != 'undefined') {
			dangerPerPlayer[player] += shouldKeepSafeTile(player, hand, dangerPerPlayer[player]);
		}
	}
	return dangerPerPlayer[0] + dangerPerPlayer[1] + dangerPerPlayer[2] + dangerPerPlayer[3];
}

//Return the Danger value for a specific tile and player
function getTileDangerForPlayer(tile, player, playerPerspective = 0) {
	var danger = 0;
	if (getLastTileInDiscard(player, tile) != null) { // Check if tile in discard (Genbutsu)
		return 0;
	}

	danger = getWaitScoreForTileAndPlayer(player, tile, true, playerPerspective == 0); //Suji, Walls and general knowledge about remaining tiles.

	if (danger <= 0) {
		return 0;
	}

	//Honor tiles are often a preferred wait
	if (tile.type == 3) {
		danger *= 1.3;
	}

	//Is Dora? -> 10% more dangerous
	danger *= (1 + (getTileDoraValue(tile) / 10));

	//Is close to Dora? -> 5% more dangerous
	if (isTileCloseToDora(tile)) {
		danger *= 1.05;
	}

	//Is the player doing a flush of that type? -> More dangerous
	var honitsuChance = isDoingHonitsu(player, tile.type);
	var otherHonitsu = Math.max(isDoingHonitsu(player, 0) || isDoingHonitsu(player, 1) || isDoingHonitsu(player, 2));
	if (honitsuChance > 0) {
		danger *= 1 + (honitsuChance / 3);
	}
	else if (otherHonitsu > 0) { //Is the player going for any other flush?
		if (tile.type == 3) {
			danger *= 1 + (otherHonitsu / 3); //Honor tiles are also dangerous
		}
		else {
			danger /= 1 + (otherHonitsu / 3); //Other tiles are less dangerous
		}
	}

	//Is the player doing a tanyao? Inner tiles are more dangerous, outer tiles are less dangerous
	if (tile.type != 3 && tile.index < 9 && tile.index > 1) {
		danger *= 1 + (isDoingTanyao(player) / 10);
	}
	else {
		danger /= 1 + (isDoingTanyao(player) / 10);
	}

	//Does the player have no yaku yet? Yakuhai is likely -> Honor tiles are 10% more dangerous
	if (!hasYaku(player)) {
		if (tile.type == 3 && (tile.index > 4 || tile.index == getSeatWind(player) || tile.index == getRoundWind()) &&
			getNumberOfTilesAvailable(tile.type, tile.index) > 2) {
			danger *= 1.1;
		}
	}

	//Is Tile close to the tile discarded on the riichi turn? -> 10% more dangerous
	if (isPlayerRiichi(player) && riichiTiles[getCorrectPlayerNumber(player)] != null &&
		typeof riichiTiles[getCorrectPlayerNumber(player)] != 'undefined') {
		if (isTileCloseToOtherTile(tile, riichiTiles[getCorrectPlayerNumber(player)])) {
			danger *= 1.1;
		}
	}

	//Is Tile close to an early discard (first row)? -> 10% less dangerous
	discards[player].slice(0, 6).forEach(function (earlyDiscard) {
		if (isTileCloseToOtherTile(tile, earlyDiscard)) {
			danger *= 0.9;
		}
	});

	//Danger is at least 5
	if (danger < 5) {
		danger = 5;
	}

	return danger;
}

//Percentage to deal in with a tile
function getDealInChanceForTileAndPlayer(player, tile, playerPerspective = 0) {
	var total = 0;
	if (playerPerspective == 0) {
		if (typeof totalPossibleWaits.turn == 'undefined' || totalPossibleWaits.turn != tilesLeft) {
			totalPossibleWaits = { turn: tilesLeft, totalWaits: [0, 0, 0, 0] }; // Save it in a global variable to not calculate this expensive step multiple times per turn
			for (let pl = 1; pl < getNumberOfPlayers(); pl++) {
				totalPossibleWaits.totalWaits[pl] = getTotalPossibleWaits(pl);
			}
		}
		total = totalPossibleWaits.totalWaits[player];
	}
	if (playerPerspective != 0) {
		total = getTotalPossibleWaits(player);
	}
	return getTileDangerForPlayer(tile, player, playerPerspective) / total; //Then compare the given tile with it, this is our deal in percentage
}

//Total amount of waits possible
function getTotalPossibleWaits(player) {
	var total = 0;
	for (let i = 1; i <= 9; i++) { // Go through all tiles and check how many combinations there are overall for waits.
		for (let j = 0; j <= 3; j++) {
			if (j == 3 && i >= 8) {
				break;
			}
			total += getTileDangerForPlayer({ index: i, type: j }, player);
		}
	}
	return total;
}

//Returns the expected deal in calue
function getExpectedDealInValue(player) {
	var tenpaiChance = isPlayerTenpai(player);

	var value = getExpectedHandValue(player);

	//DealInValue is probability of player being in tenpai multiplied by the value of the hand
	return tenpaiChance * value;
}

//Calculate the expected Han of the hand
function getExpectedHandValue(player) {
	var handValue = getNumberOfDoras(calls[player]); //Visible Dora (melds)

	handValue += getExpectedDoraInHand(player); //Dora in hidden tiles (hand)

	if (isPlayerRiichi(player)) {
		handValue += 1;
	}

	//Kita (3 player mode only)
	if (getNumberOfPlayers() == 3) {
		handValue += (getNumberOfKitaOfPlayer(player) * getTileDoraValue({ index: 4, type: 3 })) * 1;
	}

	//Yakus (only for open hands)
	handValue += (Math.max(isDoingHonitsu(player, 0) * 2), (isDoingHonitsu(player, 1) * 2), (isDoingHonitsu(player, 2) * 2)) +
		(isDoingToiToi(player) * 2) + (isDoingTanyao(player) * 1) + (isDoingYakuhai(player) * 1);

	//Expect some hidden Yaku when more tiles are unknown. 1.3 Yaku for a fully concealed hand
	handValue += getNumberOfTilesInHand(player) / 10;

	return calculateScore(player, handValue);
}

//How many dora does the player have on average in his hidden tiles?
function getExpectedDoraInHand(player) {
	var uradora = 0;
	if (isPlayerRiichi(player)) { //amount of dora indicators multiplied by chance to hit uradora
		uradora = getUradoraChance();
	}
	return (((getNumberOfTilesInHand(player) + (discards[player].length / 2)) / availableTiles.length) * getNumberOfDoras(availableTiles)) + uradora;
}

//Returns the current Danger level of the table
function getCurrentDangerLevel(forPlayer = 0) { //Most Dangerous Player counts extra
	var i = 1;
	var j = 2;
	var k = 3;
	if (forPlayer == 1) {
		i = 0;
	}
	if (forPlayer == 2) {
		j = 0;
	}
	if (forPlayer == 3) {
		k = 0;
	}
	if (getNumberOfPlayers() == 3) {
		return ((getExpectedDealInValue(i) + getExpectedDealInValue(j) + Math.max(getExpectedDealInValue(i), getExpectedDealInValue(j))) / 3);
	}
	return ((getExpectedDealInValue(i) + getExpectedDealInValue(j) + getExpectedDealInValue(k) + Math.max(getExpectedDealInValue(i), getExpectedDealInValue(j), getExpectedDealInValue(k))) / 4);
}

//Returns the number of turns ago when the tile was most recently discarded
function getMostRecentDiscardDanger(tile, player, includeOthers) {
	var danger = 99;
	for (var i = 0; i < getNumberOfPlayers(); i++) {
		var r = getLastTileInDiscard(i, tile);
		if (player == i && r != null) { //Tile is in own discards
			return 0;
		}
		if (!includeOthers) {
			continue;
		}
		if (r != null && typeof (r.numberOfPlayerHandChanges) == 'undefined') {
			danger = 0;
		}
		else if (r != null && r.numberOfPlayerHandChanges[player] < danger) {
			danger = r.numberOfPlayerHandChanges[player];
		}
	}

	return danger;
}

//Returns the position of a tile in discards
function getLastTileInDiscard(player, tile) {
	for (var i = discards[player].length - 1; i >= 0; i--) {
		if (discards[player][i].index == tile.index && discards[player][i].type == tile.type) {
			return discards[player][i];
		}
	}
	if (wasTileCalledFromOtherPlayers(player, tile)) {
		return 10; //unknown when it was discarded
	}
	return null;
}

//Checks if a tile has been called by someone
function wasTileCalledFromOtherPlayers(player, tile) {
	for (var i = 0; i < getNumberOfPlayers(); i++) {
		if (i == player) { //Skip own melds
			continue;
		}
		for (let t of calls[i]) { //Look through all melds and check where the tile came from
			if (t.from == localPosition2Seat(getCorrectPlayerNumber(player)) && tile.index == t.index && tile.type == t.type) {
				return true;
			}
		}
	}
	return false;
}

//Returns a number from 0 to 1 how likely it is that the player is tenpai
function isPlayerTenpai(player) {
	var numberOfCalls = parseInt(calls[player].length / 3);
	if (isPlayerRiichi(player) || numberOfCalls >= 4) {
		return 1;
	}

	//Based on: https://pathofhouou.blogspot.com/2021/04/analysis-tenpai-chance-by-tedashis-and.html
	//TODO: Include the more specific lists for Dama hands
	var tenpaiChanceList = [[], [], [], []];
	tenpaiChanceList[0] = [0, 0.1, 0.2, 0.5, 1, 1.8, 2.8, 4.2, 5.8, 7.6, 9.5, 11.5, 13.5, 15.5, 17.5, 19.5, 21.7, 23.9, 25, 27];
	tenpaiChanceList[1] = [0.2, 0.9, 2.3, 4.7, 8.3, 12.7, 17.9, 23.5, 29.2, 34.7, 39.7, 43.9, 47.4, 50.3, 52.9, 55.2, 57.1, 59, 61, 63];
	tenpaiChanceList[2] = [0, 5.1, 10.5, 17.2, 24.7, 32.3, 39.5, 46.1, 52, 57.2, 61.5, 65.1, 67.9, 69.9, 71.4, 72.4, 73.3, 74.2, 75, 76];
	tenpaiChanceList[3] = [0, 0, 41.9, 54.1, 63.7, 70.9, 76, 79.9, 83, 85.1, 86.7, 87.9, 88.7, 89.2, 89.5, 89.4, 89.3, 89.2, 89.2, 89.2];

	var numberOfDiscards = discards[player].length;
	if (numberOfDiscards > 20) {
		numberOfDiscards = 20;
	}
	for (var i = 0; i < getNumberOfPlayers(); i++) {
		if (i == player) {
			continue;
		}
		for (let t of calls[i]) { //Look through all melds and check where the tile came from
			if (t.from == localPosition2Seat(getCorrectPlayerNumber(player))) {
				numberOfDiscards++;
			}
		}
	}

	var tenpaiChance = tenpaiChanceList[numberOfCalls][numberOfDiscards] / 100;

	tenpaiChance *= 1 + (isPlayerPushing(player) / 5);

	//Player who is doing Honitsu starts discarding tiles of his own type => probably tenpai
	if ((isDoingHonitsu(player, 0) && discards[player].slice(10).filter(tile => tile.type == 0).length > 0)) {
		tenpaiChance *= 1 + (isDoingHonitsu(player, 0) / 1.5);
	}
	if ((isDoingHonitsu(player, 1) && discards[player].slice(10).filter(tile => tile.type == 1).length > 0)) {
		tenpaiChance *= 1 + (isDoingHonitsu(player, 1) / 1.5);
	}
	if ((isDoingHonitsu(player, 2) && discards[player].slice(10).filter(tile => tile.type == 2).length > 0)) {
		tenpaiChance *= 1 + (isDoingHonitsu(player, 2) / 1.5);
	}

	if (tenpaiChance > 1) {
		tenpaiChance = 1;
	}
	else if (tenpaiChance < 0) {
		tenpaiChance = 0;
	}

	return tenpaiChance;
}

//Returns a number from -1 (fold) to 1 (push).
function isPlayerPushing(player) {
	var lastDiscardSafety = playerDiscardSafetyList[player].slice(-3).filter(v => v >= 0); //Check safety of last three discards. If dangerous: Not folding.

	if (playerDiscardSafetyList[player].length < 3 || lastDiscardSafety.length == 0) {
		return 0;
	}

	var pushValue = -1 + (lastDiscardSafety.reduce((v1, v2) => v1 + (v2 * 20), 0) / lastDiscardSafety.length);
	if (pushValue > 1) {
		pushValue = 1;
	}
	return pushValue;
}

//Is the player doing any of the most common yaku?
function hasYaku(player) {
	return (isDoingHonitsu(player, 0) > 0 || isDoingHonitsu(player, 1) > 0 || isDoingHonitsu(player, 2) > 0 ||
		isDoingToiToi(player) > 0 || isDoingTanyao(player) > 0 || isDoingYakuhai(player) > 0);
}

//Return a confidence between 0 and 1 for how predictable the strategy of another player is (many calls -> very predictable)
function getConfidenceInYakuPrediction(player) {
	var confidence = Math.pow(parseInt(calls[player].length / 3), 2) / 10;
	if (confidence > 1) {
		confidence = 1;
	}
	return confidence;
}

//Returns a value between 0 and 1 for how likely the player could be doing honitsu
function isDoingHonitsu(player, type) {
	if (parseInt(calls[player].length) == 0 || calls[player].some(tile => tile.type != type && tile.type != 3)) { //Calls of different type -> false
		return 0;
	}
	if (parseInt(calls[player].length / 3) == 4) {
		return 1;
	}
	var percentageOfDiscards = discards[player].slice(0, 10).filter(tile => tile.type == type).length / discards[player].slice(0, 10).length;
	if (percentageOfDiscards > 0.2) {
		return 0;
	}
	var confidence = (Math.pow(parseInt(calls[player].length / 3), 2) / 10) - percentageOfDiscards + 0.1;
	if (confidence > 1) {
		confidence = 1;
	}
	return confidence;
}

//Returns a value between 0 and 1 for how likely the player could be doing toitoi
function isDoingToiToi(player) {
	if (parseInt(calls[player].length) > 0 && getSequences(calls[player]).length == 0) { //Only triplets called
		return getConfidenceInYakuPrediction(player) - 0.1;
	}
	return 0;
}

//Returns a value between 0 and 1 for how likely the player could be doing tanyao
function isDoingTanyao(player) {
	if (parseInt(calls[player].length) > 0 && calls[player].filter(tile => tile.type == 3 || tile.index == 1 || tile.index == 9).length == 0 &&
		(discards[player].slice(0, 5).filter(tile => tile.type == 3 || tile.index == 1 || tile.index == 9).length / discards[player].slice(0, 5).length) >= 0.6) { //only inner tiles called and lots of terminal/honor discards
		return getConfidenceInYakuPrediction(player);
	}
	return 0;
}

//Returns how many Yakuhai the player has
function isDoingYakuhai(player) {
	var yakuhai = parseInt(calls[player].filter(tile => tile.type == 3 && (tile.index > 4 || tile.index == getSeatWind(player) || tile.index == roundWind)).length / 3);
	yakuhai += parseInt(calls[player].filter(tile => tile.type == 3 && tile.index == getSeatWind(player) && tile.index == roundWind).length / 3);
	return yakuhai;
}

//Returns a score how likely this tile can form the last triple/pair for a player
//Suji, Walls and general knowledge about remaining tiles.
//If "includeOthers" parameter is set to true it will also check if other players recently discarded relevant tiles
function getWaitScoreForTileAndPlayer(player, tile, includeOthers, useKnowledgeOfOwnHand = true) {
	var tile0 = getNumberOfTilesAvailable(tile.index, tile.type);
	var tile0Public = tile0 + getNumberOfTilesInTileArray(ownHand, tile.index, tile.type);
	if (!useKnowledgeOfOwnHand) {
		tile0 = tile0Public;
	}
	var furitenFactor = getFuritenValue(player, tile, includeOthers);

	if (furitenFactor == 0) {
		return 0;
	}

	//Less priority on Ryanmen and Bridge Wait when player is doing Toitoi
	var toitoiFactor = 1 - (isDoingToiToi(player) / 3);

	var score = 0;

	//Same tile
	score += tile0 * (tile0Public + 1) * 6 * furitenFactor * (2 - toitoiFactor);

	if (getNumberOfTilesInHand(player) == 1 || tile.type == 3) {
		return score;
	}

	var tileL3Public = getNumberOfTilesAvailable(tile.index - 3, tile.type) + getNumberOfTilesInTileArray(ownHand, tile.index - 3, tile.type);
	var tileU3Public = getNumberOfTilesAvailable(tile.index + 3, tile.type) + getNumberOfTilesInTileArray(ownHand, tile.index + 3, tile.type);

	var tileL2 = getNumberOfTilesAvailable(tile.index - 2, tile.type);
	var tileL1 = getNumberOfTilesAvailable(tile.index - 1, tile.type);
	var tileU1 = getNumberOfTilesAvailable(tile.index + 1, tile.type);
	var tileU2 = getNumberOfTilesAvailable(tile.index + 2, tile.type);

	if (!useKnowledgeOfOwnHand) {
		tileL2 += getNumberOfTilesInTileArray(ownHand, tile.index - 2, tile.type);
		tileL1 += getNumberOfTilesInTileArray(ownHand, tile.index - 1, tile.type);
		tileU1 += getNumberOfTilesInTileArray(ownHand, tile.index + 1, tile.type);
		tileU2 += getNumberOfTilesInTileArray(ownHand, tile.index + 2, tile.type);
	}

	var furitenFactorL = getFuritenValue(player, { index: tile.index - 3, type: tile.type }, includeOthers);
	var furitenFactorU = getFuritenValue(player, { index: tile.index + 3, type: tile.type }, includeOthers);

	//Ryanmen Waits
	score += (tileL1 * tileL2) * (tile0Public + tileL3Public) * furitenFactorL * toitoiFactor;
	score += (tileU1 * tileU2) * (tile0Public + tileU3Public) * furitenFactorU * toitoiFactor;

	//Bridge Wait
	score += (tileL1 * tileU1 * tile0Public) * furitenFactor * toitoiFactor;

	if (score > 200) {
		score = 200 + (Math.sqrt(score)); //add "overflow" that is worth less
	}

	return score;
}

//Returns 0 if tile is 100% furiten, 1 if not. Value between 0-1 is returned if furiten tile was not called some turns ago.
function getFuritenValue(player, tile, includeOthers) {
	var danger = getMostRecentDiscardDanger(tile, player, includeOthers);
	if (danger == 0) {
		return 0;
	}
	else if (danger == 1) {
		if (calls[player].length > 0) {
			return 0.5;
		}
		return 0.95;
	}
	else if (danger == 2) {
		if (calls[player].length > 0) {
			return 0.8;
		}
	}
	return 1;
}

//Sets tile safeties for discards
function updateDiscardedTilesSafety() {
	for (var k = 1; k < getNumberOfPlayers(); k++) { //For all other players
		for (var i = 0; i < getNumberOfPlayers(); i++) { //For all discard ponds
			for (var j = 0; j < discards[i].length; j++) { //For every tile in it
				if (typeof (discards[i][j].numberOfPlayerHandChanges) == 'undefined') {
					discards[i][j].numberOfPlayerHandChanges = [0, 0, 0, 0];
				}
				if (hasPlayerHandChanged(k)) {
					if (j == discards[i].length - 1 && k < i && (k <= seat2LocalPosition(getCurrentPlayer()) || seat2LocalPosition(getCurrentPlayer()) == 0)) { //Ignore tiles by players after hand change
						continue;
					}
					discards[i][j].numberOfPlayerHandChanges[k]++;
				}
			}
		}
		rememberPlayerHand(k);
	}
}

//Pretty simple (all 0), but should work in case of crash -> count intelligently upwards
function initialDiscardedTilesSafety() {
	for (var k = 1; k < getNumberOfPlayers(); k++) { //For all other players
		for (var i = 0; i < getNumberOfPlayers(); i++) { //For all discard ponds
			for (var j = 0; j < discards[i].length; j++) { //For every tile in it
				if (typeof (discards[i][j].numberOfPlayerHandChanges) == 'undefined') {
					discards[i][j].numberOfPlayerHandChanges = [0, 0, 0, 0];
				}
				var bonus = 0;
				if (k < i && (k <= seat2LocalPosition(getCurrentPlayer()) || seat2LocalPosition(getCurrentPlayer()) == 0)) {
					bonus = 1;
				}
				discards[i][j].numberOfPlayerHandChanges[k] = discards[i].length - j - bonus;
			}
		}
	}
}

//Returns a value which indicates how important it is to keep the given tile against another player (Sakigiri something else)
function shouldKeepSafeTile(player, hand, danger) {
	if (discards[player].length < 3) { // Not many discards yet (very early) => ignore Sakigiri
		return 0;
	}
	if (getExpectedDealInValue(player) > 100) { // Obviously don't sakigiri when the player could already be in tenpai
		return 0;
	}
	if (danger > 1) { // Tile is not safe, has no value for sakigiri
		return 0;
	}

	var safeTiles = 0;
	for (let tile of hand) { // How many safe tiles do we currently have?
		if (getLastTileInDiscard(player, tile) != null || getWaitScoreForTileAndPlayer(player, tile, false) < 20) {
			safeTiles++;
		}
	}

	var sakigiri = (2 - safeTiles) * (SAKIGIRI * 2);
	if (sakigiri < 0) { // More than 2 safe tiles: Sakigiri not necessary
		return 0;
	}
	if (getSeatWind(player) == 1) { // Player is dealer
		sakigiri *= 1.5;
	}
	return sakigiri;
}

//Check if the tile is close to another tile
function isTileCloseToOtherTile(tile, otherTile) {
	if (tile.type != 3 && tile.type == otherTile.type) {
		return tile.index >= otherTile.index - 3 && tile.index <= otherTile.index + 3;
	}
}

//Check if the tile is close to dora
function isTileCloseToDora(tile) {
	for (let d of dora) {
		var doraIndex = getHigherTileIndex(d);
		if (tile.type == 3 && d.type == 3 && tile.index == doraIndex) {
			return true;
		}
		if (tile.type != 3 && tile.type == d.type && tile.index >= doraIndex - 2 && tile.index <= doraIndex + 2) {
			return true;
		}
	}
	return false;
}