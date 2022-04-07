//################################
// AI OFFENSE
// Offensive part of the AI
//################################

//Look at Hand etc. and decide for a strategy.
function determineStrategy() {

	if (strategy != STRATEGIES.FOLD) {

		var handTriples = parseInt(getTriples(getHandWithCalls(ownHand)).length / 3);
		var pairs = getPairsAsArray(ownHand).length / 2;

		if ((pairs == 6 || (pairs >= CHIITOITSU && handTriples < 2)) && isClosed) { //Check for Chiitoitsu
			strategy = STRATEGIES.CHIITOITSU;
			strategyAllowsCalls = false;
		}
		else if (canDoThirteenOrphans()) {
			strategy = STRATEGIES.THIRTEEN_ORPHANS;
			strategyAllowsCalls = false;
		}
		else {
			strategy = STRATEGIES.GENERAL;
			strategyAllowsCalls = true;
		}
	}
	log("Strategy: " + strategy);
}

//Call a Chi/Pon
//combination example: Array ["6s|7s", "7s|9s"]
function callTriple(combinations, operation) {

	log("Consider call on " + getTileName(getTileForCall()));

	var handValue = getHandValues(ownHand);
	var newHand = ownHand.concat([getTileForCall()]);

	var currentHandTriples = getTriplesAndPairs(ownHand);
	var newHandTriples = getTriplesAndPairs(newHand);

	//Find best Combination
	var comb = -1;
	var newTriple = removeTilesFromTileArray(newHandTriples.triples, currentHandTriples.triples.concat(getTileForCall()));
	newTriple = sortTiles(newTriple);

	if (newHandTriples.triples.length <= currentHandTriples.triples.length || typeof newTriple[0] == undefined || typeof newTriple[1] == undefined) { //No new triple
		log("Call would form no new triple! Declined!");
		declineCall(operation);
		return false;
	}

	for (var i = 0; i < combinations.length; i++) {
		if (combinations[i] == getTileName(newTriple[0]) + "|" + getTileName(newTriple[1]) || combinations[i] == getTileName(newTriple[1]) + "|" + getTileName(newTriple[0])) {
			calls[0].push(newTriple[0]); //Simulate "Call" for hand value calculation
			calls[0].push(newTriple[1]);
			calls[0].push(getTileForCall());
			newHand = removeTilesFromTileArray(ownHand, [newTriple[0], newTriple[1]]); //Remove called tiles from hand
			var nextDiscard = getDiscardTile(getTilePriorities(newHand)); //Calculate next discard
			if (nextDiscard.index == getTileForCall().index && nextDiscard.type == getTileForCall().type) {
				declineCall(operation);
				log("Next discard would be the same tile. Call declined!");
				return false;
			}
			newHand = removeTilesFromTileArray(newHand, [nextDiscard]); //Remove discard from hand
			var newHandValue = getHandValues(newHand, nextDiscard); //Get Value of that hand
			newHandTriples = getTriplesAndPairs(newHand); //Get Triples, to see if discard would make the hand worse
			calls[0].pop();
			calls[0].pop();
			calls[0].pop();

			log("Combination found: " + combinations[i]);
			comb = i;
		}
	}

	if (comb == -1) {
		declineCall(operation);
		log("Could not find combination. Call declined!");
		return false;
	}

	var averageSafety = 0;
	var numOfTiles = 0;

	for (let tile of newHand) {
		averageSafety += getTileSafety(tile);
		numOfTiles++;
	}
	averageSafety /= numOfTiles;

	if (getFoldThreshold(newHandValue, false) > averageSafety || getFoldThreshold(newHandValue, false) > newHandValue.safety) {
		strategyAllowsCalls = false;
	}

	if (!strategyAllowsCalls) { //No Calls allowed
		log("Strategy allows no calls! Declined!");
		declineCall(operation);
		return false;
	}

	if (newHandValue.yaku.open < 0.01) { //Yaku chance is too bad
		log("Not enough Yaku! Declined! " + newHandValue.yaku.open + "<0.01");
		declineCall(operation);
		return false;
	}

	if (newHandTriples.triples.length < currentHandTriples.triples.length) { //Destroys triple next turn
		log("Next discard would destroy a triple. Declined!");
		declineCall(operation);
		return false;
	}

	if (parseInt(currentHandTriples.triples.length / 3) == 3 && parseInt(currentHandTriples.pairs.length / 2) == 1) { //New Triple destroys the last pair
		log("Call would destroy last pair! Declined!");
		declineCall(operation);
		return false;
	}

	if (handValue.waits > 1 && newHandValue.waits < handValue.waits + 1) { //Call results in worse waits
		log("Call would result in less waits!");
		declineCall(operation);
		return false;
	}

	if (handValue.efficiency < 1.5 && seatWind == 1) { //Low hand efficiency & dealer? -> Go for a fast win
		log("Call accepted because of bad hand and dealer position!");
	}
	else if (newHandValue.yaku.open + getNumberOfDoras(ownHand) >= CALL_CONSTANT && handValue.yaku.open + handValue.dora > newHandValue.yaku.open + newHandValue.dora * 0.7) { //High value hand? -> Go for a fast win
		log("Call accepted because of high value hand!");
	}
	else if (getTileDoraValue(getTileForCall()) + newHandValue.yaku.open >= handValue.yaku.closed + 0.9) { //Call gives additional value to hand
		log("Call accepted because it boosts the value of the hand!");
	}
	else if (!isClosed && (newHandValue.yaku.open + newHandValue.dora) >= (handValue.yaku.open + handValue.dora) * 0.9) { //Hand is already open and not much value is lost
		log("Call accepted because hand is already open!");
	}
	else { //Decline
		declineCall(operation);
		log("Call declined because it does not benefit the hand!");
		return false;
	}

	makeCallWithOption(operation, comb);
	isClosed = false;
	return true;

}

