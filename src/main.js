//################################
// MAIN
// Main Class, starts the bot and sets up all necessary variables.
//################################

//GUI can be re-opened by pressing + on the Numpad
if (!isDebug()) {
	initGui();
	window.onkeyup = function (e) {
		var key = e.keyCode ? e.keyCode : e.which;

		if (key == 107 || key == 65) { // Numpad + Key
			toggleGui();
		}
	}

	if (AUTORUN) {
		log("Autorun start");
		run = true;
		setInterval(preventAFK, 30000);
	}

	log(`crt mode ${AIMODE_NAME[MODE]}`);

	waitForMainLobbyLoad();
}

function toggleRun() {
	clearCrtStrategyMsg();
	if (run) {
		log("AlphaJong deactivated!");
		run = false;
		startButton.innerHTML = "Start Bot";
	}
	else if (!run) {
		log("AlphaJong activated!");
		run = true;
		startButton.innerHTML = "Stop Bot";
		main();
	}
}

function waitForMainLobbyLoad() {
	if (isInGame()) { // In case game is already ongoing after reload
		refreshRoomSelection();
		main();
		return;
	}

	if (!hasFinishedMainLobbyLoading()) { //Otherwise wait for Main Lobby to load and then search for game
		log("Waiting for Main Lobby to load...");
		showCrtActionMsg("Wait for Loading.");
		setTimeout(waitForMainLobbyLoad, 2000);
		return;
	}
	log("Main Lobby loaded!");
	refreshRoomSelection();
	startGame();
	setTimeout(main, 10000);
	log("Main Loop started.");
}

//Main Loop
function main() {
	if (!run) {
		showCrtActionMsg("Bot is not running.");
		return;
	}
	if (!isInGame()) {
		checkForEnd();
		showCrtActionMsg("Waiting for Game to start.");
		log("Game is not running, sleep 2 seconds.");
		errorCounter++;
		if (errorCounter > 90 && AUTORUN) { //3 minutes no game found -> reload page
			goToLobby();
		}
		setTimeout(main, 2000); //Check every 2 seconds if ingame
		return;
	}

	if (isDisconnect()) {
		goToLobby();
	}

	var operations = getOperationList(); //Get possible Operations

	if (operations == null || operations.length == 0) {
		errorCounter++;
		if (getTilesLeft() == lastTilesLeft) { //1 minute no tile drawn
			if (errorCounter > 120) {
				goToLobby();
			}
		}
		else {
			lastTilesLeft = getTilesLeft();
			errorCounter = 0;
		}
		clearCrtStrategyMsg();
		showCrtActionMsg("Waiting for own turn.");
		setTimeout(main, 500);

		if (MODE === AIMODE.HELP) {
			oldOps = [];
		}
		return;
	}

	showCrtActionMsg("Calculating best move...");

	setTimeout(mainOwnTurn, 200 + (Math.random() * 200));
}

var oldOps = []
function recordPlayerOps() {
	oldOps = []

	let ops = getOperationList();
	for (let op of ops) {
		oldOps.push(op.type)
	}
}

function checkPlayerOpChanged() {
	let ops = getOperationList();
	if (ops.length !== oldOps.length) {
		return true;
	}

	for (let i = 0; i < ops.length; i++) {
		if (ops[i].type !== oldOps[i]) {
			return true;
		}
	}

	return false;
}

