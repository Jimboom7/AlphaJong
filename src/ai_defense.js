//################################
// AI DEFENSE
// Defensive part of the AI
//################################

//Get Dangerlevels for all tiles in hand
function getHandDanger(hand) {
	var handDanger = [];
	for(var i = 0; i < hand.length; i++) {
		var tileDanger = getTileDanger(hand[i]);
		handDanger.push({tile : hand[i], danger : tileDanger});
	}
	return handDanger;
}

//Returns danger of tile for all players as a number from 0-100
function getTileDanger(tile) {
	var dangerPerPlayer = [0,100,100,100];
	for(var i = 1; i < 4; i++) { //Foreach Player
		var dangerLevel = getPlayerDangerLevel(i);
		if(getLastTileInDiscard(i, tile) != null) { // Check if tile in discard
			dangerPerPlayer[i] = 0;
			continue;
		}
		
		if(tile.type == 3) { // Honor tiles
			var availableHonors = availableTiles.filter(t => t.index == tile.index && t.type == tile.type).length;
			if(availableHonors == 0) {
				dangerPerPlayer[i] = 0;
				continue;
			}
			else if(availableHonors == 1) {
				dangerPerPlayer[i] = 10;
			}
			else if(availableHonors == 2) {
				dangerPerPlayer[i] = 60;
			}
			else if(availableHonors == 3) {
				dangerPerPlayer[i] = 90;
			}
		}
		else if(getNumberOfPlayerHand(i) > 1 && getMostRecentDiscardDanger({index: tile.index + 3, type: tile.type}, i) == 0 || getMostRecentDiscardDanger({index: tile.index - 3, type: tile.type}, i) == 0) { //Suji
			if(tile.index < 4 || tile.index > 6) {
				dangerPerPlayer[i] -= 40 * SUJI_MODIFIER;
			}
			else {
				dangerPerPlayer[i] -= 10 * SUJI_MODIFIER;
			}
		}

		var recentDiscardDanger = getMostRecentDiscardDanger(tile, i);
		if(recentDiscardDanger == 0) {
			dangerPerPlayer[i] = 0;
			continue;
		}
		else if(recentDiscardDanger == 1) {
			dangerPerPlayer[i] -= 50;
		}
		else if(recentDiscardDanger == 2) {
			dangerPerPlayer[i] -= 20;
		}
		else if(recentDiscardDanger < 99) {
			dangerPerPlayer[i] -= 5;
		}
		
		//Rest: Outer Tiles
		if(tile.type != 3 && tile.index == 1 || tile.index == 9) {
			dangerPerPlayer[i] -= 6;
		}
		//Rest: Outer Tiles
		if(tile.type != 3 && tile.index == 2 || tile.index == 8) {
			dangerPerPlayer[i] -= 3;
		}
		
		//Is Dora? -> 12,5% more dangerous
		dangerPerPlayer[i] *= (1 + (getTileDoraValue(tile)/8));
		
		//Is the player going for a flush of that type? -> 30% more dangerous
		if(isGoingForFlush(i, tile.type)) {
			dangerPerPlayer[i] *= 1.3;
		}
		
		//Danger is at least 5
		if(dangerPerPlayer[i] < 5) {
			dangerPerPlayer[i] = 5;
		}
		
		//Multiply with Danger Level
		dangerPerPlayer[i] *= getPlayerDangerLevel(i) / 100;
	}
	
	var dangerNumber = ((dangerPerPlayer[1] + dangerPerPlayer[2] + dangerPerPlayer[3] + Math.max.apply(null, dangerPerPlayer)) / 4); //Most dangerous player counts twice
	
	return dangerNumber;
}

