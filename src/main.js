//################################
// MAIN
// Main Class, starts the bot and sets up all necessary variables.
//################################

//Bot can be activated/deactivated by pressing Numpad +
if(!isDebug()) {
    window.onkeyup = function(e) {
      var key = e.keyCode ? e.keyCode : e.which;

      if (key == 107 && run) { // Numpad + Key
        log("AlphaJong deactivated!"); 
        run = false;
      }
      else if(key == 107 && !run) {
        log("AlphaJong activated!"); 
        run = true;
		//setInterval(sendHeatBeat, 60000);
        main();
      }
    }
	
	if(AUTORUN) {
		log("Autorun start");
		setInterval(sendHeatBeat, 60000); // 1 min? 5 min?
		setTimeout(startGame, 20000); //Search for new game after 20 seconds
	}
}


//TODO LIST:

//Fix calls for dora tiles
//Fold later as Dealer
//Defense: Last tile from left player has priority for discard (-> is safe for this turn)
//Check isTenpai()
//Calls: Check if tile forms new triple -> check efficiency (so pairs dont get swapped out) (kinda done)
//Defense: Add Other Sujis (with low Prio)
//Maybe Consider Calls that don't form an additional triple? (e.g. 4566 -> 6 is thrown (or dora 6))
//When Calling Chi: Check if discard is valid
//More value for pairs (see strategy guides) (?)
//ShouldRiichi: Consider Scores
//9 Terminals -> Call Draw
//Start Main Loop instantly, top of loop: check ingame or lobby is loaded
//Change the way how Safety-Value affects the normal discard
//More Yaku
//Use Scores for Calculating Strategy (Going for fast wins as first etc.)
//Fold better... before calls?
//Riichi sometimes fails...
//Better Log
//Save some parts of the log (Endresult? Won by Ron etc.) in Local Storage

//Main Loop
function main() {
	if(!run) {
		return;
	}
	if(!isInGame()) {
		log("Game is not running, sleep 2 seconds.");
		errorCounter++;
		if(errorCounter > 90) { //3 minutes no game found -> reload page
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
			if(errorCounter > 30) {
				goToLobby();
			}
		}
		else {
			lastTilesLeft = getTilesLeft();
			errorCounter = 0;
		}
		checkForEnd();
		log("Waiting for own turn, sleep 2 seconds.");
		setTimeout(main, 2000);
		return;
	}
	
	setData(); //Get current state of the board
	
	log("");
	log("##### OWN TURN #####");
	log("Current Danger Level: " + getCurrentDangerLevel());
	
	determineStrategy(); //Get the Strategy for the current situation. After calls so it does not reset folds
	
	isConsideringCall = true;
	for(var i = 0; i < operations.length; i++) { //Priority Operations: Should be done before discard on own turn
		switch(operations[i].type) {
		case getOperations().an_gang: //From Hand
			callAnkan();
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
	setTimeout(main, 2000);
}

//Set Data from real Game
function setData() {
	
	dora = getDora();
	
	ownHand = [];
	for(var i = 0; i < getPlayerHand().length; i++) { //Get own Hand
		ownHand.push(getPlayerHand()[i].val);
	}
	
	discards = [];
	for(var j = 0; j < 4; j++) { //Get Discards for all Players
		var temp_discards = [];
		for(var i = 0; i < getDiscardsOfPlayer(j).pais.length; i++) {
			temp_discards.push(getDiscardsOfPlayer(j).pais[i].val);
		}
		if(getDiscardsOfPlayer(j).last_pai != null) {
			temp_discards.push(getDiscardsOfPlayer(j).last_pai.val);
		}
		discards.push(temp_discards);
	}
	
	calls = [];
	for(var j = 0; j < 4; j++) { //Get Calls for all Players
		var temp_calls = [];
		for(var i = 0; i < getCallsOfPlayer(j).length; i++) {
			temp_calls.push(getCallsOfPlayer(j)[i].val);
		}
		calls.push(temp_calls);
	}
	
	if(tilesLeft < getTilesLeft()) { //Check if new round
		isClosed = true;
		setAutoCallWin(true);
		strategy = STRATEGIES.GENERAL;
		strategyAllowsCalls = true;
	}
	
	if(calls[0].length > 0) {
		isClosed = false;
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
	if(!isInGame()) {
		log("Searching for Match in Room " + ROOM);
		searchForGame();
	}
	log("Main Loop started.");
	run = true;
	main();
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