//Call Tile for Kan
function callDaiminkan() {
	if (!isClosed) {
		callKan(getOperations().ming_gang, getTileForCall());
	}
	else { //Always decline with closed hand
		declineCall(getOperations().ming_gang);
	}
}

//Add from Hand to existing Pon
function callShouminkan() {
	callKan(getOperations().add_gang, getTileForCall());
}

//Closed Kan
function callAnkan(combination) {
	callKan(getOperations().an_gang, getTileFromString(combination[0]));
}

//Needs a semi good hand to call Kans and other players are not dangerous
function callKan(operation, tileForCall) {
	log("Consider Kan.");
	var tiles = getHandValues(getHandWithCalls(ownHand));

	var newTiles = getHandValues(getHandWithCalls(removeTilesFromTileArray(ownHand, [tileForCall]))); //Check if efficiency goes down without additional tile

	if (isPlayerRiichi(0) || (strategyAllowsCalls &&
		tiles.efficiency >= 4 - (tilesLeft / 30) - (1 - (CALL_KAN_CONSTANT / 50)) &&
		getCurrentDangerLevel() < 100 - CALL_KAN_CONSTANT &&
		(tiles.efficiency * 0.95) < newTiles.efficiency)) {
		makeCall(operation);
		log("Kan accepted!");
	}
	else {
		if (operation == getOperations().ming_gang) { // Decline call for closed/added Kans is not working, just skip it and discard normally
			declineCall(operation);
		}
		log("Kan declined!");
	}
}

function callRon() {
	makeCall(getOperations().rong);
}

function callTsumo() {
	makeCall(getOperations().zimo);
}

function callKita() { // 3 player only
	if (strategy != STRATEGIES.THIRTEEN_ORPHANS && strategy != STRATEGIES.FOLD) {
		sendKitaCall();
		return true;
	}
	return false;
}

function callAbortiveDraw() { // Kyuushu Kyuuhai, 9 Honors or Terminals in starting Hand
	if (canDoThirteenOrphans()) {
		return;
	}
	var handValue = getHandValues(ownHand);
	if (handValue.value < 1.2) { //Hand is bad -> abort game
		sendAbortiveDrawCall();
	}
}

