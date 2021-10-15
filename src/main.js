//################################
// MAIN
// Main Class, starts the bot and sets up all necessary variables.
//################################

//GUI can be re-opened by pressing + on the Numpad
if(!isDebug()) {
	initGui();
    window.onkeyup = function(e) {
      var key = e.keyCode ? e.keyCode : e.which;

		if (key == 107) { // Numpad + Key
			toggleGui();
		}
    }
	
	if(AUTORUN) {
		log("Autorun start");
		setInterval(sendHeatBeat, 60000); // 1 min? 5 min?
		setTimeout(startGame, 30000); //Search for new game after 30 seconds
		setTimeout(main, 10000);
		log("Main Loop started.");
		run = true;
	}
}

function toggleRun() {
	if (run) {
		log("AlphaJong deactivated!"); 
		run = false;
		startButton.innerHTML = "Start Bot"
	}
	else if(!run) {
		log("AlphaJong activated!"); 
		run = true;
		startButton.innerHTML = "Stop Bot"
		//setInterval(sendHeatBeat, 60000);
		main();
	}
}

//Main Loop
function main() {
	if(!run) {
		currentActionOutput.value = "Bot is not running.";
		return;
	}
	if(!isInGame()) {
		currentActionOutput.value = "Waiting for Game to start.";
		log("Game is not running, sleep 2 seconds.");
		errorCounter++;
		if(errorCounter > 90 && AUTORUN) { //3 minutes no game found -> reload page
			goToLobby();
		}
		setTimeout(main, 2000); //Check every 2 seconds if ingame
		return;
	}
	
	if(isDisconnect()) {
		goToLobby();
	}
	
	var operations = getOperationList(); //Get possible Operations
	
	if(operations == null || operations.length == 0) {
		errorCounter++;
		if(getTilesLeft() == lastTilesLeft) { //1 minute no tile drawn
			if(errorCounter > 60) {
				goToLobby();
			}
		}
		else {
			lastTilesLeft = getTilesLeft();
			errorCounter = 0;
		}
		checkForEnd();
		log("Waiting for own turn, sleep 1 second.");
		currentActionOutput.value = "Waiting for own turn.";
		setTimeout(main, 1000);
		return;
	}
	
	currentActionOutput.value = "Calculating best move...";
	
	setTimeout(mainOwnTurn, 500 + (Math.random() * 500));
}

function mainOwnTurn() {
	setData(); //Set current state of the board to local variables
	var operations = getOperationList();
	
	log("##### OWN TURN #####");
	log("Current Danger Level: " + getCurrentDangerLevel());
	
	determineStrategy(); //Get the Strategy for the current situation. After calls so it does not reset folds
	
	isConsideringCall = true;
	for(var i = 0; i < operations.length; i++) { //Priority Operations: Should be done before discard on own turn
		switch(operations[i].type) {
		case getOperations().an_gang: //From Hand
			callAnkan(operations[i].combination);
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
			callKita();
			break;
		}
	}

	for(var i = 0; i < operations.length; i++) {
		switch(operations[i].type) {
		case getOperations().dapai:
			isConsideringCall = false;
			discard();
			break;
		case getOperations().eat:
			callTriple(operations[i].combination, getOperations().eat); 
			break;
		case getOperations().peng:
			callTriple(operations[i].combination, getOperations().peng);
			break;
		case getOperations().ming_gang: //From others
			callDaiminkan();
			break;
		}
	}

	log(" ");
	currentActionOutput.value = "Own turn completed.";
	setTimeout(main, 1000);
}

//Set Data from real Game
function setData() {
	
	dora = getDora();
	
	ownHand = [];
	for(var i = 0; i < getPlayerHand().length; i++) { //Get own Hand
		ownHand.push(getPlayerHand()[i].val);
	}
	
	discards = [];
	for(var j = 0; j < getNumberOfPlayers(); j++) { //Get Discards for all Players
		var temp_discards = [];
		for(var i = 0; i < getDiscardsOfPlayer(j).pais.length; i++) {
			temp_discards.push(getDiscardsOfPlayer(j).pais[i].val);
		}
		if(getDiscardsOfPlayer(j).last_pai != null) {
			temp_discards.push(getDiscardsOfPlayer(j).last_pai.val);
		}
		discards.push(temp_discards);
	}
	updateDiscardedTilesSafety();
	
	calls = [];
	for(var j = 0; j < getNumberOfPlayers(); j++) { //Get Calls for all Players
		var temp_calls = [];
		for(var i = 0; i < getCallsOfPlayer(j).length; i++) {
			temp_calls.push(getCallsOfPlayer(j)[i].val);
		}
		calls.push(temp_calls);
	}
	
	if(tilesLeft < getTilesLeft()) { //Check if new round/reload
		isClosed = true;
		if(calls[0].length > 0) {
			isClosed = false;
		}
		setAutoCallWin(true);
		strategy = STRATEGIES.GENERAL;
		strategyAllowsCalls = true;
		initialDiscardedTilesSafety();
	}
	
	tilesLeft = getTilesLeft();
	
	if(!isDebug()) {
		seatWind = getSeatWind(0);
		roundWind = getRoundWind();
	}
	
	updateAvailableTiles();
}

//Search for Game and start Main Loop
function startGame() {
	if(!isInGame() && run) {
		log("Searching for Game in Room " + ROOM);
		currentActionOutput.value = "Searching for Game...";
		searchForGame();
	}
}

//Check if End Screen is shown
function checkForEnd() {
	if(isEndscreenShown() && AUTORUN) {
		run = false;
		setTimeout(goToLobby, 25000);
	}
}

//Reload Page to get back to lobby
function goToLobby() {
	location.reload(1);
}