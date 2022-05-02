// ==UserScript==
// @name         AlphaJong
// @namespace    alphajong
// @version      1.2.2
// @description  A Mahjong Soul Bot.
// @author       ryan
// @match        https://mahjongsoul.game.yo-star.com/*
// @match        https://majsoul.com/*
// @match        https://game.maj-soul.com/*
// @match        https://majsoul.union-game.com/*
// @match        https://game.mahjongsoul.com/*
// ==/UserScript==

//################################
// PARAMETERS
// Contains Parameters to change the playstile of the bot. Usually no need to change anything.
//################################

//DEFENSE CONSTANTS
var FOLD_CONSTANT = 10; //Lower -> Earlier Fold. Default: 10

//CALLS
var CALL_CONSTANT = 3; //Amount of han (Open Yaku + Dora) that is needed for calls (to accelerate high value hands). Default: 3
var CALL_KAN_CONSTANT = 60; //Higher Value: Higher Threshold for calling Kans. Default: 60

//HAND EVALUATION CONSTANTS. Higher number => more important.
var EFFICIENCY_VALUE = 1; // 0 -> ignore Efficiency (lol). Default: 1
var YAKU_VALUE = 0.5; // 0 -> ignore Yaku. Default: 0.5
var DORA_VALUE = 0.3; // 0 -> ignore Dora. Default: 0.3
var SAFETY_VALUE = 0.5; // 0 -> Ignore Safety. Default: 0.5
var WAIT_VALUE = 0.3; // Value for good waits when tenpai. Maximum: 1. Default: 0.3
var SAKIGIRI_VALUE = 0.3; // 0 -> Never Sakigiri. Default: 0.3

//STRATEGY CONSTANTS
var CHIITOITSU = 5; //Number of Pairs in Hand to go for chiitoitsu. Default: 5
var THIRTEEN_ORPHANS = 10; //Number of Honor/Terminals in hand to go for 13 orphans (Not yet implemented). Default: 10
var RIICHI_TILES_LEFT = 6; //Minimum amount of tiles that need to be left for calling Riichi. Default: 6
var WAITS_FOR_RIICHI = 5; //Amount of waits that is considered good enough for calling Riichi. Default: 5

//MISC
var LOG_AMOUNT = 3; //Amount of Messages to log for Tile Priorities
var DEBUG_BUTTON = false; //Display a Debug Button in the GUI
var LOW_SPEC_MODE = false; //Decrease calculation time




//### GLOBAL VARIABLES DO NOT CHANGE ###
var run = false; //Is the bot running
const STRATEGIES = { //ENUM of strategies
	GENERAL: 'General',
	CHIITOITSU: 'Chiitoitsu',
	FOLD: 'Fold',
	THIRTEEN_ORPHANS: 'Thirteen_Orphans'
}
var strategy = STRATEGIES.GENERAL; //Current strategy
var strategyAllowsCalls = true; //Does the current strategy allow calls?
var isClosed = true; //Is own hand closed?
var dora = []; //Array of Tiles (index, type, dora)
var ownHand = []; //index, type, dora
var discards = []; //Later: Change to array for each player
var calls = []; //Calls/Melds of each player
var availableTiles = []; //Tiles that are available
var seatWind = 1; //1: East,... 4: North
var roundWind = 1; //1: East,... 4: North
var tilesLeft = 0; //tileCounter
var visibleTiles = []; //Tiles that are visible
var errorCounter = 0; //Counter to check if bot is working
var lastTilesLeft = 0; //Counter to check if bot is working
var isConsideringCall = false;
var riichiTiles = [null, null, null, null]; // Track players discarded tiles on riichi
var functionsExtended = false;

//TEST
var testRunning = false;
var currentTest = 0;
var passes = 0;
var startTime = 0;
var winValues = [];
var TEST_DANGER_LEVEL = 50;
var testCallTile = {};
var testPlayerRiichi = [0, 0, 0, 0];
var testPlayerHand = [];
var testStartTime = 0;

//LOCAL STORAGE
var AUTORUN = window.localStorage.getItem("alphajongAutorun") == "true";
var ROOM = window.localStorage.getItem("alphajongRoom");
ROOM = ROOM == null ? 2 : ROOM

//Factorials for chance of tile draw calculation. Pre calculated to save time
var facts = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800, 479001600, 6227020800, 87178291200, 1307674368000, 20922789888000, 355687428096000, 6402373705728000, 121645100408832000, 2432902008176640000, 51090942171709440000, 1.1240007277776077e+21, 2.585201673888498e+22, 6.204484017332394e+23, 1.5511210043330986e+25, 4.0329146112660565e+26, 1.0888869450418352e+28, 3.0488834461171384e+29, 8.841761993739701e+30, 2.6525285981219103e+32, 8.222838654177922e+33, 2.631308369336935e+35, 8.683317618811886e+36, 2.9523279903960412e+38, 1.0333147966386144e+40, 3.719933267899012e+41, 1.3763753091226343e+43, 5.23022617466601e+44, 2.0397882081197442e+46, 8.159152832478977e+47, 3.3452526613163803e+49, 1.4050061177528798e+51, 6.041526306337383e+52, 2.6582715747884485e+54, 1.1962222086548019e+56, 5.5026221598120885e+57, 2.5862324151116818e+59, 1.2413915592536073e+61, 6.082818640342675e+62, 3.0414093201713376e+64, 1.5511187532873822e+66, 8.065817517094388e+67, 4.2748832840600255e+69, 2.308436973392414e+71, 1.2696403353658276e+73, 7.109985878048635e+74, 4.052691950487722e+76, 2.350561331282879e+78, 1.3868311854568986e+80, 8.320987112741392e+81, 5.075802138772248e+83, 3.146997326038794e+85, 1.98260831540444e+87, 1.2688693218588417e+89, 8.247650592082472e+90, 5.443449390774431e+92, 3.647111091818868e+94, 2.4800355424368305e+96, 1.711224524281413e+98, 1.197857166996989e+100, 8.504785885678622e+101, 6.123445837688608e+103, 4.4701154615126834e+105, 3.3078854415193856e+107, 2.480914081139539e+109, 1.8854947016660498e+111, 1.4518309202828584e+113, 1.1324281178206295e+115, 8.946182130782973e+116, 7.156945704626378e+118, 5.797126020747366e+120, 4.75364333701284e+122, 3.945523969720657e+124, 3.314240134565352e+126, 2.8171041143805494e+128, 2.4227095383672724e+130, 2.107757298379527e+132, 1.8548264225739836e+134, 1.6507955160908452e+136, 1.4857159644817607e+138, 1.3520015276784023e+140, 1.24384140546413e+142, 1.1567725070816409e+144, 1.0873661566567424e+146, 1.0329978488239052e+148, 9.916779348709491e+149, 9.619275968248206e+151, 9.426890448883242e+153, 9.33262154439441e+155, 9.33262154439441e+157, 9.425947759838354e+159, 9.614466715035121e+161, 9.902900716486175e+163, 1.0299016745145622e+166, 1.0813967582402903e+168, 1.1462805637347078e+170, 1.2265202031961373e+172, 1.3246418194518284e+174, 1.4438595832024928e+176, 1.5882455415227421e+178, 1.7629525510902437e+180, 1.9745068572210728e+182, 2.2311927486598123e+184, 2.543559733472186e+186, 2.925093693493014e+188, 3.3931086844518965e+190, 3.969937160808719e+192, 4.6845258497542883e+194, 5.574585761207603e+196, 6.689502913449124e+198, 8.09429852527344e+200, 9.875044200833598e+202, 1.2146304367025325e+205, 1.5061417415111404e+207, 1.8826771768889254e+209, 2.372173242880046e+211, 3.012660018457658e+213, 3.8562048236258025e+215, 4.9745042224772855e+217, 6.466855489220472e+219, 8.471580690878817e+221, 1.118248651196004e+224, 1.4872707060906852e+226, 1.992942746161518e+228];

//################################
// GUI
// Adds elements like buttons to control the bot
//################################

var guiDiv = document.createElement("div");
var guiSpan = document.createElement("span");
var startButton = document.createElement("button");
var autorunCheckbox = document.createElement("input");
var roomCombobox = document.createElement("select");
var currentActionOutput = document.createElement("input");
var debugButton = document.createElement("button");
var hideButton = document.createElement("button");

function initGui() {
	if (getRooms() == null) { // Wait for minimal loading to be done
		setTimeout(initGui, 1000);
		return;
	}

	guiDiv.style.position = "absolute";
	guiDiv.style.zIndex = "100001"; //On top of the game
	guiDiv.style.left = "0px";
	guiDiv.style.top = "0px";
	guiDiv.style.width = "100%";
	guiDiv.style.textAlign = "center";
	guiDiv.style.fontSize = "20px";

	guiSpan.style.backgroundColor = "rgba(255,255,255,0.5)";
	guiSpan.style.padding = "5px";

	startButton.innerHTML = "Start Bot";
	if (window.localStorage.getItem("alphajongAutorun") == "true") {
		startButton.innerHTML = "Stop Bot";
	}
	startButton.style.marginRight = "15px";
	startButton.onclick = function () {
		toggleRun();
	};
	guiSpan.appendChild(startButton);

	autorunCheckbox.type = "checkbox";
	autorunCheckbox.id = "autorun";
	autorunCheckbox.onclick = function () {
		autorunCheckboxClick();
	};
	if (window.localStorage.getItem("alphajongAutorun") == "true") {
		autorunCheckbox.checked = true;
	}
	guiSpan.appendChild(autorunCheckbox);
	var checkboxLabel = document.createElement("label");
	checkboxLabel.htmlFor = "autorun";
	checkboxLabel.appendChild(document.createTextNode('Autostart new Game in'));
	checkboxLabel.style.marginRight = "5px";
	guiSpan.appendChild(checkboxLabel);

	refreshRoomSelection();

	roomCombobox.style.marginRight = "15px";
	roomCombobox.onchange = function () {
		roomChange();
	};

	if (window.localStorage.getItem("alphajongAutorun") != "true") {
		roomCombobox.disabled = true;
	}
	guiSpan.appendChild(roomCombobox);

	currentActionOutput.readOnly = "true";
	currentActionOutput.size = "20";
	currentActionOutput.style.marginRight = "15px";
	currentActionOutput.value = "Bot is not running.";
	if (window.localStorage.getItem("alphajongAutorun") == "true") {
		currentActionOutput.value = "Bot started.";
	}
	guiSpan.appendChild(currentActionOutput);

	debugButton.innerHTML = "Debug";
	debugButton.onclick = function () {
		showDebugString();
	};
	if (DEBUG_BUTTON) {
		guiSpan.appendChild(debugButton);
	}

	hideButton.innerHTML = "Hide GUI";
	hideButton.onclick = function () {
		toggleGui();
	};
	guiSpan.appendChild(hideButton);

	guiDiv.appendChild(guiSpan);
	document.body.appendChild(guiDiv);
	toggleGui();
}