function callRiichi(tiles) {
	var operations = getOperationList();
	var combination = [];
	for (let op of operations) {
		if (op.type == getOperations().liqi) { //Get possible tiles for discard in riichi
			combination = op.combination;
		}
	}
	log(JSON.stringify(combination));
	for (let tile of tiles) {
		for (let comb of combination) {
			if (comb.charAt(0) == "0") { //Fix for Dora Tiles
				combination.push("5" + comb.charAt(1));
			}
			if (getTileName(tile.tile) == comb) {
				if (shouldRiichi(tile.waits, tile.yaku, tile.dora)) {
					var moqie = false;
					if (getTileName(tile.tile) == getTileName(ownHand[ownHand.length - 1])) { //Is last tile?
						moqie = true;
					}
					log("Call Riichi!");
					sendRiichiCall(comb, moqie);
					return;
				}
				else {
					log("Riichi declined!");
					discardTile(tiles[0].tile);
					return;
				}
			}
		}
	}
	log("Riichi declined because Combination not found!");
	discardTile(tiles[0].tile);
}

//Discard either: The safest tile in hand if full fold
//Or the safest tile at the top of the list if one turn fold
function discardFold(tiles) {
	if (strategy != STRATEGIES.FOLD) { //Not in full Fold mode yet: Discard a relatively safe tile with high priority
		for (let tile of tiles) {
			var foldThreshold = getFoldThreshold(tile, true);
			if (tile.value + 0.1 > tiles[0].value) { //If next tile is not much worse in value than the top priority discard
				if (tile.safety > foldThreshold) { //Tile that is safe enough exists
					log("Tile Priorities: ");
					printTilePriority(tiles);
					discardTile(tile.tile);
					return tile.tile;
				}
			}
		}
		// No safe tile with high priority found: Full Fold.
		log("Hand is very dangerous, fold until the end of this round.");
		strategy = STRATEGIES.FOLD;
		strategyAllowsCalls = false;
	}

	tiles.sort(function (p1, p2) {
		return p2.safety - p1.safety;
	});
	log("Fold Tile Priorities: ");
	printTilePriority(tiles);

	discardTile(tiles[0].tile);
	return tiles[0].tile;
}

//Remove the given Tile from Hand
function discardTile(tile) {
	log("Discard: " + getTileName(tile));
	for (var i = 0; i < ownHand.length; i++) {
		if (ownHand[i].index == tile.index && ownHand[i].type == tile.type && ownHand[i].dora == tile.dora) {
			discards[0].push(ownHand[i]);
			if (!isDebug()) {
				callDiscard(i);
			}
			else {
				ownHand.splice(i, 1);
			}
			break;
		}
	}
}

//Simulates discarding every tile and calculates hand value
function getTilePriorities(inputHand) {

	if (isDebug()) {
		log("Dora: " + getTileName(dora[0]));
		printHand(inputHand);
	}

	if (strategy == STRATEGIES.CHIITOITSU) {
		return chiitoitsuPriorities();
	}
	else if (strategy == STRATEGIES.THIRTEEN_ORPHANS) {
		return thirteenOrphansPriorities();
	}

	var tiles = [];
	for (var i = 0; i < inputHand.length; i++) { //Create 13 Tile hands

		var hand = [...inputHand];
		hand.splice(i, 1);

		tiles.push(getHandValues(hand, inputHand[i]));

	}

	tiles.sort(function (p1, p2) {
		return p2.value - p1.value;
	});
	return tiles;
}

