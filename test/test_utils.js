//################################
// TEST UTILS
// Some function that are used by both Testcases and Benchmark
//################################

function resetGlobals() {
	dora = [{ index: 6, type: 3, dora: false }];
	discards = [[], [], [], []];
	calls = [[], [], [], []];
	seatWind = 2;
	roundWind = 1;
	tilesLeft = 70;
	strategy = STRATEGIES.GENERAL;
	EFFICIENCY_VALUE = 0.5;
	SCORE_VALUE = 0.5;
	SAFETY_VALUE = 0.5;
	isClosed = true;
	testPlayerRiichi = [0, 0, 0, 0];
	testPlayerHand = [13, 13, 13, 13];
	riichiTiles = [null, null, null, null];
	LOG_AMOUNT = 14;
}

//Reads a debugString and sets the game state accordingly
function readDebugString(debugString) {
	var debugArray = debugString.split("|");
	if (debugArray.length == 12) {
		read3PlayerDebugString(debugString);
	}
	if (debugArray.length != 14) {
		log("Failed to read debug String!");
	}
	dora = getTilesFromString(debugArray[0]);
	ownHand = getTilesFromString(debugArray[1]);
	calls[0] = getTilesFromString(debugArray[2]);
	calls[1] = getTilesFromString(debugArray[3]);
	calls[2] = getTilesFromString(debugArray[4]);
	calls[3] = getTilesFromString(debugArray[5]);
	discards[0] = getTilesFromString(debugArray[6]);
	discards[1] = getTilesFromString(debugArray[7]);
	discards[2] = getTilesFromString(debugArray[8]);
	discards[3] = getTilesFromString(debugArray[9]);
	testPlayerRiichi = debugArray[10].split(",");
	seatWind = debugArray[11];
	roundWind = debugArray[12];
	tilesLeft = debugArray[13];
	testPlayerHand = [13 - calls[0].length, 13 - calls[1].length, 13 - calls[2].length, 13 - calls[3].length];
}


//Reads a 3-player debugString and sets the game state accordingly
function read3PlayerDebugString(debugString) {
	var debugArray = debugString.split("|");
	if (debugArray.length == 12) {
		read3PlayerDebugString(debugString);
	}
	if (debugArray.length != 14) {
		log("Failed to read debug String!");
	}
	dora = getTilesFromString(debugArray[0]);
	ownHand = getTilesFromString(debugArray[1]);
	calls[0] = getTilesFromString(debugArray[2]);
	calls[1] = getTilesFromString(debugArray[3]);
	calls[2] = getTilesFromString(debugArray[4]);
	discards[0] = getTilesFromString(debugArray[5]);
	discards[1] = getTilesFromString(debugArray[6]);
	discards[2] = getTilesFromString(debugArray[7]);
	testPlayerRiichi = debugArray[8].split(",");
	seatWind = debugArray[9];
	roundWind = debugArray[10];
	tilesLeft = debugArray[11];
	testPlayerHand = [13 - calls[0].length, 13 - calls[1].length, 13 - calls[2].length];
}

//Returns true if triples, pairs and doubles are valid for tenpai
function isTenpai(triplesAndPairs, doubles, efficiency) {
	if (strategy == STRATEGIES.CHIITOITSU) {
		return parseInt(triplesAndPairs.pairs.length / 2) >= 6;
	}
	return efficiency >= 3.5 && ((parseInt(triplesAndPairs.triples.length / 3) == 3 && parseInt(triplesAndPairs.pairs.length / 2) >= 1 && ((parseInt(doubles.length / 2) >= 1) || parseInt(triplesAndPairs.pairs.length / 2) >= 2)) || parseInt(triplesAndPairs.triples.length / 3) == 4);
}