//Returns danger level for players. 100: Tenpai (Riichi)
function getPlayerDangerLevel(player) {
	if(isDebug()) {
		return TEST_DANGER_LEVEL;
	}
	if(getPlayerLinkState(player) == 0) { //Disconnected -> Safe
		return 0;
	}
	
	if(getNumberOfPlayerHand(player) < 13) { //Some Calls
		var dangerLevel = parseInt(185 - (getNumberOfPlayerHand(player) * 8) - (tilesLeft * 1.5));
	}
	else {
		var dangerLevel = 15 - tilesLeft; //Full hand without Riichi -> Nearly always safe
	}
	

	if(dangerLevel > 80) {
		dangerLevel = 80;
	}
	else if(isPlayerRiichi(player)) { //Riichi
		dangerLevel = 100;
	}
	else if(dangerLevel < 0) {
		return 0;
	}
	
	//Account for possible values of hands.
	
	if(getSeatWind(player) == 1) { //Is Dealer
		dangerLevel += 10;
	}
	
	dangerLevel += getNumberOfDorasInHand(calls[player]) * 10; //TODO: Does not account for non-red dora. Fix!
	
	if(isGoingForFlush(player, 0) || isGoingForFlush(player, 1) || isGoingForFlush(player, 2)) {
		dangerLevel += 10;
	}
	
	return dangerLevel;
}

//Returns the current Danger level of the table
function getCurrentDangerLevel() { //Most Dangerous Player counts extra
	return ((getPlayerDangerLevel(1) + getPlayerDangerLevel(2) + getPlayerDangerLevel(3) + Math.max(getPlayerDangerLevel(1), getPlayerDangerLevel(2), getPlayerDangerLevel(3))) / 4);
}

//Returns the number of turns ago when the tile was most recently discarded
function getMostRecentDiscardDanger(tile, player) {
	var danger = 99;
	for(var i = 0; i < 4; i++) {
		var r = getLastTileInDiscard(i, tile);
		if(player == i && r != null) {
			return 0;
		}
		if(r != null && r.numberOfPlayerHandChanges[player] < danger) {
			danger = r.numberOfPlayerHandChanges[player];
		}
	}

	return danger;
}

//Returns the position of a tile in discards
function getLastTileInDiscard(player, tile) {
	for(var i = discards[player].length - 1; i >= 0; i--) {
		if(discards[player][i].index == tile.index && discards[player][i].type == tile.type) {
			return discards[player][i];
		}
	}
	return null;
}

//Returns the safety of a tile
function getTileSafety(tile) {
	return 1 - (Math.pow(getTileDanger(tile)/10, 2)/100);
}

//Returns true if the player is going for a flush of a given type
function isGoingForFlush(player, type) {
	if(calls[player].length <= 3 || calls[player].some(tile => tile.type != type && tile.type != 3)) { //Not enough or different calls -> false
		return false;
	}
	if(discards[player].filter(tile => tile.type == type).length >= (discards[player].length/6)) { //Many discards of that type -> false
		return false;
	}
	return true;
}

//Sets tile safeties for discards
function updateDiscardedTilesSafety() {
	for(var k = 1; k < 4; k++) { //For all other players
		for(var i = 0; i < 4; i++) { //For all discard ponds
			for(var j = 0; j < discards[i].length; j++) { //For every tile in it
				if(typeof(discards[i][j].numberOfPlayerHandChanges) == "undefined") {
					discards[i][j].numberOfPlayerHandChanges = [0,0,0,0];
				}
				if(hasPlayerHandChanged(k)) {
					if(j == discards[i].length - 1 && k < i && (k <= seat2LocalPosition(getCurrentPlayer()) || seat2LocalPosition(getCurrentPlayer()) == 0)) { //Ignore tiles by players after hand change
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
	for(var k = 1; k < 4; k++) { //For all other players
		for(var i = 0; i < 4; i++) { //For all discard ponds
			for(var j = 0; j < discards[i].length; j++) { //For every tile in it
				if(typeof(discards[i][j].numberOfPlayerHandChanges) == "undefined") {
					discards[i][j].numberOfPlayerHandChanges = [0,0,0,0];
				}
				var bonus = 0;
				if(k < i && (k <= seat2LocalPosition(getCurrentPlayer()) || seat2LocalPosition(getCurrentPlayer()) == 0)) {
					bonus = 1;
				}
				discards[i][j].numberOfPlayerHandChanges[k] = discards[i].length - j - bonus;
			}
		}
	}
}