//Calculates Priorities for all tiles in the hand.
//This function takes a 13 tile hand as input. It then looks for tiles that could potentially improve the hand. After that it does the same with more tiles.
//In each step scores for efficiency, yaku, dora, waits etc. are calculated and in the end final values are returned.
//Could also be done with real recursion, but in practise the runtime is too long.
function getHandValues(hand, discardedTile) {
	var newTiles1 = getUsefulTilesForDouble(hand); //For all single tiles: Find tiles that make them doubles

	var combinations = getTriplesAndPairs(hand);
	var triples = combinations.triples;
	var pairs = combinations.pairs;


	var callTriples = parseInt(getTriples(calls[0]).length / 3);
	var baseEfficiency = parseInt((triples.length / 3)) + callTriples;
	baseEfficiency = baseEfficiency > 3.5 ? 3.5 : baseEfficiency;
	baseEfficiency += (pairs.length / 2) > 0 ? 0.5 : 0;
	var efficiency = baseEfficiency;
	var baseDora = getNumberOfDoras(triples.concat(pairs, calls[0]));
	var doraValue = baseDora;
	if (getNumberOfPlayers() == 3) {
		doraValue += getNumberOfKitaOfPlayer(0) * getTileDoraValue({ index: 4, type: 3 });
	}
	var baseYaku = getYaku(hand, calls[0]);
	var yaku = baseYaku;
	var waits = 0;

	var isHandFuriten = false;
	var valueForTile = []; //List of tiles and their value, for second step
	var tileCombinations = []; //List of combinations for second step
	for (let newTile of newTiles1) {

		var numberOfTiles1 = getNumberOfTilesAvailable(newTile.index, newTile.type, removeTilesFromTileArray(hand, triples.concat(pairs)));
		hand.push(newTile);

		var combinations2 = getTriplesAndPairs(hand);
		var triples2 = combinations2.triples;
		var pairs2 = combinations2.pairs;

		if (numberOfTiles1 <= 0) { //No Tile available?
			if (isTileFuriten() && isWinningHand(parseInt((triples2.length / 3)) + callTriples, pairs2.length / 2)) { //Check if the hand would be winning and be in furiten
				waits = 0;
				isHandFuriten = true;
			}
			hand.pop();
			continue;
		}

		var e2 = parseInt((triples2.length / 3)) + callTriples;
		e2 = e2 > 3.5 ? 3.5 : e2;
		e2 += (pairs2.length / 2) > 0 ? 0.5 : 0;

		e2 -= baseEfficiency; //Only additional triples
		var d2 = getNumberOfDoras(triples2.concat(pairs2, calls[0])) - baseDora; //Check new triples and pairs for dora

		var newTiles2 = getUsefulTilesForTriple(hand);
		for (let newTile2 of newTiles2) {
			if (LOW_SPEC_MODE && newTile.type != newTile2.type) { //In Low Spec Mode: Ignore some combinations that are unlikely to improve the hand -> Less calculation time
				continue;
			}
			if (tileCombinations.some(t => (getTileName(t.tile1) == getTileName(newTile2) && getTileName(t.tile2) == getTileName(newTile)) || (getTileName(t.tile1) == getTileName(newTile) && getTileName(t.tile2) == getTileName(newTile2)))) { //Don't calculate combinations multiple times
				continue;
			}
			tileCombinations.push({ tile1: newTile, tile2: newTile2 });
		}

		var chance = (numberOfTiles1 / availableTiles.length);

		if (!isClosed && getNumberOfTilesInTileArray(hand, newTile.index, newTile.type) == 3) {
			chance *= 2; //More value to possible triples when hand is open (can call pons from all players)
		}


		if (d2 > 0) { //If this tile incorporates a new dora into the hand. Either by forming a triple or by extending a straight etc.
			doraValue += d2 * chance;
		}

		var y2 = baseYaku;
		var winning = isWinningHand(parseInt((triples2.length / 3)) + callTriples, pairs2.length / 2);
		if (e2 > 0 || winning) { //If this tile forms a new triple
			efficiency += e2 * chance;
			y2 = getYaku(hand, calls[0]);
			y2.open -= baseYaku.open;
			y2.closed -= baseYaku.closed;
			if (y2.open > 0) {
				yaku.open += y2.open * chance;
			}
			if (y2.closed > 0) {
				yaku.closed += y2.closed * chance;
			}
			if (!isHandFuriten && winning) {
				if (isTileFuriten(newTile.index, newTile.type)) { // Furiten
					waits = 0;
					isHandFuriten = true;
				}
				else {
					waits += numberOfTiles1 * ((3 - (getWaitScoreForTile(newTile) / 90)) / 2); //Factor waits by "uselessness" for opponents
				}
			}
		}

		valueForTile.push({ tile: newTile, efficiency: e2, dora: d2, yaku: y2, winning: winning });

		hand.pop();
	}

	//Second "Recursion" after drawing 2 tiles
	for (let tileCombination of tileCombinations) {
		var numberOfTiles1 = getNumberOfNonFuritenTilesAvailable(tileCombination.tile1.index, tileCombination.tile1.type);
		var numberOfTiles2 = getNumberOfNonFuritenTilesAvailable(tileCombination.tile2.index, tileCombination.tile2.type);
		if (numberOfTiles1 <= 0 || numberOfTiles2 <= 0) {
			continue;
		}
		if (tileCombination.tile1.index == tileCombination.tile2.index && tileCombination.tile1.type == tileCombination.tile2.type) {
			if (numberOfTiles2 == 1) {
				continue;
			}
			var newChance = binomialCoefficient(numberOfTiles1, 2) / binomialCoefficient(availableTiles.length, 2);
		}
		else {
			var newChance = (binomialCoefficient(numberOfTiles1, 1) * binomialCoefficient(numberOfTiles2, 1)) / binomialCoefficient(availableTiles.length, 2);
		}

		chance = (numberOfTiles1 / availableTiles.length);

		var tile1Value = valueForTile.find(t => getTileName(t.tile) == getTileName(tileCombination.tile1));
		var tile2Value = valueForTile.find(t => getTileName(t.tile) == getTileName(tileCombination.tile2));

		if (tile2Value == undefined) {
			tile2Value = { efficiency: 0, dora: 0, yaku: { open: 0, closed: 0 }, winning: false };
		}

		if (tile1Value.winning || tile2Value.winning) {
			continue;
		}

		hand.push(tileCombination.tile1);
		hand.push(tileCombination.tile2);

		if (tileCombination.tile1.index == tileCombination.tile2.index && tileCombination.tile1.type == tileCombination.tile2.type) {
			var oldEfficiency = tile1Value.efficiency;
		}
		else {
			var oldEfficiency = tile1Value.efficiency + tile2Value.efficiency;
			oldEfficiency = oldEfficiency > 1 ? 1 : oldEfficiency;
		}
		var oldDora = tile1Value.dora + tile2Value.dora;
		var oldYaku = { open: tile1Value.yaku.open + tile2Value.yaku.open, closed: tile1Value.yaku.closed + tile2Value.yaku.closed };

		var combinations3 = getTriplesAndPairs(hand);
		var triples3 = combinations3.triples;
		var pairs3 = combinations3.pairs;

		var e3 = parseInt((triples3.length / 3)) + callTriples;
		e3 = e3 > 3.5 ? 3.5 : e3;
		e3 += (pairs3.length / 2) > 0 ? 0.5 : 0;

		e3 -= baseEfficiency + oldEfficiency; //Only additional triples

		var d3 = getNumberOfDoras(triples3.concat(pairs3, calls[0])) - (baseDora + oldDora); //Check new triples and pairs for dora


		if (d3 > 0) {
			doraValue += d3 * newChance;
		}
		var winning = isWinningHand(parseInt((triples3.length / 3)) + callTriples, pairs3.length / 2);
		if (e3 > 0 || winning) { //If this tile forms a new triple
			efficiency += e3 * newChance;
			var y3 = getYaku(hand, calls[0]);
			y3.open -= (baseYaku.open + oldYaku.open);
			y3.closed -= (baseYaku.closed + oldYaku.closed);
			if (y3.open > 0) {
				yaku.open += y3.open * newChance;
			}
			if (y3.closed > 0) {
				yaku.closed += y3.closed * newChance;
			}
			if (!isHandFuriten && winning) {
				waits += numberOfTiles2 * ((3 - (getWaitScoreForTile(tileCombination.tile2) / 90)) / 2) * chance; //Factor waits by "uselessness" for opponents
			}
		}

		hand.pop();
		hand.pop();
	}
	var safety = getTileSafety(discardedTile);
	var value = getTileValue(efficiency, yaku, doraValue, waits, safety);
	return { tile: discardedTile, value: value, efficiency: efficiency, dora: doraValue, yaku: yaku, waits: waits, safety: safety };
}