async function mainOwnTurn() {
	if (threadIsRunning) {
		return;
	}
	threadIsRunning = true;

	//HELP MODE, if player not operate, just skip
	if (MODE === AIMODE.HELP) {
		if (!checkPlayerOpChanged()) {
			setTimeout(main, 1000);
			threadIsRunning = false;
			return;
		} else {
			recordPlayerOps();
		}
	}

	setData(); //Set current state of the board to local variables

	var operations = getOperationList();

	log("##### OWN TURN #####");
	log("Debug String: " + getDebugString());
	if (getNumberOfPlayers() == 3) {
		log("Right Player Tenpai Chance: " + Number(isPlayerTenpai(1) * 100).toFixed(1) + "%, Expected Hand Value: " + Number(getExpectedHandValue(1).toFixed(0)));
		log("Left Player Tenpai Chance: " + Number(isPlayerTenpai(2) * 100).toFixed(1) + "%, Expected Hand Value: " + Number(getExpectedHandValue(2).toFixed(0)));
	}
	else {
		log("Shimocha Tenpai Chance: " + Number(isPlayerTenpai(1) * 100).toFixed(1) + "%, Expected Hand Value: " + Number(getExpectedHandValue(1).toFixed(0)));
		log("Toimen Tenpai Chance: " + Number(isPlayerTenpai(2) * 100).toFixed(1) + "%, Expected Hand Value: " + Number(getExpectedHandValue(2).toFixed(0)));
		log("Kamicha Tenpai Chance: " + Number(isPlayerTenpai(3) * 100).toFixed(1) + "%, Expected Hand Value: " + Number(getExpectedHandValue(3).toFixed(0)));
	}

	determineStrategy(); //Get the Strategy for the current situation. After calls so it does not reset folds

	isConsideringCall = true;
	for (let operation of operations) { //Priority Operations: Should be done before discard on own turn
		if (getOperationList().length == 0) {
			break;
		}
		switch (operation.type) {
			case getOperations().an_gang: //From Hand
				callAnkan(operation.combination);
				break;
			case getOperations().add_gang: //Add from Hand to Pon
				callShouminkan();
				break;
			case getOperations().zimo:
				callTsumo();
				break;
			case getOperations().rong:
				callRon();
				break;
			case getOperations().babei:
				if (callKita()) {
					threadIsRunning = false;
					setTimeout(main, 1000);
					return;
				}
				break;
			case getOperations().jiuzhongjiupai:
				callAbortiveDraw();
				break;
		}
	}

	for (let operation of operations) {
		if (getOperationList().length == 0) {
			break;
		}
		switch (operation.type) {
			case getOperations().dapai:
				isConsideringCall = false;
				await discard();
				break;
			case getOperations().eat:
				await callTriple(operation.combination, getOperations().eat);
				break;
			case getOperations().peng:
				await callTriple(operation.combination, getOperations().peng);
				break;
			case getOperations().ming_gang: //From others
				callDaiminkan();
				break;
		}
	}

	log(" ");

	if (MODE === AIMODE.AUTO) {
		showCrtActionMsg("Own turn completed.");
	}

	if ((getOverallTimeLeft() < 8 && getLastTurnTimeLeft() - getOverallTimeLeft() <= 0) || //Not much overall time left and last turn took longer than the 5 second increment
		(getOverallTimeLeft() < 4 && getLastTurnTimeLeft() - getOverallTimeLeft() <= 1)) {
		timeSave++;
		log("Low performance! Activating time save mode level: " + timeSave);
	}
	if (getOverallTimeLeft() > 15) { //Much time left (new round)
		timeSave = 0;
	}

	threadIsRunning = false;

	setTimeout(main, 1000);

}

//Set Data from real Game
function setData(mainUpdate = true) {

	dora = getDora();

	ownHand = [];
	for (let tile of getPlayerHand()) { //Get own Hand
		ownHand.push(tile.val);
		ownHand[ownHand.length - 1].valid = tile.valid; //Is valid discard
	}

	discards = [];
	for (var j = 0; j < getNumberOfPlayers(); j++) { //Get Discards for all Players
		var temp_discards = [];
		for (var i = 0; i < getDiscardsOfPlayer(j).pais.length; i++) {
			temp_discards.push(getDiscardsOfPlayer(j).pais[i].val);
		}
		if (getDiscardsOfPlayer(j).last_pai != null) {
			temp_discards.push(getDiscardsOfPlayer(j).last_pai.val);
		}
		discards.push(temp_discards);
	}
	if (mainUpdate) {
		updateDiscardedTilesSafety();
	}

	calls = [];
	for (var j = 0; j < getNumberOfPlayers(); j++) { //Get Calls for all Players
		calls.push(getCallsOfPlayer(j));
	}

	isClosed = true;
	for (let tile of calls[0]) { //Is hand closed? Also consider closed Kans
		if (tile.from != localPosition2Seat(0)) {
			isClosed = false;
			break;
		}
	}
	if (tilesLeft < getTilesLeft()) { //Check if new round/reload
		if (MODE === AIMODE.AUTO) {
			setAutoCallWin(true);
		}
		strategy = STRATEGIES.GENERAL;
		strategyAllowsCalls = true;
		initialDiscardedTilesSafety();
		riichiTiles = [null, null, null, null];
		playerDiscardSafetyList = [[], [], [], []];
		extendMJSoulFunctions();
	}

	tilesLeft = getTilesLeft();

	if (!isDebug()) {
		seatWind = getSeatWind(0);
		roundWind = getRoundWind();
	}

	updateAvailableTiles();
}

//Search for Game
function startGame() {
	if (!isInGame() && run && AUTORUN) {
		log("Searching for Game in Room " + ROOM);
		showCrtActionMsg("Searching for Game...");
		searchForGame();
	}
}

//Check if End Screen is shown
function checkForEnd() {
	if (isEndscreenShown() && AUTORUN) {
		run = false;
		setTimeout(goToLobby, 25000);
	}
}

//Reload Page to get back to lobby
function goToLobby() {
	location.reload(1);
}