function toggleGui() {
	if (guiDiv.style.display == "block") {
		guiDiv.style.display = "none";
	}
	else {
		guiDiv.style.display = "block";
	}
}

function showDebugString() {
	alert("If you notice a bug while playing please go to the correct turn in the replay (before the bad discard), press this button, copy the Debug String from the textbox and include it in your issue on github.");
	if (isInGame()) {
		setData();
		currentActionOutput.value = getDebugString();
	}
}

function roomChange() {
	window.localStorage.setItem("alphajongRoom", roomCombobox.value);
	ROOM = roomCombobox.value;
}

function hideButtonClick() {
	guiDiv.style.display = "none";
}

function autorunCheckboxClick() {
	if (autorunCheckbox.checked) {
		roomCombobox.disabled = false;
		window.localStorage.setItem("alphajongAutorun", "true");
		AUTORUN = true;
	}
	else {
		roomCombobox.disabled = true;
		window.localStorage.setItem("alphajongAutorun", "false");
		AUTORUN = false;
	}
}

// Refresh the contents of the Room Selection Combobox with values appropiate for the rank
function refreshRoomSelection() {
	roomCombobox.innerHTML = ""; // Clear old entries
	getRooms().forEach(function (room) {
		if (isInRank(room.id) && room.mode != 0) { // Rooms with mode = 0 are 1 Game only, not sure why they are in the code but not selectable in the UI...
			var option = document.createElement("option");
			option.text = getRoomName(room);
			option.value = room.id;
			roomCombobox.appendChild(option);
		}
	});
	roomCombobox.value = ROOM;
}
//################################
// API (MAHJONG SOUL)
// Returns data from Mahjong Souls Javascript
//################################


function preventAFK() {
	if (typeof GameMgr == 'undefined') {
		return;
	}
	GameMgr.Inst._pre_mouse_point.x = Math.floor(Math.random() * 100) + 1;
	GameMgr.Inst._pre_mouse_point.y = Math.floor(Math.random() * 100) + 1;
	GameMgr.Inst.clientHeatBeat(); // Prevent Client-side AFK
	app.NetAgent.sendReq2Lobby('Lobby', 'heatbeat', { no_operation_counter: 0 }); //Prevent Server-side AFK

	if (typeof view == 'undefined' || typeof view.DesktopMgr == 'undefined' ||
		typeof view.DesktopMgr.Inst == 'undefined' || view.DesktopMgr.Inst == null) {
		return;
	}
	view.DesktopMgr.Inst.hangupCount = 0;
	//uiscript.UI_Hangup_Warn.Inst.locking
}

function hasFinishedMainLobbyLoading() {
	if (typeof GameMgr == 'undefined') {
		return false;
	}
	return GameMgr.Inst.login_loading_end;
}

function searchForGame() {
	uiscript.UI_PiPeiYuYue.Inst.addMatch(ROOM);

	// Direct way to search for a game, without UI:
	// app.NetAgent.sendReq2Lobby('Lobby', 'startUnifiedMatch', {match_sid: 1 + ":" + ROOM, client_version_string: GameMgr.Inst.getClientVersion()});
}

function getOperationList() {
	return view.DesktopMgr.Inst.oplist;
}

function getOperations() {
	return mjcore.E_PlayOperation;
}

function getDora() {
	return view.DesktopMgr.Inst.dora;
}

function getPlayerHand() {
	return view.DesktopMgr.Inst.players[0].hand;
}

function getDiscardsOfPlayer(player) {
	player = getCorrectPlayerNumber(player);
	return view.DesktopMgr.Inst.players[player].container_qipai;
}

function getCallsOfPlayer(player) {
	player = getCorrectPlayerNumber(player);

	var callArray = [];
	//Mark the tiles with the player who discarded the tile
	for (let ming of view.DesktopMgr.Inst.players[player].container_ming.mings) {
		for (var i = 0; i < ming.pais.length; i++) {
			ming.pais[i].from = ming.from[i];
			if (i == 3) {
				ming.pais[i].kan = true;
			}
			else {
				ming.pais[i].kan = false;
			}
			callArray.push(ming.pais[i]);
		}
	}

	return callArray;
}

function getNumberOfKitaOfPlayer(player) {
	player = getCorrectPlayerNumber(player);

	return view.DesktopMgr.Inst.players[player].container_babei.pais.length;
}

function getTilesLeft() {
	return view.DesktopMgr.Inst.left_tile_count;
}

function localPosition2Seat(player) {
	player = getCorrectPlayerNumber(player);
	return view.DesktopMgr.Inst.localPosition2Seat(player);
}

function seat2LocalPosition(playerSeat) {
	return view.DesktopMgr.Inst.seat2LocalPosition(playerSeat);
}

function getCurrentPlayer() {
	return view.DesktopMgr.Inst.index_player;
}

function getSeatWind(player) {
	return ((4 + localPosition2Seat(player) - view.DesktopMgr.Inst.index_ju) % 4) + 1;
}

function getRound() {
	return view.DesktopMgr.Inst.index_ju;
}

function getRoundWind() {
	return view.DesktopMgr.Inst.index_change + 1;
}

function setAutoCallWin(win) {
	view.DesktopMgr.Inst.setAutoHule(win);
	//view.DesktopMgr.Inst.setAutoNoFulu(true) //Auto No Chi/Pon/Kan
	try {
		uiscript.UI_DesktopInfo.Inst.refreshFuncBtnShow(uiscript.UI_DesktopInfo.Inst._container_fun.getChildByName("btn_autohu"), view.DesktopMgr.Inst.auto_hule); //Refresh GUI Button
	}
	catch {
		return;
	}
}

function getTileForCall() {
	if (view.DesktopMgr.Inst.lastqipai == null) {
		return { index: 0, type: 0, dora: false, doraValue: 0 };
	}
	var tile = view.DesktopMgr.Inst.lastqipai.val;
	tile.doraValue = getTileDoraValue(tile);
	return tile;
}

function makeCall(type) {
	app.NetAgent.sendReq2MJ('FastTest', 'inputChiPengGang', { type: type, index: 0, timeuse: 2 });
	view.DesktopMgr.Inst.WhenDoOperation();
}

function makeCallWithOption(type, option) {
	app.NetAgent.sendReq2MJ('FastTest', 'inputChiPengGang', { type: type, index: option, timeuse: 2 });
	view.DesktopMgr.Inst.WhenDoOperation();
}

function declineCall(operation) {
	if (operation == getOperationList()[getOperationList().length - 1].type) { //Is last operation -> Send decline Command
		app.NetAgent.sendReq2MJ('FastTest', 'inputChiPengGang', { cancel_operation: true, timeuse: 2 });
		view.DesktopMgr.Inst.WhenDoOperation();
	}
}

function sendRiichiCall(tile, moqie) {
	app.NetAgent.sendReq2MJ('FastTest', 'inputOperation', { type: mjcore.E_PlayOperation.liqi, tile: tile, moqie: moqie, timeuse: 2 }); //Moqie: Throwing last drawn tile (Riichi -> false)
}

function sendKitaCall() {
	var moqie = view.DesktopMgr.Inst.mainrole.last_tile.val.toString() == "4z";
	app.NetAgent.sendReq2MJ('FastTest', 'inputOperation', { type: mjcore.E_PlayOperation.babei, moqie: moqie, timeuse: 2 });
	view.DesktopMgr.Inst.WhenDoOperation();
}

function sendAbortiveDrawCall() {
	app.NetAgent.sendReq2MJ('FastTest', 'inputOperation', { type: mjcore.E_PlayOperation.jiuzhongjiupai, index: 0, timeuse: 2 });
	view.DesktopMgr.Inst.WhenDoOperation();
}

function callDiscard(tileNumber) {
	view.DesktopMgr.Inst.players[0]._choose_pai = view.DesktopMgr.Inst.players[0].hand[tileNumber];
	view.DesktopMgr.Inst.players[0].DoDiscardTile();
}

function getPlayerLinkState(player) {
	player = getCorrectPlayerNumber(player);
	return view.DesktopMgr.player_link_state[localPosition2Seat(player)];
}

function getNumberOfPlayerHand(player) {
	player = getCorrectPlayerNumber(player);
	return view.DesktopMgr.Inst.players[player].hand.length;
}

function isEndscreenShown() {
	return this != null && view != null && view.DesktopMgr != null &&
		view.DesktopMgr.Inst != null && view.DesktopMgr.Inst.gameEndResult != null;
}

function isDisconnect() {
	return uiscript.UI_Hanguplogout.Inst != null && uiscript.UI_Hanguplogout.Inst._me.visible;
}

function isPlayerRiichi(player) {
	var player_correct = getCorrectPlayerNumber(player);
	return view.DesktopMgr.Inst.players[player_correct].liqibang._activeInHierarchy || getDiscardsOfPlayer(player).last_is_liqi;
}

function isInGame() {
	try {
		return this != null && view != null && view.DesktopMgr != null &&
			view.DesktopMgr.Inst != null && view.DesktopMgr.player_link_state != null &&
			view.DesktopMgr.Inst.active && !isEndscreenShown()
	}
	catch {
		return false;
	}
}

function doesPlayerExist(player) {
	return view.DesktopMgr.Inst.players[player].hand != undefined;
}

function getPlayerScore(player) {
	player = getCorrectPlayerNumber(player);
	return view.DesktopMgr.Inst.players[player].score;
}

//Needs to be called before calls array is updated
function hasPlayerHandChanged(player) {
	var player_correct = getCorrectPlayerNumber(player);
	for (let hand of view.DesktopMgr.Inst.players[player_correct].hand) {
		if (hand.old != true) {
			return true;
		}
	}
	return getCallsOfPlayer(player).length > calls[player].length;
}

//Sets a variable for each pai in a players hand
function rememberPlayerHand(player) {
	var player_correct = getCorrectPlayerNumber(player);
	for (let tile of view.DesktopMgr.Inst.players[player_correct].hand) {
		tile.old = true;
	}
}

function isEastRound() {
	return view.DesktopMgr.Inst.game_config.mode.mode == 1;
}