function getTileValue(efficiency, yakus, doraValue, waits, safety) {
	var yaku = yakus.open;
	if (isClosed) {
		yaku = yakus.closed;
	}

	efficiency += (waits / (11 - (WAIT_VALUE * 10)));

	var placementFactor = 1;

	if (isLastGame() && getDistanceToFirst() < -10000) { //Huge lead in last game
		placementFactor = 1.5;
	}

	return ((efficiency * EFFICIENCY_VALUE * placementFactor) + (yaku * YAKU_VALUE) + (doraValue * DORA_VALUE) +
		(safety * SAFETY_VALUE * placementFactor)) / ((EFFICIENCY_VALUE * placementFactor) + YAKU_VALUE + DORA_VALUE + (SAFETY_VALUE * placementFactor));
}

//Get Chiitoitsu Priorities -> Look for Pairs
function chiitoitsuPriorities() {

	var tiles = [];

	for (var i = 0; i < ownHand.length; i++) { //Create 13 Tile hands, check for pairs
		var newHand = [...ownHand];
		newHand.splice(i, 1);
		var pairs = getPairsAsArray(newHand);
		var pairsValue = pairs.length / 2;
		var handWithoutPairs = removeTilesFromTileArray(newHand, pairs);
		var doraValue = getNumberOfDoras(pairs);
		if (getNumberOfPlayers() == 3) {
			doraValue += getNumberOfKitaOfPlayer(0) * getTileDoraValue({ index: 4, type: 3 });
		}
		var waits = 0;

		var efficiency = pairsValue / 2;

		var yaku = getYaku(newHand, calls[0]);
		yaku.closed += 2; //Add Chiitoitsu yaku manually
		var baseYaku = yaku;

		//Possible Value, Yaku and Dora after Draw
		var oldTile = { index: 9, type: 9, dora: false };
		availableTiles.forEach(function (tile) {
			if (tile.index != oldTile.index || tile.type != oldTile.type) {
				var currentHand = [...handWithoutPairs];
				currentHand.push(tile);
				var numberOfTiles = getNumberOfNonFuritenTilesAvailable(tile.index, tile.type);
				var chance = (numberOfTiles / availableTiles.length);
				var pairs2 = getPairsAsArray(currentHand);
				if (pairs2.length > 0) {
					efficiency += chance / 2;
					doraValue += getNumberOfDoras(pairs2) * chance;
					var y2 = getYaku(newHand, calls[0]);
					y2.open += 2 - baseYaku.open;
					y2.closed += 2 - baseYaku.closed;
					if (y2.open > 0) {
						yaku.open += y2.open * chance;
					}
					if (y2.closed > 0) {
						yaku.closed += y2.closed * chance;
					}
					if (pairsValue + (pairs2.length / 2) == 7) {
						waits += (numberOfTiles * ((3 - (getWaitScoreForTile(tile) / 90)) / 2)) * 2; //Factor waits by "uselessness" for opponents
					}
				}
			}
			oldTile = tile;
		});
		var safety = getTileSafety(ownHand[i]);
		var value = getTileValue(efficiency, yaku, doraValue, waits, safety);
		tiles.push({ tile: ownHand[i], value: value, efficiency: efficiency, dora: doraValue, yaku: yaku, waits: waits, safety: safety });
	}
	tiles.sort(function (p1, p2) {
		return p2.value - p1.value;
	});
	return tiles;
}

