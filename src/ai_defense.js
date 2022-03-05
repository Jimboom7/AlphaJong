//################################
// AI DEFENSE
// Defensive part of the AI
//################################

//Get Dangerlevels for all tiles in hand
function getHandDanger(hand) {
	var handDanger = [];
	for (let tile of hand) {
		var tileDanger = getTileDanger(tile);
		handDanger.push({ tile: tile, danger: tileDanger });
	}
	return handDanger;
}

//Returns danger of tile for all players as a number from 0-100
//Takes into account Genbutsu (Furiten for opponents), Suji, Walls and general knowledge about remaining tiles.
function getTileDanger(tile) {
	var dangerPerPlayer = [0, 100, 100, 100];
	if (getNumberOfPlayers() == 3) {
		dangerPerPlayer = [0, 100, 100];
	}
	for (var i = 1; i < getNumberOfPlayers(); i++) { //Foreach Player
		if (getLastTileInDiscard(i, tile) != null) { // Check if tile in discard (Genbutsu)
			dangerPerPlayer[i] = 0;
			continue;
		}

		dangerPerPlayer[i] = getWaitScoreForTileAndPlayer(i, tile); //Suji, Walls and general knowledge about remaining tiles.

		if (dangerPerPlayer[i] <= 0) {
			continue;
		}

		//Is Dora? -> 12,5% more dangerous
		dangerPerPlayer[i] *= (1 + (getTileDoraValue(tile) / 8));

		//Is the player going for a flush of that type? -> 30% more dangerous
		if (isGoingForFlush(i, tile.type)) {
			dangerPerPlayer[i] *= 1.3;
		}
		else if (isGoingForFlush(i, 0) || isGoingForFlush(i, 1) || isGoingForFlush(i, 2)) { //Is the player going for any other flush?
			if (tile.type == 3) {
				dangerPerPlayer[i] *= 1.2; //Honor tiles are also dangerous
			}
			else {
				dangerPerPlayer[i] /= 1.2; //Other tiles are less dangerous
			}
		}

		//Danger is at least 5
		if (dangerPerPlayer[i] < 5) {
			dangerPerPlayer[i] = 5;
		}

		//Multiply with Danger Level
		dangerPerPlayer[i] *= getPlayerDangerLevel(i) / 100;
	}

	var dangerNumber = ((dangerPerPlayer[1] + dangerPerPlayer[2] + dangerPerPlayer[3] + Math.max.apply(null, dangerPerPlayer)) / 4); //Most dangerous player counts twice

	if (getNumberOfPlayers() == 3) {
		dangerNumber = ((dangerPerPlayer[1] + dangerPerPlayer[2] + Math.max.apply(null, dangerPerPlayer)) / 4); //Most dangerous player counts twice
	}
	return dangerNumber;
}

//Returns danger level for players. 100: Tenpai (Riichi)
function getPlayerDangerLevel(player) {
	if (isDebug()) {
		return TEST_DANGER_LEVEL;
	}
	if (getPlayerLinkState(player) == 0) { //Disconnected -> Safe
		return 0;
	}

	if (getNumberOfPlayerHand(player) < 13) { //Some Calls
		var dangerLevel = parseInt(190 - (getNumberOfPlayerHand(player) * 8) - (tilesLeft * 1.75));
	}
	else {
		dangerLevel = 15 - tilesLeft; //Full hand without Riichi -> Nearly always safe
	}


	if (dangerLevel > 80) {
		dangerLevel = 80;
	}
	else if (isPlayerRiichi(player)) { //Riichi
		dangerLevel = 100;
	}
	else if (dangerLevel < 0) {
		return 0;
	}

	//Account for possible values of hands.

	if (getSeatWind(player) == 1) { //Is Dealer
		dangerLevel += 10;
	}

	dangerLevel += getNumberOfDoras(calls[player]) * 10;

	if (isGoingForFlush(player, 0) || isGoingForFlush(player, 1) || isGoingForFlush(player, 2)) {
		dangerLevel += 10;
	}

	if (tilesLeft > 50) {
		dangerLevel *= 0.5 + ((70 - tilesLeft) / 40); //Danger scales over the first few turns.
	}

	return dangerLevel;
}

//Returns the current Danger level of the table
function getCurrentDangerLevel() { //Most Dangerous Player counts extra
	if (getNumberOfPlayers() == 3) {
		return ((getPlayerDangerLevel(1) + getPlayerDangerLevel(2) + Math.max(getPlayerDangerLevel(1), getPlayerDangerLevel(2))) / 3);
	}
	return ((getPlayerDangerLevel(1) + getPlayerDangerLevel(2) + getPlayerDangerLevel(3) + Math.max(getPlayerDangerLevel(1), getPlayerDangerLevel(2), getPlayerDangerLevel(3))) / 4);
}