// Is the player able to join a given room
function isInRank(room) {
	var roomData = cfg.desktop.matchmode.get(room);
	try {
		var rank = GameMgr.Inst.account_data[roomData.mode < 10 ? "level" : "level3"].id; // 4 player or 3 player rank
		return (roomData.room == 100) || (roomData.level_limit <= rank && roomData.level_limit_ceil >= rank); // room 100 is casual mode
	}
	catch {
		return roomData.room == 100;
	}
}

// Map of all Rooms
function getRooms() {
	try {
		return cfg.desktop.matchmode;
	}
	catch {
		return null;
	}
}

// Client language
function getLanguage() {
	return GameMgr.client_language;
}

// Name of a room in client language
function getRoomName(room) {
	return room["room_name_" + getLanguage()] + " (" + game.Tools.room_mode_desc(room.mode) + ")";
}

// Extend some internal MJSoul functions with additional code
function extendMJSoulFunctions() {
	if (functionsExtended) {
		return;
	}
	trackRiichiDiscardTile();
	functionsExtended = true;
}

// Track which tile the players discarded on their riichi turn
function trackRiichiDiscardTile() {
	for (var i = 1; i < getNumberOfPlayers(); i++) {
		var player = getCorrectPlayerNumber(i);
		view.DesktopMgr.Inst.players[player].container_qipai.AddQiPai = (function (_super) { // Extend the MJ-Soul Discard function
			return function () {
				if (arguments[1]) { // Contains true when Riichi
					riichiTiles[seat2LocalPosition(this.player.seat)] = arguments[0]; // Track tile in riichiTiles Variable
					log("Riichi Discard: " + arguments[0].toString());
				}
				return _super.apply(this, arguments); // Call original function
			};
		})(view.DesktopMgr.Inst.players[player].container_qipai.AddQiPai);
	}
}
//################################
// UTILS
// Contains utility functions
//################################

//Return the number of players in the game (3 or 4)
function getNumberOfPlayers() {
	if (!doesPlayerExist(1) || !doesPlayerExist(2) || !doesPlayerExist(3)) {
		return 3;
	}
	return 4;
}

//Correct the player numbers
//Only necessary for 3 player games
function getCorrectPlayerNumber(player) {
	if (getNumberOfPlayers() == 4) {
		return player;
	}
	if (!doesPlayerExist(1)) {
		if (player > 0) {
			return player + 1;
		}
	}
	if (!doesPlayerExist(2)) {
		if (player > 1) {
			return player + 1;
		}
	}
	return player;
}

//Return number of doras in tiles
function getNumberOfDoras(tiles) {
	var dr = 0;
	for (let tile of tiles) {
		dr += tile.doraValue;
	}
	return dr;
}

//Pairs in tiles
function getPairs(tiles) {
	var sortedTiles = sortTiles(tiles);

	var pairs = [];
	var oldIndex = 0;
	var oldType = 0;
	sortedTiles.forEach(function (tile) {
		if (oldIndex != tile.index || oldType != tile.type) {
			var ts = getTilesInTileArray(sortedTiles, tile.index, tile.type);
			if ((ts.length >= 2)) {
				pairs.push({ tile1: ts[0], tile2: ts[1] }); //Grabs highest dora tiles first
			}
			oldIndex = tile.index;
			oldType = tile.type;
		}
	});
	return pairs;
}

//Pairs in tiles as array
function getPairsAsArray(tiles) {
	var pairs = getPairs(tiles);
	var pairList = [];
	pairs.forEach(function (pair) {
		pairList.push(pair.tile1);
		pairList.push(pair.tile2);
	});
	return pairList;
}

//Return doubles in tiles
function getDoubles(tiles) {
	var doubles = [];
	tiles.forEach(function (tile) {
		if (isDouble(tiles, tile)) {
			doubles.push(tile);
		}
	});
	return doubles;
}


//Tile twice or 2 sequence or "bridge". Might even be triple
function isDouble(tiles, tile) {
	var tileNumber = getNumberOfTilesInTileArray(tiles, tile.index, tile.type);
	if (tile.type == 3) {
		return tileNumber == 2;
	}
	return ((tileNumber == 2) ||
		(((getNumberOfTilesInTileArray(tiles, tile.index - 1, tile.type) >= 1) ||
			(getNumberOfTilesInTileArray(tiles, tile.index + 1, tile.type) >= 1) ||
			(getNumberOfTilesInTileArray(tiles, tile.index - 2, tile.type) >= 1) ||
			(getNumberOfTilesInTileArray(tiles, tile.index + 2, tile.type) >= 1)) && tileNumber >= 1));
}

//Return all triplets/3-sequences and pairs as a tile array
function getTriplesAndPairs(tiles) {
	var sequences = getSequences(tiles);
	var triplets = getTriplets(tiles);
	var pairs = getPairs(tiles);
	return getBestCombinationOfTiles(tiles, sequences.concat(triplets).concat(pairs), { triples: [], pairs: [] });
}

//Return all triplets/3-tile-sequences as a tile array
function getTriples(tiles) {
	var sequences = getSequences(tiles);
	var triplets = getTriplets(tiles);
	return getBestCombinationOfTiles(tiles, sequences.concat(triplets), { triples: [], pairs: [] }).triples;
}

//Return all triplets in tile array
function getTriplets(tiles) {
	var sortedTiles = sortTiles(tiles);

	var triples = [];
	var oldIndex = 0;
	var oldType = 0;
	sortedTiles.forEach(function (tile) {
		if (oldIndex != tile.index || oldType != tile.type) {
			var ts = getTilesInTileArray(sortedTiles, tile.index, tile.type);
			if ((ts.length >= 3)) {
				triples.push({ tile1: ts[0], tile2: ts[1], tile3: ts[2] }); //Grabs highest dora tiles first because of sorting
			}
			oldIndex = tile.index;
			oldType = tile.type;
		}
	});
	return triples;
}

//Triplets in tiles as array
function getTripletsAsArray(tiles) {
	var triplets = getTriplets(tiles);
	var tripletsList = [];
	triplets.forEach(function (triplet) {
		tripletsList.push(triplet.tile1);
		tripletsList.push(triplet.tile2);
		tripletsList.push(triplet.tile3);
	});
	return tripletsList;
}

//Returns the best combination of sequences. 
//Small Bug: Can return red dora tiles multiple times, but doesn't matter for the current use cases
function getBestSequenceCombination(inputHand) {
	return getBestCombinationOfTiles(inputHand, getSequences(inputHand), { triples: [], pairs: [] }).triples;
}

//Check if there is already a red dora tile in the tiles array.
//More or less a workaround for a problem with the getBestCombinationOfTiles function...
function pushTileAndCheckDora(tiles, arrayToPush, tile) {
	if (tile.dora && tiles.some(t => t.type == tile.type && t.dora)) {
		var nonDoraTile = { ...tile };
		nonDoraTile.dora = false;
		nonDoraTile.doraValue = getTileDoraValue(nonDoraTile);
		arrayToPush.push(nonDoraTile);
		return nonDoraTile;
	}
	arrayToPush.push(tile);
	return tile;
}

//Return the best combination of 3-tile Sequences, Triplets and pairs in array of tiles
//Recursive Function, weird code that can probably be optimized
function getBestCombinationOfTiles(inputTiles, possibleCombinations, chosenCombinations) {
	var originalC = { triples: [...chosenCombinations.triples], pairs: [...chosenCombinations.pairs] };
	for (var i = 0; i < possibleCombinations.length; i++) {
		var cs = { triples: [...originalC.triples], pairs: [...originalC.pairs] };
		var tiles = possibleCombinations[i];
		var hand = [...inputTiles];
		if (!("tile3" in tiles)) { // Pairs
			if (tiles.tile1.index == tiles.tile2.index && getNumberOfTilesInTileArray(hand, tiles.tile1.index, tiles.tile1.type) < 2) {
				continue;
			}
		}
		else if (getNumberOfTilesInTileArray(hand, tiles.tile1.index, tiles.tile1.type) == 0 ||
			getNumberOfTilesInTileArray(hand, tiles.tile2.index, tiles.tile2.type) == 0 ||
			getNumberOfTilesInTileArray(hand, tiles.tile3.index, tiles.tile3.type) == 0 ||
			(tiles.tile1.index == tiles.tile2.index && getNumberOfTilesInTileArray(hand, tiles.tile1.index, tiles.tile1.type) < 3)) {
			continue;
		}
		if ("tile3" in tiles) {
			var tt = pushTileAndCheckDora(cs.pairs.concat(cs.triples), cs.triples, tiles.tile1);
			hand = removeTilesFromTileArray(hand, [tt]);
			tt = pushTileAndCheckDora(cs.pairs.concat(cs.triples), cs.triples, tiles.tile2);
			hand = removeTilesFromTileArray(hand, [tt]);
			tt = pushTileAndCheckDora(cs.pairs.concat(cs.triples), cs.triples, tiles.tile3);
			hand = removeTilesFromTileArray(hand, [tt]);
		}
		else {
			var tt = pushTileAndCheckDora(cs.pairs.concat(cs.triples), cs.pairs, tiles.tile1);
			hand = removeTilesFromTileArray(hand, [tt]);
			tt = pushTileAndCheckDora(cs.pairs.concat(cs.triples), cs.pairs, tiles.tile2);
			hand = removeTilesFromTileArray(hand, [tt]);
		}
		var anotherChoice = getBestCombinationOfTiles(hand, possibleCombinations.slice(i + 1), cs);
		if (anotherChoice.triples.length > chosenCombinations.triples.length ||
			(anotherChoice.triples.length == chosenCombinations.triples.length &&
				anotherChoice.pairs.length > chosenCombinations.pairs.length) ||
			(anotherChoice.triples.length == chosenCombinations.triples.length &&
				anotherChoice.pairs.length == chosenCombinations.pairs.length &&
				getNumberOfDoras(anotherChoice.triples.concat(anotherChoice.pairs)) > getNumberOfDoras(chosenCombinations.triples.concat(chosenCombinations.pairs)))) {
			chosenCombinations = anotherChoice;
		}
	}

	return chosenCombinations;
}

//Return all 3-tile Sequences in tile array
function getSequences(tiles) {
	var sortedTiles = sortTiles(tiles);
	var sequences = [];
	for (var index = 0; index <= 7; index++) {
		for (var type = 0; type <= 2; type++) {
			var tiles1 = getTilesInTileArray(sortedTiles, index, type);
			var tiles2 = getTilesInTileArray(sortedTiles, index + 1, type);
			var tiles3 = getTilesInTileArray(sortedTiles, index + 2, type);

			var i = 0;
			while (tiles1.length > i && tiles2.length > i && tiles3.length > i) {
				sequences.push({ tile1: tiles1[i], tile2: tiles2[i], tile3: tiles3[i] });
				i++;
			}
		}
	}
	return sequences;
}

