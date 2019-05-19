//################################
// AI OFFENSE
//################################

//Look at Hand etc. and decide for a strategy.
//TODO: Thirteen Orphans
function determineStrategy() {
	
	var handTriples = parseInt(getTriplesInHand(getHandWithCalls(ownHand)).length/3);

	if(getPairsInHand(ownHand).length/2 >= CHIITOITSU && handTriples < 2 && isClosed) { //Check for Chiitoitsu
			strategy = STRATEGIES.CHIITOITSU;
			strategyAllowsCalls = false;
		}
	else {
		strategy = STRATEGIES.GENERAL;
		strategyAllowsCalls = true;
	}
	
	log("Strategy: " + strategy);
}

//Call a Chi/Pon
//combination example: Array ["6s|7s", "7s|9s"]
function callTriple(combinations, operation) {

	var handValue = getTilePriorities(ownHand);
	var newHand = ownHand.concat([getTileForCall()]);
	var newHandValue = getTilePriorities(newHand);
	
	var currentHandTriples = getTriplesAndPairsInHand(ownHand);
	var newHandTriples = getTriplesAndPairsInHand(newHand);
	
	if(shouldFold(newHandValue)) {
		strategyAllowsCalls = false;
	}
	
	log("Consider call on " + getTileName(getTileForCall()));
	log("Check Strategy allows calls: " + strategyAllowsCalls);
	log("Check Yaku above threshold: " + newHandValue[0].yaku.open + ">=" + CALL_YAKU_THRESHOLD + " && " + newHandValue[1].yaku.open + ">=" + CALL_YAKU_THRESHOLD);
	log("Check if tile forms new triple: " + parseInt(newHandTriples.triples.length/3) + ">" + parseInt(currentHandTriples.triples.length/3));
	log("Check if value of the new hand is high enough: " + ((newHandValue[0].yaku.open + newHandValue[0].dora) / ((handValue[0].yaku.closed + handValue[0].dora) + 1)) + " > " + CALL_CONSTANT/100);

	
	//Make Call, if: Allowed by Strategy, Hand has (possible) Yaku, it forms a NEW triple and (Yaku+Dora of New Hand is not much lower than old hand or already opened).
	if(strategyAllowsCalls &&
		newHandValue[0].yaku.open >= CALL_YAKU_THRESHOLD &&
		newHandValue[1].yaku.open >= CALL_YAKU_THRESHOLD &&
		newHandTriples.triples.length > currentHandTriples.triples.length &&
		((((newHandValue[0].yaku.open + newHandValue[0].dora) / ((handValue[0].yaku.closed + handValue[0].dora) + 1)) > CALL_CONSTANT/100) ||
		(!isClosed && (newHandValue[0].yaku.open + newHandValue[0].dora) >= (handValue[0].yaku.open + handValue[0].dora)))) {
		if(combinations.length <= 1) {
			makeCall(operation);
		}
		else {
			declineCall(); //TODO: Get Index from Combinations when multiple options - for now: Cancel
		}
		log("Call accepted!");
		isClosed = false;
	}
	else { //Decline
		declineCall(); //TODO: Problem when multiple Calls (Chi + Pon) are possible
		log("Call declined!");
	}
}

//Call Tile for Kan
function callDaiminkan() {
	if(!isClosed) {
		makeCall(getOperations().ming_gang);
	}
	else {
		declineCall();
	}
}

//Add from Hand to existing Pon
function callShouminkan() {
	if(!isClosed) {
		makeCall(getOperations().add_gang);
	}
	else {
		declineCall();
	}
}

//Closed Kan
function callAnkan() {
	callKan(getOperations().an_gang);
}

//Needs a semi good hand to call Kans and other players not dangerous
function callKan(operation) {
	var tiles = getTilePriorities(getHandWithCalls(ownHand));
	if(strategyAllowsCalls && tiles.efficiency >= 4 - (tilesLeft/30) - (1 - (CALL_KAN_CONSTANT/50)) && getCurrentDangerLevel() < 100 - CALL_KAN_CONSTANT) {
		makeCall(operation);
	}
	else {
		declineCall();
	}
}

function callRon() {
	makeCall(getOperations().rong);
}

function callTsumo() {
	makeCall(getOperations().zimo);
}

