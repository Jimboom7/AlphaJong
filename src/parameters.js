//################################
// PARAMETERS
// Contains Parameters to change the playstile of the bot. Usually no need to change anything.
//################################

//HAND EVALUATION CONSTANTS
var EFFICIENCY = 1.0; // Lower: Slower and more expensive hands. Higher: Faster and cheaper hands. Default: 1.0, Minimum: 0
var SAFETY = 1.0; // Lower: The bot will not pay much attention to safety. Higher: The bot will try to play safer. Default: 1.0, Minimum: 0
var SAKIGIRI = 1.0; //Lower: Don't place much importance on Sakigiri. Higher: Try to Sakigiri more often. Default: 1.0, Minimum: 0

//CALL CONSTANTS
var CALL_PON_CHI = 1.0; //Lower: Call Pon/Chi less often. Higher: Call Pon/Chi more often. Default: 1.0, Minimum: 0
var CALL_KAN = 1.0; //Lower: Call Kan less often. Higher: Call Kan more often. Default: 1.0, Minimum: 0

//STRATEGY CONSTANTS
var RIICHI = 1.0; //Lower: Call Riichi less often. Higher: Call Riichi more often. Default: 1.0, Minimum: 0
var CHIITOITSU = 5; //Number of Pairs in Hand to go for chiitoitsu. Default: 5
var THIRTEEN_ORPHANS = 10; //Number of Honor/Terminals in hand to go for 13 orphans. Default: 10

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
var playerDiscardSafetyList = [[], [], [], []];
var totalPossibleWaits = {};

//LOCAL STORAGE
var AUTORUN = window.localStorage.getItem("alphajongAutorun") == "true";
var ROOM = window.localStorage.getItem("alphajongRoom");
ROOM = ROOM == null ? 2 : ROOM