//Return tile array without given tiles
function removeTilesFromTileArray(inputTiles, tiles) {
	var tileArray = [...inputTiles];

	for (let tile of tiles) {
		for (var j = 0; j < tileArray.length; j++) {
			if (tile.index == tileArray[j].index && tile.type == tileArray[j].type && tile.dora == tileArray[j].dora) {
				tileArray.splice(j, 1);
				break;
			}
		}
	}

	return tileArray;
}

//Sort tiles
function sortTiles(inputTiles) {
	var tiles = [...inputTiles];
	tiles = tiles.sort(function (p1, p2) { //Sort dora value descending
		return p2.doraValue - p1.doraValue;
	});
	tiles = tiles.sort(function (p1, p2) { //Sort index ascending
		return p1.index - p2.index;
	});
	tiles = tiles.sort(function (p1, p2) { //Sort type ascending
		return p1.type - p2.type;
	});
	return tiles;
}

//Return number of specific tiles available
function getNumberOfTilesAvailable(index, type) {
	if (index < 1 || index > 9) {
		return 0;
	}
	if (getNumberOfPlayers() == 3 && (index > 1 && index < 9 && type == 1)) {
		return 0;
	}

	return 4 - visibleTiles.filter(tile => tile.index == index && tile.type == type).length;
}

//Return if a tile is furiten
function isTileFuriten(index, type) {
	for (var i = 1; i < getNumberOfPlayers(); i++) { //Check if melds from other player contain discarded tiles of player 0
		if (calls[i].some(tile => tile.index == index && tile.type == type && tile.from == localPosition2Seat(0))) {
			return true;
		}
	}
	return discards[0].some(tile => tile.index == index && tile.type == type);
}

//Return number of specific non furiten tiles available
function getNumberOfNonFuritenTilesAvailable(index, type) {
	if (isTileFuriten(index, type)) {
		return 0;
	}
	return getNumberOfTilesAvailable(index, type);
}

//Return number of specific tile in tile array
function getNumberOfTilesInTileArray(tileArray, index, type) {
	return getTilesInTileArray(tileArray, index, type).length;
}

//Return specific tiles in tile array
function getTilesInTileArray(tileArray, index, type) {
	return tileArray.filter(tile => tile.index == index && tile.type == type);
}

//Update the available tile pool
function updateAvailableTiles() {
	visibleTiles = dora.concat(ownHand, discards[0], discards[1], discards[2], discards[3], calls[0], calls[1], calls[2], calls[3]);
	visibleTiles = visibleTiles.filter(tile => tile != undefined);
	availableTiles = [];
	for (var i = 0; i <= 3; i++) {
		for (var j = 1; j <= 9; j++) {
			if (i == 3 && j == 8) {
				break;
			}
			for (var k = 1; k <= getNumberOfTilesAvailable(j, i); k++) {
				availableTiles.push({
					index: j,
					type: i,
					dora: false,
					doraValue: getTileDoraValue({ index: j, type: i, dora: false })
				});
			}
		}
	}
	for (let vis of visibleTiles) {
		vis.doraValue = getTileDoraValue(vis);
	}
}

//Return sum of red dora/dora indicators for tile
function getTileDoraValue(tile) {
	var dr = 0;

	if (getNumberOfPlayers() == 3) {
		if (tile.type == 3 && tile.index == 4) { //North Tiles
			dr = 1;
		}
	}

	for (let d of dora) {
		if (d.type == tile.type && getHigherTileIndex(d) == tile.index) {
			dr++;
		}
	}

	if (tile.dora) {
		return dr + 1;
	}
	return dr;
}

//Helper function for dora indicators
function getHigherTileIndex(tile) {
	if (tile.type == 3) {
		if (tile.index == 4) {
			return 1;
		}
		return tile.index == 7 ? 5 : tile.index + 1;
	}
	if (getNumberOfPlayers() == 3 && tile.index == 1 && tile.type == 1) {
		return 9; // 3 player mode: 1 man indicator means 9 man is dora
	}
	return tile.index == 9 ? 1 : tile.index + 1;
}

//Returns 0 if not winning hand. Returns value of yaku/dora otherwise.
//Only used for benchmark
function checkWin(hand) {
	var win = getTriplesAndPairs(hand);
	if (parseInt((win.triples.length / 3)) >= 4 && parseInt((win.pairs.length / 2)) >= 1) {
		if (isClosed) {
			return getNumberOfDoras(hand) + getYaku(hand).closed;
		}
		else {
			return getNumberOfDoras(hand) + getYaku(hand).open;
		}
	}
	return 0;
}

//Returns true if DEBUG flag is set
function isDebug() {
	return typeof DEBUG != "undefined";
}

//Adds calls of player 0 to the hand
function getHandWithCalls(inputHand) {
	return inputHand.concat(calls[0]);
}

//Adds a tile if not in array
function pushTileIfNotExists(tiles, index, type) {
	if (tiles.findIndex(t => t.index == index && t.type == type) === -1) {
		var tile = { index: index, type: type, dora: false };
		tile.doraValue = getTileDoraValue(tile);
		tiles.push(tile);
	}
}

//Returns true if player can call riichi
function canRiichi() {
	if (isDebug()) {
		return false;
	}
	var operations = getOperationList();
	for (let op of operations) {
		if (op.type == getOperations().liqi) {
			return true;
		}
	}
	return false;
}

//Returns tiles that can form a triple in one turn for a given tile array
function getUsefulTilesForTriple(tileArray) {
	var tiles = [];
	for (let tile of tileArray) {
		var amount = getNumberOfTilesInTileArray(tileArray, tile.index, tile.type);
		if (tile.type == 3 && amount >= 2) {
			pushTileIfNotExists(tiles, tile.index, tile.type);
			continue;
		}

		if (amount >= 2) {
			pushTileIfNotExists(tiles, tile.index, tile.type);
		}

		var amountLower = getNumberOfTilesInTileArray(tileArray, tile.index - 1, tile.type);
		var amountLower2 = getNumberOfTilesInTileArray(tileArray, tile.index - 2, tile.type);
		var amountUpper = getNumberOfTilesInTileArray(tileArray, tile.index + 1, tile.type);
		var amountUpper2 = getNumberOfTilesInTileArray(tileArray, tile.index + 2, tile.type);
		if (tile.index > 1 && (amount == amountLower + 1 && (amountUpper > 0 || amountLower2 > 0))) { //No need to check if index in bounds
			pushTileIfNotExists(tiles, tile.index - 1, tile.type);
		}

		if (tile.index < 9 && (amount == amountUpper + 1 && (amountLower > 0 || amountUpper2 > 0))) {
			pushTileIfNotExists(tiles, tile.index + 1, tile.type);
		}
	}
	return tiles;
}

//Returns tiles that can form at least a double in one turn for a given tile array
function getUsefulTilesForDouble(tileArray) {
	var tiles = [];
	for (let tile of tileArray) {
		pushTileIfNotExists(tiles, tile.index, tile.type);
		if (tile.type == 3) {
			continue;
		}

		var amountLower = getNumberOfTilesInTileArray(tileArray, tile.index - 1, tile.type);
		var amountUpper = getNumberOfTilesInTileArray(tileArray, tile.index + 1, tile.type);
		if (amountLower == 0 && tile.index - 1 >= 1) {
			pushTileIfNotExists(tiles, tile.index - 1, tile.type);
		}

		if (amountUpper == 0 && tile.index + 1 <= 9) {
			pushTileIfNotExists(tiles, tile.index + 1, tile.type);
		}
	}
	return tiles;
}

// Returns Tile[], where all are terminal/honors.
function getAllTerminalHonorFromHand(hand) {
	return hand.filter(tile => isTerminalOrHonor(tile));
}

//Honor tile or index 1/9
function isTerminalOrHonor(tile) {
	// Honor tiles
	if (tile.type == 3) {
		return true;
	}

	// 1 or 9.
	if (tile.index == 1 || tile.index == 9) {
		return true;
	}

	return false;
}

//Return a safety value which is the threshold for folding (safety lower than this value -> fold)
function getFoldThreshold(tilePrio, strict) {
	var han = tilePrio.yaku.open + tilePrio.dora;
	if (isClosed) {
		han = tilePrio.yaku.closed + tilePrio.dora;
	}
	var priority = tilePrio.priority + ((han - 2) / 10);

	var factor = FOLD_CONSTANT;
	if (strict) {
		factor /= 5;
	}
	if (isLastGame()) { //Fold earlier when first/later when last in last game
		if (getDistanceToLast() > 0) {
			factor *= 1.5; //Last Place -> Later Fold
		}
		else if (getDistanceToFirst() < 0) {
			var dist = (getDistanceToFirst() / 30000) > -0.5 ? getDistanceToFirst() / 30000 : -0.5;
			factor *= 1 + dist; //First Place -> Easier Fold
		}
	}
	factor *= seatWind == 1 ? 1.1 : 1; //Fold later as dealer
	var threshold = Number((1 - (((priority * priority * factor) + (factor / 3)) / 100))).toFixed(2);
	if (threshold > 0.9) {
		threshold = 0.9;
	}
	else if (threshold < 0) {
		threshold = 0;
	}
	return threshold;
}

//Return true if danger is too high in relation to the value of the hand
function shouldFold(tiles) {
	if ((tilesLeft < 4 && tiles[0].efficiency < 3.5) ||
		(tilesLeft < 8 && tiles[0].efficiency < 3) ||
		(tilesLeft < 12 && tiles[0].efficiency < 2)) {
		log("Hand is too far from tenpai before end of game. Fold!");
		strategy = STRATEGIES.FOLD;
		strategyAllowsCalls = false;
		return true;
	}

	var foldThreshold = getFoldThreshold(tiles[0], false);
	log("Would fold this hand below " + foldThreshold + " safety.");

	if (foldThreshold > tiles[0].safety) {
		log("Tile Safety " + tiles[0].safety + " of " + getTileName(tiles[0].tile) + " is too dangerous. Fold this turn!");
		return true;
	}
	return false;
}