function callRiichi(tiles) {
	var operations = getOperationList();
	var combination = [];
	for(var i = 0; i < operations.length; i++) {
		if(operations[i].type == getOperations().liqi) { //Get possible tiles for discard in riichi
			combination = operations[i].combination;
		}
	}
	for(var i = 0; i < tiles.length; i++) {
		for(var j = 0; j < combination.length; j++) {
			if(getTileName(tiles[i].tile) == combination[j]) {
				sendRiichiCall(combination[j]);
				return;
			}
		}
	}
	discardTile(tiles[0].tile); //In case we are furiten/no tiles available
	
}

//Discard the safest tile in hand
function discardFold() {
	var tileDangers = getHandDanger(ownHand);
	var tile;
	var maxDanger = 100;
	log("Danger Levels:");
	for(var i = 0; i < tileDangers.length; i++) {
		log(getTileName(tileDangers[i].tile) + " : " + tileDangers[i].danger);
		if(tileDangers[i].danger < maxDanger) {
			tile = tileDangers[i].tile;
			maxDanger = tileDangers[i].danger;
		}
	}
	discardTile(tile);
	return tile;
}

//Remove the given Tile from Hand
function discardTile(tile) {
	log("Discard: " + getTileName(tile));
	for(var i = 0; i < ownHand.length; i++) {
		if(ownHand[i].index == tile.index && ownHand[i].type == tile.type && ownHand[i].dora == tile.dora) {
			discards[0].push(ownHand[i]);
			if(!isDebug()) {
				//callDiscard(getPlayerHand[i]);
				view.DesktopMgr.Inst.players[0]._choose_pai = view.DesktopMgr.Inst.players[0].hand[i];
				view.DesktopMgr.Inst.players[0].DoDiscardTile();
			}
			else {
				ownHand.splice(i, 1);
			}
			break;
		}
	}
}

