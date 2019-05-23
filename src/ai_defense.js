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
		if(getPositionOfTileInDiscard(i, tile) > 0) { // Check if tile in discard
			dangerPerPlayer[i] = 0;
			continue;
		}
		else if(tile.type == 3) { // Honor tiles
			var availableHonors = availableTiles.filter(t => t.index == tile.index && t.type == tile.type).length;
			if(availableHonors == 0) {
				dangerPerPlayer[i] = 0;
				continue;
			}
			else if(availableHonors == 1) {
				dangerPerPlayer[i] = 5;
			}
			else if(availableHonors == 2) {
				dangerPerPlayer[i] = 30;
			}
			else if(availableHonors == 3) {
				dangerPerPlayer[i] = 80;
			}
		}
		else if(tile.type != 3 && getPositionOfTileInDiscard(i, {index: tile.index + 3, type: tile.type}) > 0 || getPositionOfTileInDiscard(i, {index: tile.index - 3, type: tile.type}) > 0) { //Suji
			if(tile.index < 4 || tile.index > 6) {
				dangerPerPlayer[i] -= 40 * SUJI_MODIFIER;
			}
			else {
				dangerPerPlayer[i] -= 20 * SUJI_MODIFIER;
			}
		}

		//Recent Discards: Last turn: -50, -40, -30, -25, ... -5, -5...
		var mostRecentDiscard = getMostRecentDiscard(tile);
		if(mostRecentDiscard != 0 && mostRecentDiscard < 4) {
			dangerPerPlayer[i] -= (6 - mostRecentDiscard) * RECENT_DISCARD_MODIFIER;
		}
		else if(mostRecentDiscard != 0 && mostRecentDiscard < 9) {
			dangerPerPlayer[i] -= (9 - mostRecentDiscard) * (RECENT_DISCARD_MODIFIER/2);
		}
		else if(mostRecentDiscard != 0) {
			dangerPerPlayer[i] -= RECENT_DISCARD_MODIFIER / 2;
		}
		
		//Rest: Outer Tiles
		if(tile.type != 3 && tile.index == 1 || tile.index == 9) {
			dangerPerPlayer[i] -= 10;
		}
		//Rest: Outer Tiles
		if(tile.type != 3 && tile.index == 2 || tile.index == 8) {
			dangerPerPlayer[i] -= 5;
		}
		
		//Danger is at least 5
		if(dangerPerPlayer[i] < 5) {
			dangerPerPlayer[i] = 5;
		}
		
		//Is Dora? -> 20% more dangerous
		dangerPerPlayer[i] *= (1 + (getTileDoraValue(tile)/5));
		
		//Is the player going for a flush of that type? -> 50% more dangerous
		if(isGoingForFlush(i, tile.type)) {
			dangerPerPlayer[i] *= 1.5;
		}
		
		//Multiply with Danger Level
		dangerPerPlayer[i] *= dangerLevel / 100;
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
	if(isPlayerRiichi(player) || getNumberOfPlayerHand(player) <= 4) { //Riichi, 3 or 4 Calls
		return 100;
	}
	
	if(getNumberOfPlayerHand(player) < 13) { //1 or 2 Calls
		var dangerLevel = 140 - (getNumberOfPlayerHand(player) * 8) - tilesLeft;
	}
	else {
		var dangerLevel = 15 - tilesLeft; //Full hand without Riichi -> Nearly always safe
	}
	
	dangerLevel += getNumberOfDorasInHand(calls[player]) * 10;
	
	if(getSeatWind(player) == 1) { //Is Dealer
		dangerLevel += 10;
	}
	
	if(dangerLevel < 0) {
		return 0;
	}
	else if(dangerLevel > 100) {
		return 100;
	}
	return dangerLevel;
}

//Returns the current Danger level of the table
function getCurrentDangerLevel() { //Dangeroust Player counts extra ((all/3)+1)/4dangeroust)
	return ((getPlayerDangerLevel(1) + getPlayerDangerLevel(2) + getPlayerDangerLevel(3) + Math.max.apply(null, [getPlayerDangerLevel(1), getPlayerDangerLevel(2), getPlayerDangerLevel(3)])) / 4);
}

//Returns the number of turns ago when the tile was most recently discarded
function getMostRecentDiscard(tile) {
	var mostRecent = 99;
	for(var i = 0; i < 4; i++) {
		var r = getPositionOfTileInDiscard(i, tile);
		if(r != 0 && r < mostRecent) {
			mostRecent = r;
		}
	}

	return mostRecent;
}

//Returns the position of a tile in discards
function getPositionOfTileInDiscard(player, tile) {
	for(var i = 0; i < discards[player].length; i++) {
		if(discards[player][i].index == tile.index && discards[player][i].type == tile.type) {
			return discards[player].length - i;
		}
	}
	return 0;
}

//Returns the safety of a tile
function getTileSafety(tile) {
	return 1 - ((getTileDanger(tile)/100) * Math.pow(getCurrentDangerLevel()/100, 2));
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