//Decide whether to call Riichi
//Based on: https://mahjong.guide/2018/01/28/mahjong-fundamentals-5-riichi/
function shouldRiichi(waits, yaku, handDora) {
	var badWait = waits < WAITS_FOR_RIICHI;
	var lotsOfDoraIndicators = dora.length >= 3;

	//Thirteen Orphans
	if (strategy == STRATEGIES.THIRTEEN_ORPHANS) {
		log("Decline Riichi because of Thirteen Orphan strategy.");
		return false;
	}

	//No waits
	if (waits < 1) {
		log("Decline Riichi because of no waits.");
		return false;
	}

	// Last Place (in last game)? -> Yolo
	if (isLastGame() && getDistanceToLast() > 0) {
		log("Accept Riichi because of last place in last game.");
		return true;
	}

	// Already large lead of more than 10000 points
	if (isLastGame() && getDistanceToFirst() < -10000) {
		log("Decline Riichi because of huge lead in last game.");
		return false;
	}

	// Not Dealer & bad Wait & Riichi is only yaku
	if (seatWind != 1 && badWait && yaku.closed + handDora < 1 && !lotsOfDoraIndicators) {
		log("Decline Riichi because of worthless hand, bad waits and not dealer.");
		return false;
	}

	// High Danger and hand not worth much or bad wait
	if (getCurrentDangerLevel() > 50 && (yaku.closed + handDora < 2 || badWait)) {
		log("Decline Riichi because of worthless hand and high danger.");
		return false;
	}

	// Hand already has high value and enough yaku
	if (yaku.closed >= 1 && yaku.closed + handDora > 3 + (waits / 4)) {
		log("Decline Riichi because of high value hand with enough yaku.");
		return false;
	}

	// Hand already has high value and no yaku
	if (yaku.closed < 1 && handDora >= 2) {
		log("Accept Riichi because of high value hand without yaku.");
		return true;
	}

	// Number of Kans(Dora Indicators) -> more are higher chance for uradora
	if (lotsOfDoraIndicators) {
		log("Accept Riichi because of multiple dora indicators.");
		return true;
	}

	// Don't Riichi when: Last round with bad waits & would lose place with -1000
	if (isLastGame() && badWait && ((getDistanceToPlayer(1) >= -1000 && getDistanceToPlayer(1) <= 0) ||
		(getDistanceToPlayer(2) >= -1000 && getDistanceToPlayer(2) <= 0) ||
		(getNumberOfPlayers() > 3 && getDistanceToPlayer(3) >= -1000 && getDistanceToPlayer(3) <= 0))) {
		log("Decline Riichi because distance to next player is < 1000 in last game.");
		return false;
	}

	// Default: Just do it.
	log("Accept Riichi by default.");
	return true;
}

//Negative number: Distance to second
//Positive number: Distance to first
function getDistanceToFirst() {
	if (getNumberOfPlayers() == 3) {
		return Math.max(getPlayerScore(1), getPlayerScore(2)) - getPlayerScore(0);
	}
	return Math.max(getPlayerScore(1), getPlayerScore(2), getPlayerScore(3)) - getPlayerScore(0);
}

//Negative number: Distance to last
//Positive number: Distance to third
function getDistanceToLast() {
	if (getNumberOfPlayers() == 3) {
		return Math.min(getPlayerScore(1), getPlayerScore(2)) - getPlayerScore(0);
	}
	return Math.min(getPlayerScore(1), getPlayerScore(2), getPlayerScore(3)) - getPlayerScore(0);
}


//Positive: Other player is in front of you
function getDistanceToPlayer(player) {
	if (getNumberOfPlayers() == 3 && player == 3) {
		return 0;
	}
	return getPlayerScore(player) - getPlayerScore(0);
}

//Check if "All Last"
function isLastGame() {
	if (isEastRound()) {
		return getRound() == 3 || getRoundWind() > 1; //East 4 or South X
	}
	return (getRound() == 2 && getRoundWind() > 1) || getRoundWind() > 2; //South 3 or West X
}

//Check if Hand is complete
function isWinningHand(numberOfTriples, numberOfPairs) {
	if (strategy == STRATEGIES.CHIITOITSU) {
		return numberOfPairs == 7;
	}
	return numberOfTriples == 4 && numberOfPairs == 1;
}

//Returns the binomialCoefficient for two numbers. Needed for chance to draw tile calculation. Fails if a faculty of > 134 is needed (should not be the case since there are 134 tiles)
function binomialCoefficient(a, b) {
	var numerator = facts[a];
	var denominator = facts[a - b] * facts[b];
	return numerator / denominator;
} 

//################################
// LOGGING
// Contains logging functions
//################################

//Print string to HTML or console
function log(t) {
	if (isDebug()) {
		document.body.innerHTML += t + "<br>";
	}
	else {
		console.log(t);
	}
}

//Print all tiles in hand
function printHand(hand) {
	var handString = getStringForTiles(hand);
	log("Hand:" + handString);
}

//Get String for array of tiles
function getStringForTiles(tiles) {
	var tilesString = "";
	var oldType = "";
	tiles.forEach(function (tile) {
		if (getNameForType(tile.type) != oldType) {
			tilesString += oldType;
			oldType = getNameForType(tile.type);
		}
		if (tile.dora == 1) {
			tilesString += "0";
		}
		else {
			tilesString += tile.index;
		}
	});
	tilesString += oldType;
	return tilesString;
}

//Print tile name
function printTile(tile) {
	log(getTileName(tile));
}

//Print given tile priorities
function printTilePriority(tiles) {
	for (var i = 0; i < tiles.length && i < LOG_AMOUNT; i++) {
		log(getTileName(tiles[i].tile) + ": Priority: <" + Number(tiles[i].priority).toFixed(3) + "> Efficiency: <" + Number(tiles[i].efficiency).toFixed(3) + "> Yaku Open: <" + Number(tiles[i].yaku.open).toFixed(3) + "> Yaku Closed: <" + Number(tiles[i].yaku.closed).toFixed(3) + "> Dora: <" + Number(tiles[i].dora).toFixed(3) + "> Waits: <" + Number(tiles[i].waits).toFixed(3) + "> Safety: " + Number(tiles[i].safety).toFixed(2));
	}
}

//Input string to get an array of tiles (e.g. "123m456p789s1z")
function getTilesFromString(inputString) {
	var numbers = [];
	var tiles = [];
	for (let input of inputString) {
		var type = 4;
		switch (input) {
			case "p":
				type = 0;
				break;
			case "m":
				type = 1;
				break;
			case "s":
				type = 2;
				break;
			case "z":
				type = 3;
				break;
			default:
				numbers.push(input);
				break;
		}
		if (type != "4") {
			for (let number of numbers) {
				if (parseInt(number) == 0) {
					tiles.push({ index: 5, type: type, dora: true, doraValue: 1 });
				}
				else {
					tiles.push({ index: parseInt(number), type: type, dora: false, doraValue: 0 });
				}
			}
			numbers = [];
		}
	}
	return tiles;
}

//Input string to get a tiles (e.g. "1m")
function getTileFromString(inputString) {
	var type = 4;
	var dr = false;
	switch (inputString[1]) {
		case "p":
			type = 0;
			break;
		case "m":
			type = 1;
			break;
		case "s":
			type = 2;
			break;
		case "z":
			type = 3;
			break;
	}
	if (inputString[0] == "0") {
		inputString[0] = 5;
		dr = true;
	}
	if (type != "4") {
		var tile = { index: parseInt(inputString[0]), type: type, dora: dr };
		tile.doraValue = getTileDoraValue(tile);
		return tile;
	}
	return null;
}

//Returns the name for a tile
function getTileName(tile) {
	if (tile.dora == true) {
		return "0" + getNameForType(tile.type);
	}
	return tile.index + getNameForType(tile.type);
}

//Returns the corresponding char for a type
function getNameForType(type) {
	switch (type) {
		case 0:
			return "p";
		case 1:
			return "m";
		case 2:
			return "s";
		case 3:
			return "z";
		default:
			return "?";
	}
}

//returns a string for the current state of the game
function getDebugString() {
	var debugString = "";
	debugString += getStringForTiles(dora) + "|";
	debugString += getStringForTiles(ownHand) + "|";
	debugString += getStringForTiles(calls[0]) + "|";
	debugString += getStringForTiles(calls[1]) + "|";
	debugString += getStringForTiles(calls[2]) + "|";
	if (getNumberOfPlayers() == 4) {
		debugString += getStringForTiles(calls[3]) + "|";
	}
	debugString += getStringForTiles(discards[0]) + "|";
	debugString += getStringForTiles(discards[1]) + "|";
	debugString += getStringForTiles(discards[2]) + "|";
	if (getNumberOfPlayers() == 4) {
		debugString += getStringForTiles(discards[3]) + "|";
	}
	if (getNumberOfPlayers() == 4) {
		debugString += (isPlayerRiichi(0) * 1) + "," + (isPlayerRiichi(1) * 1) + "," + (isPlayerRiichi(2) * 1) + "," + (isPlayerRiichi(3) * 1) + "|";
	}
	else {
		debugString += (isPlayerRiichi(0) * 1) + "," + (isPlayerRiichi(1) * 1) + "," + (isPlayerRiichi(2) * 1) + "|";
	}
	debugString += seatWind + "|";
	debugString += roundWind + "|";
	debugString += tilesLeft;
	return debugString;
}

//################################
// YAKU
// Contains the yaku calculations
//################################

const YAKUMAN_SCORE = 10; //Yakuman -> 10?