//Calculates Priorities for all tiles in the hand. "Bottleneck" of the AI, can take quite long with more recursion.
function getTilePriorities(inputHand) {
	
	if(isDebug()) {
		log("Dora: " + getTileName(dora[0]));
		printHand(inputHand);
	}
	
	if(strategy == STRATEGIES.CHIITOITSU) {
		return chiitoitsuPriorities();
	}
	
	var callTriples = parseInt(getTriplesInHand(calls[0]).length/3);
	
	var tiles = [];
	for (var i = 0; i < inputHand.length; i++){ //Create 13 Tile hands

		var hand = [...inputHand];
		var newTiles1 = getUsefulTilesForDouble(hand); //For all single tiles: Find tiles that make them doubles
		hand.splice(i, 1);

		var combinations = getTriplesAndPairsInHand(hand);
		var triples = combinations.triples;
		var pairs = combinations.pairs;

		var baseEfficiency = parseInt((triples.length / 3)) + callTriples;
		baseEfficiency = baseEfficiency > 3.5 ? 3.5 : baseEfficiency;
		baseEfficiency += (pairs.length / 2) > 0 ? PAIR_VALUE : 0; //TODO: Priorize Pairs when Triples >= 3 (When Pair: 4 Triples = 3.5)
		efficiency = baseEfficiency;
		var baseDora = getNumberOfDorasInHand(triples.concat(pairs, calls[0]));
		var doraValue = baseDora;
		var baseYaku = getYaku(hand);
		var yaku = baseYaku;
		
		//More accurat but slower with triples in hand
		var newHand = hand;//getHandWithoutTriples(hand, triples);

		var valueForTile = []; //List of tiles and their value, for second step
		var tileCombinations = []; //List of combinations for second step
		for(var j = 0; j < newTiles1.length; j++) { //TODO: Ignore Pairs in second step?

			var numberOfTiles1 = getNumberOfNonFuritenTilesAvailable(newTiles1[j].index, newTiles1[j].type);
			if(numberOfTiles1 <= 0) {
				continue;
			}
			
			newHand.push(newTiles1[j]);

			var combinations2 = getTriplesAndPairsInHand(newHand);
			var triples2 = combinations2.triples;
			var pairs2 = combinations2.pairs;

			var e2 = parseInt((triples2.length / 3)) + callTriples;
			e2 = e2 > 3.5 ? 3.5 : e2;
			e2 += (pairs2.length / 2) > 0 ? PAIR_VALUE : 0;
			
			e2 -= baseEfficiency; //Only additional triples
			var d2 = getNumberOfDorasInHand(triples2.concat(pairs2, calls[0])) - baseDora; //Check new triples and pairs for dora
			
			var newTiles2 = getUsefulTilesForTriple(newHand);
			for(var k = 0; k < newTiles2.length; k++) {
				if(newTiles1[j].type != newTiles2[k].type) { //Different sorts make no sense
					continue;
				}
				if(tileCombinations.some(t => (getTileName(t.tile1) == getTileName(newTiles2[k]) && getTileName(t.tile2) == getTileName(newTiles1[j])) || (getTileName(t.tile1) == getTileName(newTiles1[j]) && getTileName(t.tile2) == getTileName(newTiles2[k])))) { //Don't calculate combinations multiple times
					continue;
				}
				tileCombinations.push({tile1: newTiles1[j], tile2: newTiles2[k]});
			}
			
			var chance = (numberOfTiles1 / availableTiles.length);
			if(d2 > 0) { //If this tile incorporates a new dora into the hand. Either by forming a triple or by extending a straight etc.
				doraValue += d2 * chance;
			}
			
			var y2 = baseYaku;
			if(e2 > 0) { //If this tile forms a new triple
				efficiency += e2 * chance;
				y2 = getYaku(newHand);
				y2.open -= baseYaku.open;
				y2.closed -= baseYaku.closed;
				if(y2.open > 0) {
					yaku.open += y2.open * chance;
				}
				if(y2.closed > 0) {
					yaku.closed += y2.closed * chance;
				}
			}
			
			valueForTile.push({tile: newTiles1[j], efficiency: e2, dora: d2, yaku: y2});
			
			newHand.pop();
		}	
		
		//Second Recursion after drawing 2 pais
		for(var j = 0; j < tileCombinations.length; j++) {
			var numberOfTiles1 = getNumberOfNonFuritenTilesAvailable(tileCombinations[j].tile1.index, tileCombinations[j].tile1.type);
			var numberOfTiles2 = getNumberOfNonFuritenTilesAvailable(tileCombinations[j].tile2.index, tileCombinations[j].tile2.type);
			if(numberOfTiles1 <= 0) {
				continue;
			}		
			if(tileCombinations[j].tile1.index == tileCombinations[j].tile2.index && tileCombinations[j].tile1.type == tileCombinations[j].tile2.type) {
				numberOfTiles2--;
			}			
			if(numberOfTiles2 <= 0) {
				continue;
			}
			
			newHand.push(tileCombinations[j].tile1);
			newHand.push(tileCombinations[j].tile2);
			
			tile1Value = valueForTile.find(t => getTileName(t.tile) == getTileName(tileCombinations[j].tile1));
			tile2Value = valueForTile.find(t => getTileName(t.tile) == getTileName(tileCombinations[j].tile2));
			
			tile2Value == undefined ? tile2Value = {efficiency: 0, dora: 0, yaku: {open: 0, closed: 0}} : tile2Value;
			
			var oldEfficiency = tile1Value.efficiency + tile2Value.efficiency;
			var oldDora = tile1Value.dora + tile2Value.dora;
			var oldYaku = {open : tile1Value.yaku.open + tile2Value.yaku.open, closed: tile1Value.yaku.closed + tile2Value.yaku.closed};
						if(getTileName(tileCombinations[j].tile1) == "6p" && getTileName(tileCombinations[j].tile2) == "7p") {
				var a = 0;
			}
			var combinations3 = getTriplesAndPairsInHand(newHand);
			var triples3 = combinations3.triples;
			var pairs3 = combinations3.pairs;
			
			var e3 = parseInt((triples3.length / 3)) + callTriples;
			e3 = e3 > 3.5 ? 3.5 : e3;
			e3 += (pairs3.length / 2) > 0 ? PAIR_VALUE : 0;
			
			e3 -= baseEfficiency + oldEfficiency; //Only additional triples
			var d3 = getNumberOfDorasInHand(triples3.concat(pairs3, calls[0])) - (baseDora + oldDora); //Check new triples and pairs for dora
			

			
			var chance = ((numberOfTiles1 + numberOfTiles2) / availableTiles.length) * ((numberOfTiles1 + numberOfTiles2) / (availableTiles.length - 1));
			if(d3 > 0) {
				doraValue += d3 * chance;
			}
			
			if(e3 > 0) { //If this tile forms a new triple
				efficiency += e3 * chance;
				var y3 = getYaku(newHand);
				y3.open -= (baseYaku.open + oldYaku.open);
				y3.closed -= (baseYaku.closed + oldYaku.closed);
				if(y3.open > 0) {
					yaku.open += y3.open * chance;
				}
				if(y3.closed > 0) {
					yaku.closed += y3.closed * chance;
				}
			}
			
			newHand.pop();
			newHand.pop();
		}
		var value = getTileValue(inputHand[i], efficiency, yaku, doraValue);
		tiles.push({tile : inputHand[i], value: value, efficiency : efficiency, dora: doraValue, yaku: yaku});
	}
	
	tiles = tiles.sort(function (p1, p2) {
		return p2.value - p1.value;
	});
	return tiles;
}