//Returns the number of turns ago when the tile was most recently discarded
function getMostRecentDiscardDanger(tile, player) {
	var danger = 99;
	for (var i = 0; i < getNumberOfPlayers(); i++) {
		var r = getLastTileInDiscard(i, tile);
		if (player == i && r != null) { //Tile is in own discards
			return 0;
		}
		if (wasTileCalledFromOtherPlayers(player, tile)) { //The tile was discarded and called by someone else
			return 0;
		}
		if (r != null && r.numberOfPlayerHandChanges[player] < danger) {
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

//Returns the safety of a tile
//Based on the tile danger, but with exponential growth
function getTileSafety(tile) {
	if (typeof tile == 'undefined') {
		return 1;
	}
	return 1 - (Math.pow(getTileDanger(tile) / 10, 2) / 100);
}

//Returns true if the player is going for a flush of a given type
function isGoingForFlush(player, type) {
	if (calls[player].length <= 3 || calls[player].some(tile => tile.type != type && tile.type != 3)) { //Not enough or different calls -> false
		return false;
	}
	if (discards[player].filter(tile => tile.type == type).length >= (discards[player].length / 6)) { //Many discards of that type -> false
		return false;
	}
	return true;
}

//Returns the Wait Score for a Tile (Possible that anyone is waiting for this tile)
function getWaitScoreForTile(tile) {
	var score = 0;
	for (var i = 1; i < getNumberOfPlayers(); i++) {
		score += getWaitScoreForTileAndPlayer(i, tile);
	}
	return score / 3;
}

//Returns a score how likely this tile can form the last triple/pair for a player
//Suji, Walls and general knowledge about remaining tiles.
function getWaitScoreForTileAndPlayer(player, tile) {
	var tile0 = getNumberOfTilesAvailable(tile.index, tile.type);
	var tile0Public = tile0 + getNumberOfTilesInTileArray(ownHand, tile.index, tile.type);
	var factor = getFuritenValue(player, tile);

	var score = 0;

	//Same tile
	score += tile0 * (tile0Public + 1) * 5;

	if (getNumberOfPlayerHand(player) == 1 || tile.type == 3) {
		return score * factor; //Return normalized result
	}

	var tileL3 = getNumberOfTilesAvailable(tile.index - 3, tile.type);
	var tileL3Public = tileL3 + getNumberOfTilesInTileArray(ownHand, tile.index - 3, tile.type);
	var factorL = getFuritenValue(player, { index: tile.index - 3, type: tile.type });

	var tileL2 = getNumberOfTilesAvailable(tile.index - 2, tile.type);
	var tileL1 = getNumberOfTilesAvailable(tile.index - 1, tile.type);
	var tileU1 = getNumberOfTilesAvailable(tile.index + 1, tile.type);
	var tileU2 = getNumberOfTilesAvailable(tile.index + 2, tile.type);
	var tileU3 = getNumberOfTilesAvailable(tile.index + 3, tile.type);
	var tileU3Public = tileU3 + getNumberOfTilesInTileArray(ownHand, tile.index + 3, tile.type);
	var factorU = getFuritenValue(player, { index: tile.index + 3, type: tile.type });

	//Ryanmen Waits
	score += ((tileL1 * tileL2) * (tile0Public + tileL3Public) * factorL) * 1.2; //Ryanmen waits are most common -> scale them with 1.2
	score += ((tileU1 * tileU2) * (tile0Public + tileU3Public) * factorU) * 1.2;

	//Bridge Wait
	score += (tileL1 * tileU1 * tile0Public) * 0.8; //Bridge waits are not so common -> scale them with 0.8

	score *= factor;

	if (score > 180) {
		score = 180 + ((score - 180) / 4); //add "overflow" that is worth less
	}

	score /= 1.6; //Divide by this number to normalize result (more or less)

	return score;
}

//Returns 0 if tile is 100% furiten, 1 if not. Value between 0-1 is returned if furiten tile was not called some turns ago.
function getFuritenValue(player, tile) {
	var danger = getMostRecentDiscardDanger(tile, player);
	if (danger == 0) {
		return 0;
	}
	else if (danger == 1) {
		if (calls[player].length > 0) {
			return 0.3;
		}
		return 0.9;
	}
	else if (danger == 2) {
		if (calls[player].length > 0) {
			return 0.8;
		}
		return 0.95;
	}
	return 1;
}

//Sets tile safeties for discards
function updateDiscardedTilesSafety() {
	for (var k = 1; k < getNumberOfPlayers(); k++) { //For all other players
		for (var i = 0; i < getNumberOfPlayers(); i++) { //For all discard ponds
			for (var j = 0; j < discards[i].length; j++) { //For every tile in it
				if (typeof (discards[i][j].numberOfPlayerHandChanges) == "undefined") {
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
				if (typeof (discards[i][j].numberOfPlayerHandChanges) == "undefined") {
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