//Returns the closed and open yaku value of the hand
function getYaku(inputHand, inputCalls) {

	//Remove 4th tile from Kans, which could lead to false yaku calculation
	inputCalls = inputCalls.filter(tile => !tile.kan);

	let hand = inputHand.concat(inputCalls); //Add calls to hand

	let yakuOpen = 0;
	let yakuClosed = 0;

	// ### 1 Han ###

	let triplesAndPairs = getTriplesAndPairs(hand);
	let triplets = getTripletsAsArray(hand);
	let sequences = getBestSequenceCombination(inputHand).concat(getBestSequenceCombination(inputCalls));

	//Yakuhai
	//Wind/Dragon Triples
	//Open
	if (strategy != STRATEGIES.CHIITOITSU) {
		let yakuhai = getYakuhai(triplesAndPairs.triples);
		yakuOpen += yakuhai.open;
		yakuClosed += yakuhai.closed;
	}

	//Riichi (Bot has better results without additional value for Riichi)
	//Closed
	//let riichi = getRiichi(tenpai);
	//yakuOpen += riichi.open;
	//yakuClosed += riichi.closed;

	//Tanyao
	//Open
	let tanyao = getTanyao(hand, inputCalls);
	yakuOpen += tanyao.open;
	yakuClosed += tanyao.closed;

	//Pinfu (Bot has better results without additional value for Pinfu)
	//Closed
	//let pinfu = getPinfu(triplesAndPairs, doubles, tenpai);
	//yakuOpen += pinfu.open;
	//yakuClosed += pinfu.closed;

	//Iipeikou (Identical Sequences in same type)
	//Closed
	let iipeikou = getIipeikou(sequences);
	yakuOpen += iipeikou.open;
	yakuClosed += iipeikou.closed;

	// ### 2 Han ###

	//Chiitoitsu
	//7 Pairs
	//Closed
	// -> Not necessary, because own strategy

	//Sanankou
	//3 concealed triplets
	//Open*
	let sanankou = getSanankou(triplets);
	yakuOpen += sanankou.open;
	yakuClosed += sanankou.closed;

	//Sankantsu
	//3 Kans
	//Open
	//-> TODO: Should not influence score, but Kan calling.

	//Toitoi
	//All Triplets
	//Open
	let toitoi = getToitoi(triplets);
	yakuOpen += toitoi.open;
	yakuClosed += toitoi.closed;

	//Sanshoku Doukou
	//3 same index triplets in all 3 types
	//Open
	let sanshokuDouko = getSanshokuDouko(triplets);
	yakuOpen += sanshokuDouko.open;
	yakuClosed += sanshokuDouko.closed;

	//Sanshoku Doujun
	//3 same index straights in all types
	//Open/-1 Han after call
	let sanshoku = getSanshokuDoujun(sequences);
	yakuOpen += sanshoku.open;
	yakuClosed += sanshoku.closed;

	//Shousangen
	//Little 3 Dragons (2 Triplets + Pair)
	//Open
	let shousangen = getShousangen(hand);
	yakuOpen += shousangen.open;
	yakuClosed += shousangen.closed;

	//Chanta
	//Half outside Hand (including terminals)
	//Open/-1 Han after call
	let chanta = getChanta(triplets, sequences, triplesAndPairs.pairs);
	yakuOpen += chanta.open;
	yakuClosed += chanta.closed;

	//Honrou
	//All Terminals and Honors (means: Also 4 triplets)
	//Open
	let honrou = getHonrou(hand);
	yakuOpen += honrou.open;
	yakuClosed += honrou.closed;

	//Ittsuu
	//Pure Straight
	//Open/-1 Han after call
	let ittsuu = getIttsuu(sequences);
	yakuOpen += ittsuu.open;
	yakuClosed += ittsuu.closed;

	//3 Han

	//Ryanpeikou
	//2 times identical sequences (2 Iipeikou)
	//Closed

	//Junchan
	//All Terminals
	//Open/-1 Han after call
	let junchan = getJunchan(triplets, sequences, triplesAndPairs.pairs);
	yakuOpen += junchan.open;
	yakuClosed += junchan.closed;

	//Honitsu
	//Half Flush
	//Open/-1 Han after call
	let honitsu = getHonitsu(hand);
	yakuOpen += honitsu.open;
	yakuClosed += honitsu.closed;

	//6 Han

	//Chinitsu
	//Full Flush
	//Open/-1 Han after call
	let chinitsu = getChinitsu(hand);
	yakuOpen += chinitsu.open;
	yakuClosed += chinitsu.closed;

	//Yakuman

	//Daisangen
	//Big Three Dragons
	//Open
	let daisangen = getDaisangen(hand);
	yakuOpen += daisangen.open;
	yakuClosed += daisangen.closed;

	//Suuankou
	//4 Concealed Triplets
	//Closed
	let suuankou = getSuuankou(hand);
	yakuOpen += suuankou.open;
	yakuOpen += suuankou.closed;

	//Tsuuiisou
	//All Honours
	//Open
	let tsuuiisou = getTsuuiisou(hand, triplets);
	yakuOpen += tsuuiisou.open;
	yakuClosed += tsuuiisou.closed;

	//Ryuuiisou
	//All Green
	//Open
	let ryuuiisou = getRyuuiisou(hand);
	yakuOpen += ryuuiisou.open;
	yakuClosed += ryuuiisou.closed;

	//Chinroutou
	//All Terminals
	//Open
	let chinroutou = getChinroutou(hand);
	yakuOpen += chinroutou.open;
	yakuClosed += chinroutou.closed;

	//Suushiihou
	//Four Little Winds
	//Open
	let suushiihou = getSuushiihou(hand);
	yakuOpen += suushiihou.open;
	yakuClosed += suushiihou.closed;

	//Suukantsu
	//4 Kans
	//Open
	//-> TODO: Should not influence score, but Kan calling.

	//Chuuren poutou
	//9 Gates
	//Closed
	let chuurenpoutou = getChuurenPoutou(hand);
	yakuOpen += chuurenpoutou.open;
	yakuClosed += chuurenpoutou.closed

	//Kokushi musou
	//Thirteen Orphans
	//Closed

	//Double Yakuman

	//Suuankou tanki
	//4 Concealed Triplets Single Wait
	//Closed

	//Kokushi musou juusan menmachi
	//13 Wait Thirteen Orphans
	//Closed

	//Junsei chuuren poutou
	//True Nine Gates
	//Closed

	//Daisuushii
	//Four Big Winds
	//Open

	return { open: yakuOpen, closed: yakuClosed };
}

//Yakuhai
function getYakuhai(triples) {
	let yakuhai = 0;
	yakuhai = triples.filter(tile => tile.type == 3 && (tile.index > 4 || tile.index == seatWind || tile.index == roundWind)).length / 3;
	yakuhai += triples.filter(tile => tile.type == 3 && tile.index == seatWind && tile.index == roundWind).length / 3;
	return { open: yakuhai, closed: yakuhai };
}

//Riichi
function getRiichi(tenpai) {
	if (tenpai) {
		return { open: 0, closed: 1 };
	}
	return { open: 0, closed: 0 };
}

//Tanyao
function getTanyao(hand, inputCalls) {
	if (hand.filter(tile => tile.type != 3 && tile.index > 1 && tile.index < 9).length >= 13 && inputCalls.filter(tile => tile.type == 3 || tile.index == 1 || tile.index == 9).length == 0) {
		return { open: 1, closed: 1 };
	}
	return { open: 0, closed: 0 };
}

//Pinfu (Does not detect all Pinfu)
function getPinfu(triplesAndPairs, doubles, tenpai) {

	if (isClosed && tenpai && parseInt(triplesAndPairs.triples.length / 3) == 3 && parseInt(triplesAndPairs.pairs.length / 2) == 1 && getTripletsAsArray(triplesAndPairs.triples).length == 0) {
		doubles = sortTiles(doubles);
		for (let i = 0; i < doubles.length - 1; i++) {
			if (doubles[i].index > 1 && doubles[i + 1].index < 9 && Math.abs(doubles[0].index - doubles[1].index) == 1) {
				return { open: 1, closed: 1 };
			}
		}
	}
	return { open: 0, closed: 0 };
}

//Iipeikou
function getIipeikou(triples) {
	for (let triple of triples) {
		let tiles1 = getNumberOfTilesInTileArray(triples, triple.index, triple.type);
		let tiles2 = getNumberOfTilesInTileArray(triples, triple.index + 1, triple.type);
		let tiles3 = getNumberOfTilesInTileArray(triples, triple.index + 2, triple.type);
		if (tiles1 == 2 && tiles2 == 2 && tiles3 == 2) {
			return { open: 0, closed: 1 };
		}
	}
	return { open: 0, closed: 0 };
}

//Sanankou
function getSanankou(triplets) {
	if (!isConsideringCall) {
		if (parseInt(triplets.length / 3) >= 3) {
			return { open: 2, closed: 2 };
		}
	}

	return { open: 0, closed: 0 };
}

//Toitoi
function getToitoi(triplets) {
	if (parseInt(triplets.length / 3) >= 4) {
		return { open: 2, closed: 2 };
	}

	return { open: 0, closed: 0 };
}

//Sanshoku Douko
function getSanshokuDouko(triplets) {
	for (let i = 1; i <= 9; i++) {
		if (triplets.filter(tile => tile.index == i && tile.type < 3).length >= 9) {
			return { open: 2, closed: 2 };
		}
	}
	return { open: 0, closed: 0 };
}

//Sanshoku Doujun
function getSanshokuDoujun(sequences) {
	for (let i = 1; i <= 7; i++) {
		if (sequences.filter(tile => tile.index == i || tile.index == i + 1 || tile.index == i + 2).length >= 9) {
			return { open: 1, closed: 2 };
		}
	}
	return { open: 0, closed: 0 };
}

//Shousangen
function getShousangen(hand) {
	if (hand.filter(tile => tile.type == 3 && tile.index >= 5).length == 8 &&
		hand.filter(tile => tile.type == 3 && tile.index == 5).length < 4 &&
		hand.filter(tile => tile.type == 3 && tile.index == 6).length < 4 &&
		hand.filter(tile => tile.type == 3 && tile.index == 7).length < 4) {
		return { open: 2, closed: 2 };
	}
	return { open: 0, closed: 0 };
}

//Daisangen
function getDaisangen(hand) {
	if (hand.filter(tile => tile.type === 3 && tile.index === 5).length >= 3 &&
		hand.filter(tile => tile.type === 3 && tile.index === 6).length >= 3 &&
		hand.filter(tile => tile.type === 3 && tile.index === 7).length >= 3) {
		return { open: YAKUMAN_SCORE, closed: YAKUMAN_SCORE };
	}
	return { open: 0, closed: 0 };
}

//Suuankou
function getSuuankou(triplets) {
	if (!isConsideringCall) {
		if (parseInt(triplets.length / 3) >= 4) {
			return { open: 0, closed: YAKUMAN_SCORE };
		}
	}
	return { open: 0, closed: 0 };
}

//Tsuuiisou
function getTsuuiisou(hand, triplets) {
	if (hand.filter(tile => tile.type === 3).length >= 13) {
		if (parseInt(triplets.length / 3) >= 3) {
			return { open: YAKUMAN_SCORE, closed: YAKUMAN_SCORE };
		}
	}
	return { open: 0, closed: 0 };
}

//Ryuuiisou
function getRyuuiisou(hand) {
	if (hand.filter(tile => 
		(tile.type == 2 && (tile.index === 2
						|| tile.index === 3
						|| tile.index === 4
						|| tile.index === 6
						|| tile.index === 8))
			|| (tile.type === 3 && tile.index === 6)).length === hand.length) {
		return { open: YAKUMAN_SCORE, closed: YAKUMAN_SCORE };
	}
	return { open: 0, closed: 0 };
}

//Chinroutou
function getChinroutou(hand) {
	if (hand.find(tile => tile.type === 3 || (tile.index != 1 && tile.index != 9))) {
		return { open: 0, closed: 0 };
	} else {
		return { open: YAKUMAN_SCORE, closed: YAKUMAN_SCORE };
	}
}