//Get Thirteen Orphans Priorities -> Look for Honors/1/9
//Returns Array of tiles with priorities (value, safety etc.)
function thirteenOrphansPriorities() {

	var tiles = [];
	for (var i = 0; i < ownHand.length; i++) { //Simulate discard of every tile

		var hand = [...ownHand];
		hand.splice(i, 1);

		var ownTerminalHonors = getAllTerminalHonorFromHand(hand);
		// Filter out all duplicate terminal/honors
		var uniqueTerminalHonors = [];
		ownTerminalHonors.forEach(tile => {
			if (!uniqueTerminalHonors.some(otherTile => tile.index == otherTile.index && tile.type == otherTile.type)) {
				uniqueTerminalHonors.push(tile);
			}
		});
		var efficiency = uniqueTerminalHonors.length - 9; //Minus 9 to be more in line with the usual efficiency of tiles (around 4: Is Tenpai)
		if (ownTerminalHonors.length > uniqueTerminalHonors.length) { //At least one terminal/honor twice
			efficiency += 0.25;
		}
		var doraValue = getNumberOfDoras(hand);
		var yaku = { open: 5, closed: 5 }; //5 is enough; with more it would never fold the hand
		var waits = 0; //Waits dont really matter for thirteen orphans, not much choice anyway
		var safety = getTileSafety(ownHand[i]);
		var value = getTileValue(efficiency, yaku, doraValue, waits, safety);

		tiles.push({ tile: ownHand[i], value: value, efficiency: efficiency, dora: doraValue, yaku: yaku, waits: waits, safety: safety });

	}

	tiles.sort(function (p1, p2) {
		return p2.value - p1.value;
	});
	return tiles;
}

