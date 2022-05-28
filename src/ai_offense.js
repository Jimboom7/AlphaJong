//################################
// AI OFFENSE
// Offensive part of the AI
//################################

//Look at Hand etc. and decide for a strategy.
function determineStrategy() {

	if (strategy != STRATEGIES.FOLD) {
		var handTriples = parseInt(getTriples(getHandWithCalls(ownHand)).length / 3);
		var pairs = getPairsAsArray(ownHand).length / 2;

		if ((pairs == 6 || (pairs >= CHIITOITSU && handTriples < 2)) && isClosed) {
			strategy = STRATEGIES.CHIITOITSU;
			strategyAllowsCalls = false;
		}
		else if (canDoThirteenOrphans()) {
			strategy = STRATEGIES.THIRTEEN_ORPHANS;
			strategyAllowsCalls = false;
		}
		else {
			if (strategy == STRATEGIES.THIRTEEN_ORPHANS ||
				strategy == STRATEGIES.CHIITOITSU) {
				strategyAllowsCalls = true; //Don't reset this value when bot is playing defensively without a full fold
			}
			strategy = STRATEGIES.GENERAL;
		}
	}
	log("Strategy: " + strategy);
}

//Call a Chi/Pon
//combination example: Array ["6s|7s", "7s|9s"]
async function callTriple(combinations, operation) {

	log("Consider call on " + getTileName(getTileForCall()));

	var handValue = getHandValues(ownHand);

	if (!strategyAllowsCalls && (tilesLeft > 4 || handValue.shanten > 1)) { //No Calls allowed
		log("Strategy allows no calls! Declined!");
		declineCall(operation);
		return false;
	}

	//Find best Combination
	var comb = -1;
	var bestCombShanten = 9;
	var bestDora = 0;

	for (var i = 0; i < combinations.length; i++) {
		var callTiles = combinations[i].split("|");
		callTiles = callTiles.map(t => getTileFromString(t));

		var newHand = removeTilesFromTileArray(ownHand, callTiles);
		var newHandTriples = getTriplesAndPairs(newHand);
		var doubles = getDoubles(removeTilesFromTileArray(newHand, newHandTriples.triples.concat(newHandTriples.pairs)));
		var shanten = calculateShanten(parseInt(newHandTriples.triples.length / 3), parseInt(newHandTriples.pairs.length / 2), parseInt(doubles.length / 2));

		if (shanten < bestCombShanten || (shanten == bestCombShanten && getNumberOfDoras(callTiles) > bestDora)) {
			comb = i;
			bestDora = getNumberOfDoras(callTiles);
			bestCombShanten = shanten;
		}
	}

	log("Best Combination: " + combinations[comb]);

	var callTiles = combinations[comb].split("|");
	callTiles = callTiles.map(t => getTileFromString(t));

	var wasClosed = isClosed;
	calls[0].push(callTiles[0]); //Simulate "Call" for hand value calculation
	calls[0].push(callTiles[1]);
	calls[0].push(getTileForCall());
	isClosed = false;
	newHand = removeTilesFromTileArray(ownHand, callTiles); //Remove called tiles from hand
	var tilePrios = await getTilePriorities(newHand);
	tilePrios = sortOutUnsafeTiles(tilePrios);
	var nextDiscard = getDiscardTile(tilePrios); //Calculate next discard
	newHand = removeTilesFromTileArray(newHand, [nextDiscard]); //Remove discard from hand
	var newHandValue = getHandValues(newHand, nextDiscard); //Get Value of that hand
	newHandTriples = getTriplesAndPairs(newHand); //Get Triples, to see if discard would make the hand worse
	calls[0].pop();
	calls[0].pop();
	calls[0].pop();
	isClosed = wasClosed;

	var newHonorPairs = newHandTriples.pairs.filter(t => t.type == 3).length / 2;
	var newPairs = newHandTriples.pairs.length / 2;

	if (isSameTile(nextDiscard, getTileForCall()) ||
		(callTiles[0].index == getTileForCall() - 2 && isSameTile(nextDiscard, { index: callTiles[0].index - 1, type: callTiles[0].type })) ||
		(callTiles[1].index == getTileForCall() + 2 && isSameTile(nextDiscard, { index: callTiles[1].index + 1, type: callTiles[1].type }))) {
		declineCall(operation);
		log("Next discard would be the same tile. Call declined!");
		return false;
	}

	if (strategy == STRATEGIES.FOLD || tilePrios.filter(t => t.safe).length == 0) {
		log("Would fold next discard! Declined!");
		declineCall(operation);
		return false;
	}

	if (tilesLeft <= 4 && handValue.shanten == 1 && newHandValue.shanten == 0) { //Call to get tenpai at end of game
		log("Accept call to be tenpai at end of game!");
		makeCallWithOption(operation, comb);
		return true;
	}

	if (newHandValue.yaku.open < 0.15 && //Yaku chance is too bad
		newHandTriples.pairs.filter(t => isValueTile(t) && getNumberOfTilesAvailable(t.index, t.type) >= 2).length < 2) { //And no value honor pair
		log("Not enough Yaku! Declined! " + newHandValue.yaku.open + " < 0.15");
		declineCall(operation);
		return false;
	}

	if (handValue.waits > 0 && newHandValue.waits < handValue.waits + 1) { //Call results in worse waits 
		log("Call would result in less waits! Declined!");
		declineCall(operation);
		return false;
	}

	if (isClosed && newHandValue.score.open < 1500 - (CALL_PON_CHI * 200) && newHandValue.shanten >= 2 + CALL_PON_CHI && seatWind != 1 &&// Hand is worthless and slow and not dealer. Should prevent cheap yakuhai or tanyao calls
		!(newHonorPairs >= 1 && newPairs >= 2)) {
		log("Hand is cheap and slow! Declined!");
		declineCall(operation);
		return false;
	}

	if (newHandValue.shanten > handValue.shanten) { //Call would make shanten worse
		log("Call would increase shanten! Declined!");
		declineCall(operation);
		return false;
	}
	else if (newHandValue.shanten == handValue.shanten) { //When it does not improve shanten
		if (!isClosed && newHandValue.priority > handValue.priority * 1.1) { //When the call improves the hand
			log("Call accepted because hand is already open and it improves the hand!");
		}
		else {
			declineCall(operation);
			log("Call declined because it does not benefit the hand!");
			return false;
		}
	}
	else { //When it improves shanten
		var isBadWait = (callTiles[0].index == callTiles[1].index || Math.abs(callTiles[0].index - callTiles[1].index) == 2 || // Pon or Kanchan
			callTiles[0].index >= 8 && callTiles[1].index >= 8 || callTiles[0].index <= 2 && callTiles[1].index <= 2); //Penchan

		if (handValue.shanten >= 5 - CALL_PON_CHI && seatWind == 1) { //Very slow hand & dealer? -> Go for a fast win
			log("Call accepted because of slow hand and dealer position!");
		}
		else if (!isClosed && newHandValue.score.open > handValue.score.open * 0.9) { //Hand is already open and it reduces shanten while not much value is lost 
			log("Call accepted because hand is already open!");
		}
		else if (newHandValue.score.open >= 4500 - (CALL_PON_CHI * 500) &&
			newHandValue.score.open > handValue.score.closed * 0.7) { //High value hand? -> Go for a fast win
			log("Call accepted because of high value hand!");
		}
		else if (newHandValue.score.open >= handValue.score.closed * 1.75 && //Call gives additional value to hand
			((newHandValue.score.open >= (2000 - (CALL_PON_CHI * 200) - ((3 - newHandValue.shanten) * 200))) / (seatWind == 1 ? 1.5 : 1) || //And either hand is not extremely cheap...
				newHonorPairs >= 1)) { //Or there are some honor pairs in hand (=can be called easily or act as safe discards)
			log("Call accepted because it boosts the value of the hand!");
		}
		else if (newHandValue.score.open > handValue.score.open * 0.9 && //Call loses not much value
			newHandValue.score.open > handValue.score.closed * 0.7 &&
			((isBadWait && (newHandValue.score.open >= (1000 - (CALL_PON_CHI * 100) - ((3 - newHandValue.shanten) * 100)) / (seatWind == 1 ? 1.5 : 1))) || // And it's a bad wait while the hand is not extremely cheap
				(!isBadWait && (newHandValue.score.open >= (2000 - (CALL_PON_CHI * 200) - ((3 - newHandValue.shanten) * 200)) / (seatWind == 1 ? 1.5 : 1))) || //Or it was a good wait and the hand is at least a bit valuable
				newHonorPairs >= 2) && //Or multiple honor pairs
			((newHandTriples.pairs.filter(t => isValueTile(t) && getNumberOfTilesAvailable(t.index, t.type) >= 1)).length >= 2 && (newPairs >= 2 || newHandValue.shanten > 1))) {//And would open hand anyway with honor call
			log("Call accepted because it reduces shanten!");
		}
		else if (newHandValue.shanten == 0 && newHandValue.score.open > handValue.score.closed * 0.9 &&
			newHandValue.waits > 2 && isBadWait) {// Make hand ready and eliminate a bad wait
			log("Call accepted because it eliminates a bad wait and makes the hand ready!");
		}
		else if ((0.5 - (tilesLeft / getWallSize())) +
			(0.5 - (newHandValue.shanten / 2)) +
			(((newPairs) - newHandValue.shanten - 0.5) / 4) +
			((newHandValue.score.open / 1500) - 1) +
			(((newHandValue.score.open / handValue.score.closed) / 2) - 0.5) +
			(isBadWait - 0.5) >=
			1 - (CALL_PON_CHI / 2)) { //The call is good in multiple aspects
			log("Call accepted because it's good in multiple aspects");
		}
		else { //Decline
			declineCall(operation);
			log("Call declined because it does not benefit the hand!");
			return false;
		}
	}

	makeCallWithOption(operation, comb);
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

	if (isPlayerRiichi(0) ||
		(strategyAllowsCalls &&
			tiles.shanten <= (tilesLeft / (getWallSize() / 2)) + CALL_KAN &&
			getCurrentDangerLevel() < 1000 + (CALL_KAN * 500) &&
			tiles.shanten <= newTiles.shanten &&
			tiles.efficiency * 0.9 <= newTiles.efficiency)) {
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
		if (getNumberOfTilesInTileArray(ownHand, 4, 3) > 1) { //More than one north tile: Check if it's okay to call kita
			var handValue = getHandValues(ownHand);
			var newHandValue = getHandValues(removeTilesFromTileArray(ownHand, [{ index: 4, type: 3, dora: false }]));
			if (handValue.shanten <= 1 && newHandValue.shanten > handValue.shanten) {
				return false;
			}
		}
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
	if (handValue.shanten >= 4) { //Hand is bad -> abort game
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
				if (shouldRiichi(tile)) {
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

//Discard the safest tile, but consider slightly riskier tiles with same shanten
function discardFold(tiles) {
	if (strategy != STRATEGIES.FOLD) { //Not in full Fold mode yet: Discard a relatively safe tile with high priority
		for (let tile of tiles) {
			var foldThreshold = getFoldThreshold(tile, ownHand);
			if (tile.shanten == Math.min(...tiles.map(t => t.shanten)) && //If next tile same shanten as the best tile
				tile.danger < Math.min(...tiles.map(t => t.danger)) * 1.1 && //And the tile is not much more dangerous than the safest tile
				tile.danger <= foldThreshold * 2) {
				log("Tile Priorities: ");
				printTilePriority(tiles);
				discardTile(tile.tile);
				return tile.tile;
			}
		}
		// No safe tile with good shanten found: Full Fold.
		log("Hand is very dangerous, full fold.");
		strategyAllowsCalls = false;
	}

	tiles.sort(function (p1, p2) {
		return p1.danger - p2.danger;
	});
	log("Fold Tile Priorities: ");
	printTilePriority(tiles);

	discardTile(tiles[0].tile);
	return tiles[0].tile;
}

//Remove the given Tile from Hand
function discardTile(tile) {
	if (!tile.valid) {
		return;
	}
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

//Simulates discarding every tile and calculates hand value.
//Asynchronous to give the browser time to "breath"
async function getTilePriorities(inputHand) {

	if (isDebug()) {
		log("Dora: " + getTileName(dora[0]));
		printHand(inputHand);
	}

	var tiles = [];
	if (strategy == STRATEGIES.CHIITOITSU) {
		tiles = chiitoitsuPriorities();
	}
	else if (strategy == STRATEGIES.THIRTEEN_ORPHANS) {
		tiles = thirteenOrphansPriorities();
	}
	else {
		for (var i = 0; i < inputHand.length; i++) { //Create 13 Tile hands

			var hand = [...inputHand];
			hand.splice(i, 1);

			if (tiles.filter(t => isSameTile(t.tile, inputHand[i], true)).length > 0) { //Skip same tiles in hand
				continue;
			}

			tiles.push(getHandValues(hand, inputHand[i]));

			await new Promise(r => setTimeout(r, 10)); //Sleep a short amount of time to not completely block the browser
		}
	}

	tiles.sort(function (p1, p2) {
		return p2.priority - p1.priority;
	});
	return Promise.resolve(tiles);
}

/*
Calculates Values for all tiles in the hand.
As the Core of the AI this function is really complex. The simple explanation:
It simulates the next two turns, calculates all the important stuff (shanten, dora, yaku, waits etc.) and produces a priority for each tile based on the expected value/shanten in two turns.

In reality it would take far too much time to calculate all the possibilites (availableTiles * (availableTiles - 1) * 2 which can be up to 30000 possibilities).
Therefore most of the complexity comes from tricks to reduce the runtime:
At first all the tiles are computed that could improve the hand in the next two turns (which is usually less than 1000).
Duplicates (for example 3m -> 4m and 4m -> 3m) are marked and will only be computed once, but with twice the value.
The rest is some math to produce the same result which would result in actually simulating everything (like adding the original value of the hand for all the useless combinations).
*/
function getHandValues(hand, discardedTile) {
	var shanten = 8; //No check for Chiitoitsu in this function, so this is maximum

	var callTriples = parseInt(getTriples(calls[0]).length / 3);

	var triplesAndPairs = getTriplesAndPairs(hand);

	var triples = triplesAndPairs.triples;
	var pairs = triplesAndPairs.pairs;
	var doubles = getDoubles(removeTilesFromTileArray(hand, triples.concat(pairs)));

	var baseShanten = calculateShanten(parseInt(triples.length / 3) + callTriples, parseInt(pairs.length / 2), parseInt(doubles.length / 2));

	if (typeof discardedTile != 'undefined') { //When deciding whether to call for a tile there is no discarded tile in the evaluation
		hand.push(discardedTile); //Calculate original values
		var originalCombinations = getTriplesAndPairs(hand);
		var originalTriples = originalCombinations.triples;
		var originalPairs = originalCombinations.pairs;
		var originalDoubles = getDoubles(removeTilesFromTileArray(hand, originalTriples.concat(originalPairs)));

		var originalShanten = calculateShanten(parseInt(originalTriples.length / 3) + callTriples, parseInt(originalPairs.length / 2), parseInt(originalDoubles.length / 2));
		hand.pop();
	}
	else {
		var originalShanten = baseShanten;
	}

	var expectedScore = { open: 0, closed: 0, riichi: 0 }; //For the expected score (only looking at hands that improve the current hand)
	var yaku = { open: 0, closed: 0 }; //Expected Yaku
	var doraValue = 0; //Expected Dora
	var waits = 0; //Waits when in Tenpai (Or fractions of it when 1 shanten)
	var fu = 0;

	var kita = 0;
	if (getNumberOfPlayers() == 3) {
		kita = getNumberOfKitaOfPlayer(0) * getTileDoraValue({ index: 4, type: 3 });
	}

	var waitTiles = [];
	var tileCombinations = []; //List of combinations for second step to save calculation time

	// STEP 1: Create List of combinations of tiles that can improve the hand
	var newTiles1 = getUsefulTilesForDouble(hand); //For every tile: Find tiles that make them doubles or triples
	for (let newTile of newTiles1) {

		var numberOfTiles1 = getNumberOfTilesAvailable(newTile.index, newTile.type);
		if (numberOfTiles1 <= 0) { //Skip if tile is dead
			continue;
		}

		hand.push(newTile);
		var newTiles2 = getUsefulTilesForDouble(hand).filter(t => getNumberOfTilesAvailable(t.index, t.type) > 0);
		if (PERFORMANCE_MODE - timeSave <= 1) { //In Low Spec Mode: Ignore some combinations that are unlikely to improve the hand -> Less calculation time
			newTiles2 = getUsefulTilesForTriple(hand).filter(t => getNumberOfTilesAvailable(t.index, t.type) > 0);
			if (PERFORMANCE_MODE - timeSave <= 0) { //Ignore even more tiles for extremenly low spec...
				newTiles2 = newTiles2.filter(t => t.type == newTile.type);
			}
		}

		var newTiles2Objects = [];
		for (let t of newTiles2) {
			var dupl1 = tileCombinations.find(tc => isSameTile(tc.tile1, t)); //Check if combination is already in the array
			var skip = false;
			if (typeof dupl1 != 'undefined') {
				var duplicateCombination = dupl1.tiles2.find(t2 => isSameTile(t2.tile2, newTile));
				if (typeof duplicateCombination != 'undefined') { //If already exists: Set flag to count it twice and set flag to skip the current one
					duplicateCombination.duplicate = true;
					skip = true;
				}
			}
			newTiles2Objects.push({ tile2: t, winning: false, furiten: false, triplesAndPairs: null, duplicate: false, skip: skip });
		}

		tileCombinations.push({ tile1: newTile, tiles2: newTiles2Objects, winning: false, furiten: false, triplesAndPairs: null });
		hand.pop();
	}

	//STEP 2: Check if some of these tiles or combinations are winning or in furiten. We need to know this in advance for Step 3
	for (let tileCombination of tileCombinations) {
		//Simulate only the first tile drawn for now
		var tile1 = tileCombination.tile1;
		hand.push(tile1);

		var triplesAndPairs2 = getTriplesAndPairs(hand);

		var winning = isWinningHand(parseInt((triplesAndPairs2.triples.length / 3)) + callTriples, triplesAndPairs2.pairs.length / 2);
		if (winning) {
			waitTiles.push(tile1);
			//Mark this tile in other combinations as not duplicate and no skip
			for (let tc of tileCombinations) {
				tc.tiles2.forEach(function (t2) {
					if (isSameTile(tile1, t2.tile2)) {
						t2.duplicate = false;
						t2.skip = false;
					}
				});
			}
		}
		var furiten = (winning && (isTileFuriten(tile1.index, tile1.type) || isSameTile(discardedTile, tile1)));
		tileCombination.winning = winning;
		tileCombination.furiten = furiten;
		tileCombination.triplesAndPairs = triplesAndPairs2; //The triplesAndPairs function is really slow, so save this result for later

		hand.pop();
	}

	var tile1Furiten = tileCombinations.filter(t => t.furiten).length > 0;
	for (let tileCombination of tileCombinations) { //Now again go through all the first tiles, but also the second tiles
		hand.push(tileCombination.tile1);
		for (let tile2Data of tileCombination.tiles2) {
			if (tile2Data.skip || (tileCombination.winning && !tile1Furiten)) { //Ignore second tile if marked as skip(is a duplicate) or already winning with tile 1
				continue;
			}
			hand.push(tile2Data.tile2);

			var triplesAndPairs3 = getTriplesAndPairs(hand);

			var winning2 = isWinningHand(parseInt((triplesAndPairs3.triples.length / 3)) + callTriples, triplesAndPairs3.pairs.length / 2);
			var furiten2 = winning2 && (isTileFuriten(tile2Data.tile2.index, tile2Data.tile2.type) || isSameTile(discardedTile, tile2Data.tile2));
			tile2Data.winning = winning2;
			tile2Data.furiten = furiten2;
			tile2Data.triplesAndPairs = triplesAndPairs3;

			hand.pop();
		}
		hand.pop();
	}

	var numberOfTotalCombinations = 0;
	var numberOfTotalWaitCombinations = 0;

	//STEP 3: Check the values when these tiles are drawn.
	for (let tileCombination of tileCombinations) {
		var tile1 = tileCombination.tile1;
		var numberOfTiles1 = getNumberOfTilesAvailable(tile1.index, tile1.type);

		//Simulate only the first tile drawn for now
		hand.push(tile1);

		var triplesAndPairs2 = tileCombination.triplesAndPairs;
		var triples2 = triplesAndPairs2.triples;
		var pairs2 = triplesAndPairs2.pairs;

		if (!isClosed && (!tileCombination.winning || tile1Furiten) &&
			getNumberOfTilesInTileArray(triples2, tile1.index, tile1.type) == 3) {
			numberOfTiles1 *= 2; //More value to possible triples when hand is open (can call pons from all players)
		}

		var factor;
		var thisShanten = 8;
		if (tileCombination.winning && !tile1Furiten) { //Hand is winning: Add the values of the hand for most possible ways to draw this:
			factor = numberOfTiles1 * (availableTiles.length - 1); //Number of ways to draw this tile first and then any of the other tiles
			//Number of ways to draw a random tile which we don't have in the array and then the winning tile. We only look at the "good tile -> winning tile" combination later.
			factor += (availableTiles.length - tileCombinations.reduce((pv, cv) => pv + getNumberOfTilesAvailable(cv.tile1.index, cv.tile1.type), 0)) * numberOfTiles1;
			thisShanten = (-1 - baseShanten);
		}
		else { // This tile is not winning
			// For all the tiles we don't consider as a second draw (because they're useless): The shanten value for this tile -> useless tile is just the value after the first draw
			var doubles2 = getDoubles(removeTilesFromTileArray(hand, triples2.concat(pairs2)));
			factor = numberOfTiles1 * ((availableTiles.length - 1) - tileCombination.tiles2.reduce(function (pv, cv) { // availableTiles - useful tiles (which we will check later)
				if (isSameTile(tile1, cv.tile2)) {
					return pv + getNumberOfTilesAvailable(cv.tile2.index, cv.tile2.type) - 1;
				}
				return pv + getNumberOfTilesAvailable(cv.tile2.index, cv.tile2.type);
			}, 0));
			if (tile1Furiten) {
				thisShanten = (0 - baseShanten);
			}
			else {
				thisShanten = (calculateShanten(parseInt(triples2.length / 3) + callTriples, parseInt(pairs2.length / 2), parseInt(doubles2.length / 2)) - baseShanten);
			}
		}

		shanten += thisShanten * factor;

		if (tileCombination.winning) { //For winning tiles: Add waits, fu and the Riichi value
			var thisDora = getNumberOfDoras(triples2.concat(pairs2, calls[0]));
			var thisYaku = getYaku(hand, calls[0], triplesAndPairs2);
			var thisWait = numberOfTiles1 * getWaitQuality(tile1);
			var thisFu = calculateFu(triples2, calls[0], pairs2, removeTilesFromTileArray(hand, triples.concat(pairs).concat(tile1)), tile1);
			if (!tile1Furiten && (isClosed || thisYaku.open >= 1 || tilesLeft <= 4)) {
				waits += thisWait;
				fu += thisFu * thisWait * factor;
				if (thisFu == 30 && isClosed) {
					thisYaku.closed += 1;
				}
				doraValue += thisDora * factor;
				yaku.open += thisYaku.open * factor;
				yaku.closed += thisYaku.closed * factor;
				expectedScore.open += calculateScore(0, thisYaku.open + thisDora + kita, thisFu) * factor;
				expectedScore.closed += calculateScore(0, thisYaku.closed + thisDora + kita, thisFu) * factor;
				numberOfTotalCombinations += factor;
			}

			expectedScore.riichi += calculateScore(0, thisYaku.closed + thisDora + kita + 1 + 0.2 + getUradoraChance(), thisFu) * thisWait * factor;
			numberOfTotalWaitCombinations += factor * thisWait;
			if (!tile1Furiten) {
				hand.pop();
				continue; //No need to check this tile in combination with any of the other tiles, if this is drawn first and already wins
			}
		}

		var tile2Furiten = tileCombination.tiles2.filter(t => t.furiten).length > 0;

		for (let tile2Data of tileCombination.tiles2) {//Look at second tiles if not already winning
			var tile2 = tile2Data.tile2;
			var numberOfTiles2 = getNumberOfTilesAvailable(tile2.index, tile2.type);
			if (isSameTile(tile1, tile2)) {
				if (numberOfTiles2 == 1) {
					continue;
				}
				numberOfTiles2--;
			}

			if (tile2Data.skip) {
				continue;
			}

			var combFactor = numberOfTiles1 * numberOfTiles2; //Number of ways to draw tile 1 first and then tile 2
			if (tile2Data.duplicate) {
				combFactor *= 2;
			}

			hand.push(tile2); //Simulate second draw

			var triplesAndPairs3 = tile2Data.triplesAndPairs;
			var triples3 = triplesAndPairs3.triples;
			var pairs3 = triplesAndPairs3.pairs;

			var thisShanten = 8;
			var winning = isWinningHand(parseInt((triples3.length / 3)) + callTriples, pairs3.length / 2);

			var thisDora = getNumberOfDoras(triples3.concat(pairs3, calls[0]));
			var thisYaku = getYaku(hand, calls[0], triplesAndPairs3);

			if (!isClosed && (!winning || tile2Furiten) &&
				getNumberOfTilesInTileArray(triples3, tile2.index, tile2.type) == 3) {
				combFactor *= 2; //More value to possible triples when hand is open (can call pons from all players)
			}

			if (winning && !tile2Furiten) { //If this tile combination wins in 2 turns: calculate waits etc.
				thisShanten = -1 - baseShanten;
				if (waitTiles.filter(t => isSameTile(t, tile2)).length == 0) {
					var newWait = numberOfTiles2 * getWaitQuality(tile2) * ((numberOfTiles1) / availableTiles.length);
					if (tile2Data.duplicate) {
						newWait += numberOfTiles1 * getWaitQuality(tile1) * ((numberOfTiles2) / availableTiles.length);
					}
					waits += newWait;
				}

				var secondDiscard = removeTilesFromTileArray(hand, triples3.concat(pairs3))[0];
				if (!tile2Data.duplicate) {
					var newFu = calculateFu(triples3, calls[0], pairs3, removeTilesFromTileArray(hand, triples.concat(pairs).concat(tile2).concat(secondDiscard)), tile2);
					if (newFu == 30 && isClosed) {
						thisYaku.closed += 1;
					}
				}
				else { //Calculate Fu for drawing both tiles in different orders
					var newFu = calculateFu(triples3, calls[0], pairs3, removeTilesFromTileArray(hand, triples.concat(pairs).concat(tile2).concat(secondDiscard)), tile2);
					var newFu2 = calculateFu(triples3, calls[0], pairs3, removeTilesFromTileArray(hand, triples.concat(pairs).concat(tile1).concat(secondDiscard)), tile1);
					if (newFu == 30 && isClosed) {
						thisYaku.closed += 0.5;
					}
					if (newFu2 == 30 && isClosed) {
						thisYaku.closed += 0.5;
					}
				}
			}
			else { //Not winning? Calculate shanten correctly
				if (winning && (tile2Furiten || (!isClosed && thisYaku.open < 1))) { //Furiten/No Yaku: We are 0 shanten
					thisShanten = 0 - baseShanten;
				}
				else {
					var numberOfDoubles = getDoubles(removeTilesFromTileArray(hand, triples3.concat(pairs3))).length;
					var numberOfPairs = pairs3.length;
					thisShanten = calculateShanten(parseInt(triples3.length / 3) + callTriples, parseInt(numberOfPairs / 2), parseInt(numberOfDoubles / 2)) - baseShanten;
					if (thisShanten == -1) {  //Give less prio to tile combinations that only improve the hand by 1 shanten in two turns.
						thisShanten = -0.5;
					}
				}
			}
			shanten += thisShanten * combFactor;

			if (winning || thisShanten < 0) {
				doraValue += thisDora * combFactor;
				yaku.open += thisYaku.open * combFactor;
				yaku.closed += thisYaku.closed * combFactor;
				expectedScore.open += calculateScore(0, thisYaku.open + thisDora + kita) * combFactor;
				expectedScore.closed += calculateScore(0, thisYaku.closed + thisDora + kita) * combFactor;
				numberOfTotalCombinations += combFactor;
			}

			hand.pop();
		}

		hand.pop();
	}

	var allCombinations = availableTiles.length * (availableTiles.length - 1);
	shanten /= allCombinations; //Divide by total amount of possible draw combinations

	if (numberOfTotalCombinations > 0) {
		expectedScore.open /= numberOfTotalCombinations; //Divide by the total combinations we checked, to get the average expected value
		expectedScore.closed /= numberOfTotalCombinations;
		doraValue /= numberOfTotalCombinations;
		yaku.open /= numberOfTotalCombinations;
		yaku.closed /= numberOfTotalCombinations;
	}
	if (numberOfTotalWaitCombinations > 0) {
		expectedScore.riichi /= numberOfTotalWaitCombinations;
		fu /= numberOfTotalWaitCombinations;
	}

	fu = fu <= 30 ? 30 : fu;
	fu = fu > 110 ? 30 : fu;

	var efficiency = (shanten + (baseShanten - originalShanten)) * -1; //Percent Number that indicates how big the chance is to improve the hand (in regards to efficiency). Negative for increasing shanten with the discard
	if (originalShanten == 0) { //Already in Tenpai: Look at waits instead
		efficiency = waits / 10;
	}

	if (baseShanten > 0) { //When not tenpai
		expectedScore.riichi = calculateScore(0, yaku.closed + doraValue + kita + 1 + 0.2 + getUradoraChance());
	}

	var danger = 0;
	var sakigiri = 0;
	if (typeof discardedTile != 'undefined') { //When deciding whether to call for a tile there is no discarded tile in the evaluation
		danger = getTileDanger(discardedTile);
		sakigiri = getSakigiriValue(hand, discardedTile);
	}

	var priority = calculateTilePriority(efficiency, expectedScore, danger - sakigiri);
	return {
		tile: discardedTile, priority: priority, shanten: baseShanten, efficiency: efficiency,
		score: expectedScore, dora: doraValue, yaku: yaku, waits: waits, danger: danger, fu: fu
	};
}

//Calculates a relative priority based on how "good" the given values are.
//The resulting priority value is useless as an absolute value, only use it relatively to compare with other values of the same hand.
function calculateTilePriority(efficiency, expectedScore, danger) {
	var score = expectedScore.open;
	if (isClosed) {
		score = expectedScore.closed;
	}

	var placementFactor = 1;

	if (isLastGame() && getDistanceToFirst() < 0) { //First Place in last game:
		placementFactor = 1.5;
	}

	//Basically the formula should be efficiency multiplied by score (=expected value of the hand)
	//But it's generally better to just win even with a small score to prevent others from winning (and no-ten penalty) 
	//That's why efficiency is weighted a bit higher with Math.pow.
	var weightedEfficiency = Math.pow(Math.abs(efficiency), 0.3 + EFFICIENCY * placementFactor);
	weightedEfficiency = efficiency < 0 ? -weightedEfficiency : weightedEfficiency;

	score -= (danger * 2 * SAFETY);

	if (weightedEfficiency < 0) { //Hotfix for negative efficiency (increasing shanten)
		score = 50000 - score;
	}

	return weightedEfficiency * score;
}

//Get Chiitoitsu Priorities -> Look for Pairs
function chiitoitsuPriorities() {

	var tiles = [];

	var originalPairs = getPairsAsArray(ownHand);

	var originalShanten = 6 - (originalPairs.length / 2);

	for (var i = 0; i < ownHand.length; i++) { //Create 13 Tile hands, check for pairs
		var newHand = [...ownHand];
		newHand.splice(i, 1);
		var pairs = getPairsAsArray(newHand);
		var pairsValue = pairs.length / 2;
		var handWithoutPairs = removeTilesFromTileArray(newHand, pairs);

		var baseDora = getNumberOfDoras(pairs);
		var doraValue = 0;
		var baseShanten = 6 - pairsValue;

		var waits = 0;
		var shanten = 0;

		var baseYaku = getYaku(newHand, calls[0]);
		var yaku = { open: 0, closed: 0 };

		//Possible Value, Yaku and Dora after Draw
		handWithoutPairs.forEach(function (tile) {
			var currentHand = [...handWithoutPairs];
			currentHand.push(tile);
			var numberOfTiles = getNumberOfNonFuritenTilesAvailable(tile.index, tile.type);
			var chance = (numberOfTiles + (getWaitQuality(tile) / 10)) / availableTiles.length;
			var pairs2 = getPairsAsArray(currentHand);
			if (pairs2.length > 0) { //If the tiles improves the hand: Calculate the expected values
				shanten += ((6 - (pairsValue + (pairs2.length / 2))) - baseShanten) * chance;
				doraValue += getNumberOfDoras(pairs2) * chance;
				var y2 = getYaku(currentHand.concat(pairs), calls[0]);
				yaku.open += (y2.open - baseYaku.open) * chance;
				yaku.closed += (y2.closed - baseYaku.closed) * chance;
				if (pairsValue + (pairs2.length / 2) == 7) { //Winning hand
					waits = numberOfTiles * getWaitQuality(tile);
					doraValue = getNumberOfDoras(pairs2);
				}
			}
		});
		doraValue += baseDora;
		yaku.open += baseYaku.open;
		yaku.closed += baseYaku.closed + 2; //Add Chiitoitsu manually
		if (getNumberOfPlayers() == 3) {
			doraValue += getNumberOfKitaOfPlayer(0) * getTileDoraValue({ index: 4, type: 3 });
		}

		var expectedScore = {
			open: 1000, closed: calculateScore(0, yaku.closed + doraValue, 25),
			riichi: calculateScore(0, yaku.closed + doraValue + 1 + 0.2 + getUradoraChance(), 25)
		};

		var efficiency = (shanten + (baseShanten - originalShanten)) * -1;
		if (originalShanten == 0) { //Already in Tenpai: Look at waits instead
			efficiency = waits / 10;
		}
		var danger = getTileDanger(ownHand[i]);

		var sakigiri = getSakigiriValue(newHand, ownHand[i]);

		var priority = calculateTilePriority(efficiency, expectedScore, danger - sakigiri);
		tiles.push({
			tile: ownHand[i], priority: priority, shanten: baseShanten, efficiency: efficiency,
			score: expectedScore, dora: doraValue, yaku: yaku, waits: waits, danger: danger, fu: 25
		});
	}

	return tiles;
}

//Get Thirteen Orphans Priorities -> Look for Honors/1/9
//Returns Array of tiles with priorities (value, danger etc.)
function thirteenOrphansPriorities() {

	var originalOwnTerminalHonors = getAllTerminalHonorFromHand(ownHand);
	// Filter out all duplicate terminal/honors
	var originalUniqueTerminalHonors = [];
	originalOwnTerminalHonors.forEach(tile => {
		if (!originalUniqueTerminalHonors.some(otherTile => tile.index == otherTile.index && tile.type == otherTile.type)) {
			originalUniqueTerminalHonors.push(tile);
		}
	});
	var originalShanten = 13 - originalUniqueTerminalHonors.length;
	if (originalOwnTerminalHonors.length > originalUniqueTerminalHonors.length) { //At least one terminal/honor twice
		originalShanten -= 1;
	}

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
		var shanten = 13 - uniqueTerminalHonors.length;
		if (ownTerminalHonors.length > uniqueTerminalHonors.length) { //At least one terminal/honor twice
			shanten -= 1;
		}
		var doraValue = getNumberOfDoras(hand);
		var yaku = { open: 13, closed: 13 };
		var waits = 0;
		if (shanten == 0) {
			var missingTile = getMissingTilesForThirteenOrphans(uniqueTerminalHonors)[0];
			waits = getNumberOfNonFuritenTilesAvailable(missingTile.index, missingTile.type);
		}

		var efficiency = shanten == originalShanten ? 1 : 0;
		var danger = getTileDanger(ownHand[i]);
		var sakigiri = getSakigiriValue(hand, ownHand[i], danger);
		var yakuman = calculateScore(0, 13);
		var expectedScore = { open: 0, closed: yakuman, riichi: yakuman };
		var priority = calculateTilePriority(efficiency, expectedScore, danger - sakigiri);

		tiles.push({
			tile: ownHand[i], priority: priority, shanten: shanten, efficiency: efficiency,
			score: expectedScore, dora: doraValue, yaku: yaku, waits: waits, danger: danger, fu: 30
		});

	}

	return tiles;
}

// Used during the match to see if its still viable to go for thirteen orphans.
function canDoThirteenOrphans() {

	// PARAMETERS
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
	var missingOrphans = getMissingTilesForThirteenOrphans(uniqueTerminalHonors);

	if (missingOrphans.length == 1) {
		max_missing_orphans_count = 3;
	}

	// Check if there are enough required orphans in the pool.
	for (let uniqueOrphan of missingOrphans) {
		if (4 - getNumberOfNonFuritenTilesAvailable(uniqueOrphan.index, uniqueOrphan.type) > max_missing_orphans_count) {
			return false;
		}
	}

	return true;
}

//Return a list of missing tiles for thirteen orphans
function getMissingTilesForThirteenOrphans(uniqueTerminalHonors) {
	var thirteen_orphans_set = "19m19p19s1234567z";
	var thirteenOrphansTiles = getTilesFromString(thirteen_orphans_set);
	return thirteenOrphansTiles.filter(tile => !uniqueTerminalHonors.some(otherTile => tile.index == otherTile.index && tile.type == otherTile.type));
}


//Discards the "best" tile
async function discard() {

	var tiles = await getTilePriorities(ownHand);
	tiles = sortOutUnsafeTiles(tiles);

	if (KEEP_SAFETILE) {
		tiles = keepSafetile(tiles);
	}

	if (strategy == STRATEGIES.FOLD || tiles.filter(t => t.safe).length == 0) {
		return discardFold(tiles);
	}

	log("Tile Priorities: ");
	printTilePriority(tiles);

	var tile = getDiscardTile(tiles);

	if (canRiichi()) {
		callRiichi(tiles);
	}
	else {
		discardTile(tile);
	}

	return tile;
}

//Check all tiles for enough safety
function sortOutUnsafeTiles(tiles) {
	for (let tile of tiles) {
		if (tile == tiles[0]) {
			var highestPrio = true;
		}
		else {
			var highestPrio = false;
		}
		if (shouldFold(tile, highestPrio)) {
			tile.safe = 0;
		}
		else {
			tile.safe = 1;
		}
	}
	tiles = tiles.sort(function (p1, p2) {
		return p2.safe - p1.safe;
	});
	return tiles;
}

//If there is only 1 safetile in hand, don't discard it.
function keepSafetile(tiles) {
	if (getCurrentDangerLevel() > 2000 || tiles[0].shanten <= 1) { //Don't keep a safetile when it's too dangerous or hand is close to tenpai
		return tiles;
	}
	var safeTiles = 0;
	for (let t of tiles) {
		if (isSafeTile(1, t.tile) && isSafeTile(2, t.tile) && (getNumberOfPlayers() == 3 || isSafeTile(3, t.tile))) {
			safeTiles++;
		}
	}
	if (safeTiles > 1) {
		return tiles;
	}

	if (getNumberOfPlayers() == 3) {
		var tilesSafety = tiles.map(t => getWaitScoreForTileAndPlayer(1, t.tile, false) +
			getWaitScoreForTileAndPlayer(2, t.tile, false));
	}
	else {
		var tilesSafety = tiles.map(t => getWaitScoreForTileAndPlayer(1, t.tile, false) +
			getWaitScoreForTileAndPlayer(2, t.tile, false) +
			getWaitScoreForTileAndPlayer(3, t.tile, false));
	}

	var safetileIndex = tilesSafety.indexOf(Math.min(...tilesSafety));

	tiles.push(tiles.splice(safetileIndex, 1)[0]);

	return tiles;
}

//Input: Tile Priority List
//Output: Best Tile to discard. Usually the first tile in the list, but for open hands a valid yaku is taken into account
function getDiscardTile(tiles) {
	var tile = tiles[0].tile;

	if (tiles[0].valid && (tiles[0].yaku.open >= 1 || isClosed || tileLeft <= 4)) {
		return tile;
	}

	var highestYaku = -1;
	for (let t of tiles) {
		var foldThreshold = getFoldThreshold(t, ownHand);
		if (t.valid && t.yaku.open > highestYaku + 0.01 && t.yaku.open / 3.5 > highestYaku && t.danger <= foldThreshold) {
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