//Suushiihou
function getSuushiihou(hand) {
	if (hand.filter(tile => tile.type === 3 && tile.index <= 4).length == 11) {
		return { open: YAKUMAN_SCORE, closed: YAKUMAN_SCORE };
	}
	return { open: 0, closed: 0 };
}

//ChuurenPoutou
function getChuurenPoutou(hand, pairs) {
	if (hand.find(tile => tile.type != hand[0].type)) {
		return { open: 0, closed: 0 };
	}

	
}

//Chanta - poor detection
function getChanta(triplets, sequences, pairs) {
	if ((triplets.concat(pairs)).filter(tile => tile.type == 3 || tile.index == 1 || tile.index == 9).length + (sequences.filter(tile => tile.index == 1 || tile.index == 9).length * 3) >= 13) {
		return { open: 1, closed: 2 };
	}
	return { open: 0, closed: 0 };
}

//Honrou
function getHonrou(hand) {
	if (hand.filter(tile => tile.type == 3 || tile.index == 1 || tile.index == 9).length >= 13) {
		return { open: 3, closed: 2 }; // - Added to Chanta
	}
	return { open: 0, closed: 0 };
}

//Junchan
function getJunchan(triplets, sequences, pairs) {
	if ((triplets.concat(pairs)).filter(tile => tile.type != 3 && (tile.index == 1 || tile.index == 9)).length + (sequences.filter(tile => tile.index == 1 || tile.index == 9).length * 3) >= 13) {
		return { open: 1, closed: 1 }; // - Added to Chanta
	}
	return { open: 0, closed: 0 };
}

//Ittsuu
function getIttsuu(triples) {
	for (let j = 0; j <= 2; j++) {
		for (let i = 1; i <= 9; i++) {
			if (!triples.some(tile => tile.type == j && tile.index == i)) {
				break;
			}
			if (i == 9) {
				return { open: 1, closed: 2 };
			}
		}
	}
	return { open: 0, closed: 0 };
}

//Honitsu
function getHonitsu(hand) {
	if (hand.filter(tile => tile.type == 3 || tile.type == 0).length >= 13 || hand.filter(tile => tile.type == 3 || tile.type == 1).length >= 13 || hand.filter(tile => tile.type == 3 || tile.type == 2).length >= 13) { //&& tenpai ?
		return { open: 2, closed: 3 };
	}
	return { open: 0, closed: 0 };
}