// Used during the match to see if its still viable to go for thirteen orphans.
function canDoThirteenOrphans() {

	// PARAMETERS
	var thirteen_orphans_set = "19m19p19s1234567z";
	var max_missing_orphans_count = 2; // If an orphan has been discarded more than this time (and is not in hand), we don't go for thirteen orphan.
	// Ie. 'Red Dragon' is not in hand, but been discarded 3-times on field. We stop going for thirteen orphan.

	if (!isClosed) { //Already called some tiles? Can't do thirteen orphans
		return false;
	}

	var ownTerminalHonors = getAllTerminalHonorFromHand(ownHand);

	// Filter out all duplicate terminal/honors
	var uniqueTerminalHonors = [];
	ownTerminalHonors.forEach(tile => {
		if (!uniqueTerminalHonors.some(otherTile => tile.index == otherTile.index && tile.type == otherTile.type)) {
			uniqueTerminalHonors.push(tile);
		}
	});

	// Fails if we do not have enough unique orphans.
	if (uniqueTerminalHonors.length < THIRTEEN_ORPHANS) {
		return false;
	}

	// Get list of missing orphans.
	var thirteenOrphansTiles = getTilesFromString(thirteen_orphans_set);
	var missingOrphans = thirteenOrphansTiles.filter(tile =>
		!uniqueTerminalHonors.some(otherTile => tile.index == otherTile.index && tile.type == otherTile.type));

	// Check if there are enough required orphans in the pool.
	for (let uniqueOrphan of missingOrphans) {
		if (getNumberOfNonFuritenTilesAvailable(uniqueOrphan.index, uniqueOrphan.type) < max_missing_orphans_count) {
			return false;
		}
	}

	return true;
}


//Discards the "best" tile
function discard() {

	var tiles = getTilePriorities(ownHand);

	if (strategy == STRATEGIES.FOLD || shouldFold(tiles)) {
		return discardFold(tiles);
	}

	log("Tile Priorities: ");
	printTilePriority(tiles);

	var tile = getDiscardTile(tiles);

	if (canRiichi() && tilesLeft > RIICHI_TILES_LEFT) {
		callRiichi(tiles);
	}
	else {
		discardTile(tile);
	}

	return tile;
}

//Input: Tile Priority List
//Output: Best Tile to discard. Usually the first tile in the list, but for open hands a valid yaku is taken into account
function getDiscardTile(tiles) {
	var tile = tiles[0].tile;

	if (tiles[0].yaku.open >= 1 || isClosed) {
		return tile;
	}

	var highestYaku = -1;
	for (let t of tiles) {
		var foldThreshold = getFoldThreshold(t, false);
		if (t.yaku.open > highestYaku + 0.01 && t.yaku.open / 3 > highestYaku && t.safety > foldThreshold) {
			tile = t.tile;
			highestYaku = t.yaku.open;
			if (t.yaku.open >= 1) {
				break;
			}
		}
	}
	if (getTileName(tile) != (getTileName(tiles[0].tile))) {
		log("Hand is open, trying to keep at least 1 Yaku.");
	}
	return tile;
}