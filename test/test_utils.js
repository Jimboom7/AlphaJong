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
	strategyAllowsCalls = true;
	EFFICIENCY = 1.0;
	SAFETY = 1.0;
	SAKIGIRI = 1.0;
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
	isClosed = calls[0].length == 0;
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
	isClosed = calls[0].length == 0;
}