//Chinitsu
function getChinitsu(hand) {
	if (hand.filter(tile => tile.type == 0).length >= 13 || hand.filter(tile => tile.type == 1).length >= 13 || hand.filter(tile => tile.type == 2).length >= 13) { //&& tenpai ?
		return { open: 3, closed: 3 }; //Score gets added to honitsu -> 5/6 han
	}
	return { open: 0, closed: 0 };
}
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
		averageSafety += getTileSafety(tile, newHand);
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
		log("Call would result in less waits! Declined!");
		declineCall(operation);
		return false;
	}

	if (isClosed && newHandValue.yaku.open + newHandValue.dora < 2 && newHandValue.efficiency < 3.5 && seatWind != 1) { // Hand is worthless and slow and not dealer. Should prevent cheap yakuhai or tanyao calls
		log("Hand is cheap and slow! Declined!");
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
	else if (newHandValue.efficiency >= 3.5 && (newHandValue.yaku.open + newHandValue.dora) >= (handValue.yaku.open + handValue.dora) * 0.9) { //Hand is already open and not much value is lost
		log("Call accepted because it makes the hand ready!");
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
	if (handValue.priority < 1.2) { //Hand is bad -> abort game
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
			if (tile.priority + 0.1 > tiles[0].priority) { //If next tile is not much worse in value than the top priority discard
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
		return p2.priority - p1.priority;
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
			chance *= 1.5; //More value to possible triples when hand is open (can call pons from all players)
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
	var safety = getTileSafety(discardedTile, hand);
	var priority = calculateTilePriority(efficiency, yaku, doraValue, waits, safety);
	return { tile: discardedTile, priority: priority, efficiency: efficiency, dora: doraValue, yaku: yaku, waits: waits, safety: safety };
}

function calculateTilePriority(efficiency, yakus, doraValue, waits, safety) {
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
		var safety = getTileSafety(ownHand[i], newHand);
		var priority = calculateTilePriority(efficiency, yaku, doraValue, waits, safety);
		tiles.push({ tile: ownHand[i], priority: priority, efficiency: efficiency, dora: doraValue, yaku: yaku, waits: waits, safety: safety });
	}
	tiles.sort(function (p1, p2) {
		return p2.priority - p1.priority;
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
		var safety = getTileSafety(ownHand[i], hand);
		var priority = calculateTilePriority(efficiency, yaku, doraValue, waits, safety);

		tiles.push({ tile: ownHand[i], priority: priority, efficiency: efficiency, dora: doraValue, yaku: yaku, waits: waits, safety: safety });

	}

	tiles.sort(function (p1, p2) {
		return p2.priority - p1.priority;
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
//################################
// AI DEFENSE
// Defensive part of the AI
//################################

//Returns danger of tile for all players as a number from 0-100
//Takes into account Genbutsu (Furiten for opponents), Suji, Walls and general knowledge about remaining tiles.
function getTileDanger(tile, hand) {
	var dangerPerPlayer = [0, 100, 100, 100];
	if (getNumberOfPlayers() == 3) {
		dangerPerPlayer = [0, 100, 100];
	}
	for (var i = 1; i < getNumberOfPlayers(); i++) { //Foreach Player
		if (getLastTileInDiscard(i, tile) != null) { // Check if tile in discard (Genbutsu)
			dangerPerPlayer[i] = 0;
			continue;
		}

		dangerPerPlayer[i] = getWaitScoreForTileAndPlayer(i, tile, true); //Suji, Walls and general knowledge about remaining tiles.

		if (dangerPerPlayer[i] <= 0) {
			continue;
		}

		//Is Dora? -> 10% more dangerous
		dangerPerPlayer[i] *= (1 + (getTileDoraValue(tile) / 10));

		//Is close to Dora? -> 5% more dangerous
		if (isTileCloseToDora(tile)) {
			dangerPerPlayer[i] *= 1.05;
		}

		//Is the player going for a flush of that type? -> 30% more dangerous
		if (isGoingForFlush(i, tile.type)) {
			dangerPerPlayer[i] *= 1.3;
		}
		else if (isGoingForFlush(i, 0) || isGoingForFlush(i, 1) || isGoingForFlush(i, 2)) { //Is the player going for any other flush?
			if (tile.type == 3) {
				dangerPerPlayer[i] *= 1.2; //Honor tiles are also dangerous
			}
			else {
				dangerPerPlayer[i] /= 1.2; //Other tiles are less dangerous
			}
		}
		//Is Tile close to the tile discarded on the riichi turn? -> 20% more dangerous
		if (isTileCloseToRiichiTile(i, tile)) {
			dangerPerPlayer[i] *= 1.2;
		}

		//Danger is at least 5
		if (dangerPerPlayer[i] < 5) {
			dangerPerPlayer[i] = 5;
		}

		//Multiply with Danger Level
		dangerPerPlayer[i] *= getPlayerDangerLevel(i) / 100;
	}
	for (var i = 1; i < getNumberOfPlayers(); i++) { // Check for Sakigiri for each player
		dangerPerPlayer[i] += shouldKeepSafeTile(i, hand, tile);
	}

	var dangerNumber = ((dangerPerPlayer[1] + dangerPerPlayer[2] + dangerPerPlayer[3] + Math.max.apply(null, dangerPerPlayer)) / 4); //Most dangerous player counts twice

	if (getNumberOfPlayers() == 3) {
		dangerNumber = ((dangerPerPlayer[1] + dangerPerPlayer[2] + Math.max.apply(null, dangerPerPlayer)) / 4); //Most dangerous player counts twice
	}
	return dangerNumber;
}

//Returns danger level for players. 100: Tenpai (Riichi)
function getPlayerDangerLevel(player) {
	if (getPlayerLinkState(player) == 0) { //Disconnected -> Safe
		return 0;
	}

	if (getNumberOfPlayerHand(player) < 13) { //Some Calls
		var dangerLevel = parseInt(190 - (getNumberOfPlayerHand(player) * 8) - (tilesLeft * 1.75));
	}
	else {
		dangerLevel = 15 - tilesLeft; //Full hand without Riichi -> Nearly always safe
	}


	if (dangerLevel > 80) {
		dangerLevel = 80;
	}
	else if (isPlayerRiichi(player)) { //Riichi
		dangerLevel = 100;
	}
	else if (dangerLevel < 0) {
		return 0;
	}

	//Account for possible values of hands.

	if (getSeatWind(player) == 1) { //Is Dealer
		dangerLevel += 10;
	}

	dangerLevel += getNumberOfDoras(calls[player]) * 10;

	//3 player mode: More dangerous when more kita
	if (getNumberOfPlayers() == 3) {
		dangerLevel += (getNumberOfKitaOfPlayer(player) * getTileDoraValue({ index: 4, type: 3 })) * 10;
	}

	if (isGoingForFlush(player, 0) || isGoingForFlush(player, 1) || isGoingForFlush(player, 2)) {
		dangerLevel += 10;
	}

	if (tilesLeft > 50) {
		dangerLevel *= 0.5 + ((70 - tilesLeft) / 40); //Danger scales over the first few turns.
	}

	return dangerLevel;
}

//Returns the current Danger level of the table
function getCurrentDangerLevel() { //Most Dangerous Player counts extra
	if (getNumberOfPlayers() == 3) {
		return ((getPlayerDangerLevel(1) + getPlayerDangerLevel(2) + Math.max(getPlayerDangerLevel(1), getPlayerDangerLevel(2))) / 3);
	}
	return ((getPlayerDangerLevel(1) + getPlayerDangerLevel(2) + getPlayerDangerLevel(3) + Math.max(getPlayerDangerLevel(1), getPlayerDangerLevel(2), getPlayerDangerLevel(3))) / 4);
}

//Returns the number of turns ago when the tile was most recently discarded
function getMostRecentDiscardDanger(tile, player, includeOthers) {
	var danger = 99;
	for (var i = 0; i < getNumberOfPlayers(); i++) {
		var r = getLastTileInDiscard(i, tile);
		if (player == i && r != null) { //Tile is in own discards
			return 0;
		}
		if (wasTileCalledFromOtherPlayers(player, tile)) { //The tile was discarded and called by someone else
			return 0;
		}
		if (!includeOthers) {
			continue;
		}
		if (r != null && r.numberOfPlayerHandChanges[player] < danger) {
			danger = r.numberOfPlayerHandChanges[player];
		}
	}

	return danger;
}

//Returns the position of a tile in discards
function getLastTileInDiscard(player, tile) {
	for (var i = discards[player].length - 1; i >= 0; i--) {
		if (discards[player][i].index == tile.index && discards[player][i].type == tile.type) {
			return discards[player][i];
		}
	}
	return null;
}

//Checks if a tile has been called by someone
function wasTileCalledFromOtherPlayers(player, tile) {
	for (var i = 0; i < getNumberOfPlayers(); i++) {
		if (i == player) { //Skip own melds
			continue;
		}
		for (let t of calls[i]) { //Look through all melds and check where the tile came from
			if (t.from == localPosition2Seat(getCorrectPlayerNumber(player)) && tile.index == t.index && tile.type == t.type) {
				return true;
			}
		}
	}
	return false;
}

//Returns the safety of a tile
//Based on the tile danger, but with exponential growth
function getTileSafety(tile, hand) {
	if (typeof tile == 'undefined') {
		return 1;
	}
	return 1 - (Math.pow(getTileDanger(tile, hand) / 10, 2) / 100);
}

//Returns true if the player is going for a flush of a given type
function isGoingForFlush(player, type) {
	if (calls[player].length < 6 || calls[player].some(tile => tile.type != type && tile.type != 3)) { //Not enough or different calls -> false
		return false;
	}
	if (discards[player].filter(tile => tile.type == type).length >= (discards[player].length / 6)) { //Many discards of that type -> false
		return false;
	}
	return true;
}

//Returns the Wait Score for a Tile (Possible that anyone is waiting for this tile)
function getWaitScoreForTile(tile) {
	var score = 0;
	for (var i = 1; i < getNumberOfPlayers(); i++) {
		score += getWaitScoreForTileAndPlayer(i, tile, true);
	}
	return score / 3;
}

//Returns a score how likely this tile can form the last triple/pair for a player
//Suji, Walls and general knowledge about remaining tiles.
//If "includeOthers" parameter is set to true it will also check if other players recently discarded relevant tiles
function getWaitScoreForTileAndPlayer(player, tile, includeOthers) {
	var tile0 = getNumberOfTilesAvailable(tile.index, tile.type);
	var tile0Public = tile0 + getNumberOfTilesInTileArray(ownHand, tile.index, tile.type);
	var factor = getFuritenValue(player, tile, includeOthers);

	var score = 0;

	//Same tile
	score += tile0 * (tile0Public + 1) * 6;

	if (getNumberOfPlayerHand(player) == 1 || tile.type == 3) {
		return score * factor; //Return normalized result
	}

	var tileL3 = getNumberOfTilesAvailable(tile.index - 3, tile.type);
	var tileL3Public = tileL3 + getNumberOfTilesInTileArray(ownHand, tile.index - 3, tile.type);
	var factorL = getFuritenValue(player, { index: tile.index - 3, type: tile.type }, includeOthers);

	var tileL2 = getNumberOfTilesAvailable(tile.index - 2, tile.type);
	var tileL1 = getNumberOfTilesAvailable(tile.index - 1, tile.type);
	var tileU1 = getNumberOfTilesAvailable(tile.index + 1, tile.type);
	var tileU2 = getNumberOfTilesAvailable(tile.index + 2, tile.type);
	var tileU3 = getNumberOfTilesAvailable(tile.index + 3, tile.type);
	var tileU3Public = tileU3 + getNumberOfTilesInTileArray(ownHand, tile.index + 3, tile.type);
	var factorU = getFuritenValue(player, { index: tile.index + 3, type: tile.type }, includeOthers);

	//Ryanmen Waits
	score += (tileL1 * tileL2) * (tile0Public + tileL3Public) * factorL;
	score += (tileU1 * tileU2) * (tile0Public + tileU3Public) * factorU;

	//Bridge Wait
	score += (tileL1 * tileU1 * tile0Public);

	score *= factor;

	if (score > 180) {
		score = 180 + ((score - 180) / 4); //add "overflow" that is worth less
	}

	score /= 1.6; //Divide by this number to normalize result (more or less)

	return score;
}

//Returns 0 if tile is 100% furiten, 1 if not. Value between 0-1 is returned if furiten tile was not called some turns ago.
function getFuritenValue(player, tile, includeOthers) {
	var danger = getMostRecentDiscardDanger(tile, player, includeOthers);
	if (danger == 0) {
		return 0;
	}
	else if (danger == 1) {
		if (calls[player].length > 0) {
			return 0.5;
		}
		return 0.95;
	}
	else if (danger == 2) {
		if (calls[player].length > 0) {
			return 0.8;
		}
	}
	return 1;
}

//Sets tile safeties for discards
function updateDiscardedTilesSafety() {
	for (var k = 1; k < getNumberOfPlayers(); k++) { //For all other players
		for (var i = 0; i < getNumberOfPlayers(); i++) { //For all discard ponds
			for (var j = 0; j < discards[i].length; j++) { //For every tile in it
				if (typeof (discards[i][j].numberOfPlayerHandChanges) == "undefined") {
					discards[i][j].numberOfPlayerHandChanges = [0, 0, 0, 0];
				}
				if (hasPlayerHandChanged(k)) {
					if (j == discards[i].length - 1 && k < i && (k <= seat2LocalPosition(getCurrentPlayer()) || seat2LocalPosition(getCurrentPlayer()) == 0)) { //Ignore tiles by players after hand change
						continue;
					}
					discards[i][j].numberOfPlayerHandChanges[k]++;
				}
			}
		}
		rememberPlayerHand(k);
	}
}

//Pretty simple (all 0), but should work in case of crash -> count intelligently upwards
function initialDiscardedTilesSafety() {
	for (var k = 1; k < getNumberOfPlayers(); k++) { //For all other players
		for (var i = 0; i < getNumberOfPlayers(); i++) { //For all discard ponds
			for (var j = 0; j < discards[i].length; j++) { //For every tile in it
				if (typeof (discards[i][j].numberOfPlayerHandChanges) == "undefined") {
					discards[i][j].numberOfPlayerHandChanges = [0, 0, 0, 0];
				}
				var bonus = 0;
				if (k < i && (k <= seat2LocalPosition(getCurrentPlayer()) || seat2LocalPosition(getCurrentPlayer()) == 0)) {
					bonus = 1;
				}
				discards[i][j].numberOfPlayerHandChanges[k] = discards[i].length - j - bonus;
			}
		}
	}
}

//Returns a value which indicates how important it is to keep the given tile early (Sakigiri something else)
function shouldKeepSafeTile(player, hand, discardTile) {
	if (discards[player].length < 3) { // Not many discards yet (very early) => ignore Sakigiri
		return 0;
	}
	if (getPlayerDangerLevel(player) > 0) { // Obviously don't sakigiri when the player could already be in tenpai
		return 0;
	}
	if (getLastTileInDiscard(player, discardTile) == null && getWaitScoreForTileAndPlayer(player, discardTile, false) >= 20) { // Tile is not safe, has no value for sakigiri
		return 0;
	}
	var safeTiles = 0;
	for (let tile of hand) { // How many safe tiles do we currently have?
		if (getLastTileInDiscard(player, tile) != null || getWaitScoreForTileAndPlayer(player, tile, false) < 20) {
			safeTiles++;
		}
	}

	var sakigiri = (2 - safeTiles) * (SAKIGIRI_VALUE * 10);
	if (sakigiri < 0) { // More than 2 safe tiles: Sakigiri not necessary
		return 0;
	}
	if (getSeatWind(player) == 1) { // Player is dealer
		sakigiri *= 1.5;
	}
	return sakigiri;
}

//Check if the tile is close to the riichi tile of a player
function isTileCloseToRiichiTile(player, tile) {
	if (!isPlayerRiichi(player) || riichiTiles[getCorrectPlayerNumber(player)] == null || riichiTiles[getCorrectPlayerNumber(player)] == 'undefined') {
		return false;
	}
	if (tile.type != 3 && tile.type == riichiTiles[getCorrectPlayerNumber(player)].type) {
		return tile.index >= riichiTiles[getCorrectPlayerNumber(player)].index - 3 && tile.index <= riichiTiles[getCorrectPlayerNumber(player)].index + 3;
	}
}

//Check if the tile is close to dora
function isTileCloseToDora(tile) {
	for (let d of dora) {
		var doraIndex = getHigherTileIndex(d);
		if (tile.type == 3 && d.type == 3 && tile.index == doraIndex) {
			return true;
		}
		if (tile.type != 3 && tile.type == d.type && tile.index >= doraIndex - 2 && tile.index <= doraIndex + 2) {
			return true;
		}
	}
	return false;
}
//################################
// MAIN
// Main Class, starts the bot and sets up all necessary variables.
//################################

//GUI can be re-opened by pressing + on the Numpad
if (!isDebug()) {
	initGui();
	window.onkeyup = function (e) {
		var key = e.keyCode ? e.keyCode : e.which;

		if (key == 107) { // Numpad + Key
			toggleGui();
		}
	}

	if (AUTORUN) {
		log("Autorun start");
		run = true;
		setInterval(preventAFK, 30000);
	}
	waitForMainLobbyLoad();
}

function toggleRun() {
	if (run) {
		log("AlphaJong deactivated!");
		run = false;
		startButton.innerHTML = "Start Bot"
	}
	else if (!run) {
		log("AlphaJong activated!");
		run = true;
		startButton.innerHTML = "Stop Bot"
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
		currentActionOutput.value = "Wait for Loading.";
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
		currentActionOutput.value = "Bot is not running.";
		return;
	}
	if (!isInGame()) {
		checkForEnd();
		currentActionOutput.value = "Waiting for Game to start.";
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
			if (errorCounter > 60) {
				goToLobby();
			}
		}
		else {
			lastTilesLeft = getTilesLeft();
			errorCounter = 0;
		}
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
	log("Debug String: " + getDebugString());
	log("Current Danger Level: " + getCurrentDangerLevel());

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
				discard();
				break;
			case getOperations().eat:
				callTriple(operation.combination, getOperations().eat);
				break;
			case getOperations().peng:
				callTriple(operation.combination, getOperations().peng);
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
	for (let hand of getPlayerHand()) { //Get own Hand
		ownHand.push(hand.val);
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
	updateDiscardedTilesSafety();

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
		setAutoCallWin(true);
		strategy = STRATEGIES.GENERAL;
		strategyAllowsCalls = true;
		initialDiscardedTilesSafety();
		riichiTiles = [null, null, null, null];
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
		currentActionOutput.value = "Searching for Game...";
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