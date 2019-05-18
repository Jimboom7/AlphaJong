//################################
// AI DEFENSE
//################################


var RECENT_DISCARD_MODIFIER = 10; // Higher Value: Recent Discards have more impact
var SUJI_MODIFIER = 1; //Higher Value: Suji is worth less

//Get Dangerlevels for all tiles in hand
function getHandDanger(hand) {
	var handDanger = [];
	for(var i = 0; i < hand.length; i++) {
		var tileDanger = getTileDanger(hand[i]);
		handDanger.push({tile : hand[i], danger : tileDanger});
	}
	return handDanger;
}

//TODO: Look for Flushes or Tanyao
//Returns danger of tile for all player as a number from 0-100
function getTileDanger(tile) {
	//https://mahjong.guide/2018/02/04/mahjong-fundamentals-6-how-to-defend/  //0-10 -> A, 10-40 -> B, 40-80 -> C, 80-100 -> D
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
				dangerPerPlayer[i] = 20;
			}
			else if(availableHonors == 3) {
				dangerPerPlayer[i] = 40;
			}
		} 
		else if(tile.type != 3 && getPositionOfTileInDiscard(i, {index: tile.index + 3, type: tile.type}) > 0 || getPositionOfTileInDiscard(i, {index: tile.index - 3, type: tile.type}) > 0) { //Suji
			if(tile.index < 4 || tile.index > 6) {
				dangerPerPlayer[i] = 20 * SUJI_MODIFIER;
			}
			else {
				dangerPerPlayer[i] = 35 * SUJI_MODIFIER;
			}
		}

		//Recent Discards: Last turn: -50, ... -40, -30, -25, ... -5, -5...
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
		
		if(dangerPerPlayer[i] < 5) {
			dangerPerPlayer[i] = 5;
		}
		
		//Multiply with Danger Level
		dangerPerPlayer[i] *= dangerLevel / 100;
	}
	
	var dangerNumber = ((dangerPerPlayer[1] + dangerPerPlayer[2] + dangerPerPlayer[3] + Math.max.apply(null, dangerPerPlayer)) / 4); //Most dangerous player counts twice
	
	//log("Danger for Tile " + getTileName(tile) + " is " + JSON.stringify(dangerPerPlayer) + " --- " + dangerNumber);
	return dangerNumber; //TODO: Dangeroust Player counts extra ((all/3)+1)/4dangeroust)
}

//Returns danger level for players. 100: Tenpai (Riichi)
//TODO: Closed Hand more dangerous?
//TODO: Number of Turns
//TODO: count doras in calls -> more dangerous?
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
	if(dangerLevel < 0) {
		return 0;
	}
	else if(dangerLevel > 100) {
		return 0;
	}
	return dangerLevel;
}

function getCurrentDangerLevel() { //Dangeroust Player counts extra ((all/3)+1)/4dangeroust)
	return ((getPlayerDangerLevel(1) + getPlayerDangerLevel(2) + getPlayerDangerLevel(3) + Math.max.apply(null, [getPlayerDangerLevel(1), getPlayerDangerLevel(2), getPlayerDangerLevel(3)])) / 4);
}

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

function getPositionOfTileInDiscard(player, tile) {
	for(var i = 0; i < discards[player].length; i++) {
		if(discards[player][i].index == tile.index && discards[player][i].type == tile.type) {
			return discards[player].length - i;
		}
	}
	return 0;
}

function getTileSafety(tile) {
	return 1 - ((getTileDanger(tile)/100) * getCurrentDangerLevel()/100);
}