function getTileValue(tile, efficiency, yakus, doraValue) {
	var safety = getTileSafety(tile);
	if(isClosed) {
		var yaku = yakus.closed;
	}
	else {
		var yaku = yakus.open;
	}
	return ((efficiency * EFFICIENCY_VALUE) + (yaku * YAKU_VALUE) + (doraValue * DORA_VALUE) + (safety * SAFETY_VALUE))/(EFFICIENCY_VALUE + YAKU_VALUE + DORA_VALUE + SAFETY_VALUE);
}

//Get Chiitoitsu Priorities -> Look for Pairs
function chiitoitsuPriorities() {
	
	var tiles = [];
	
	for (var i = 0; i < ownHand.length; i++){ //Create 13 Tile hands, check for pairs
		var newHand = [...ownHand];
		newHand.splice(i, 1);
		var pairs = getPairsInHand(newHand);
		var pairsValue = pairs.length/2;
		var handWithoutPairs = getHandWithoutTriples(newHand, pairs);
		var doraValue = getNumberOfDorasInHand(pairs);
		
		var efficiency = pairsValue;
		var dora2 = 0;

		var yaku = getYaku(newHand);
		var baseYaku = yaku;
	
		//Possible Value, Yaku and Dora after Draw
		var oldTile = {index: 9, type: 9, dora: false};
		availableTiles.forEach(function(tile) {
			if(tile.index != oldTile.index || tile.type != oldTile.type) {
				var currentHand = [...handWithoutPairs];
				currentHand.push(tile);
				var numberOfTiles = getNumberOfNonFuritenTilesAvailable(tile.index, tile.type);
				var chance = (numberOfTiles / availableTiles.length);
				var pairs2 = getPairsInHand(currentHand);
				if(pairs2.length > 0) {
					efficiency += chance;
					doraValue += getNumberOfDorasInHand(pairs2) * chance;
					var y2 = getYaku(newHand);
					y2.open -= yaku.open;
					y2.closed -= baseYaku.closed;
					if(y2.open > 0) {
						yaku.open += y2.open * chance;
					}
					if(y2.closed > 0) {
						yaku.closed += y2.closed * chance;
					}
				}
			}
			oldTile = tile;
		});
		var value = getTileValue(ownHand[i], efficiency, yaku, doraValue);
		tiles.push({tile : ownHand[i], value:value, efficiency : efficiency, dora: doraValue, yaku: yaku});
	}
	tiles = tiles.sort(function (p1, p2) {
		return p2.value - p1.value;
	});
	return tiles;
}


//Parameter: Tiles with information (efficiency, yaku, dora)
//Discards the "best" tile
function discard() {
	
	var tiles = getTilePriorities(ownHand);
	
	
	if(shouldFold(tiles)) {
		return discardFold();
	}
		
	/*
	bigHandValue = BIG_HAND_MODIFIER - ((18 - (tilesLeft/4)) * BIG_HAND_DECAY);
	if(bigHandValue < 10) {
		bigHandValue = 10;
	}*/	
	
	log("Tile Priorities: ");
	printTilePriority(tiles);
	
	if(canRiichi() && tilesLeft > RIICHI_TILES_LEFT) {
		callRiichi(tiles);
	}
	else {
		discardTile(tiles[0].tile);
	}
	return tiles[0].tile;
}