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
var EFFICIENCY_VALUE = 0.5; // From 0-1. Lower: Slower hands. Higher: Daster hands.
var SCORE_VALUE = 0.5 // From 0-1. Lower: Cheaper hands. Higher: More expensive hands
var SAFETY_VALUE = 0.5; // From 0-1. Lower: The bot will not pay much attention to safety. Higher: The bot will try to play safer
var SAKIGIRI_VALUE = 0.3; // 0 -> Never Sakigiri. Default: 0.3

//STRATEGY CONSTANTS
var CHIITOITSU = 5; //Number of Pairs in Hand to go for chiitoitsu. Default: 5
var THIRTEEN_ORPHANS = 10; //Number of Honor/Terminals in hand to go for 13 orphans. Default: 10
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
var playerDiscardSafetyList = [[], [], [], []];

//LOCAL STORAGE
var AUTORUN = window.localStorage.getItem("alphajongAutorun") == "true";
var ROOM = window.localStorage.getItem("alphajongRoom");
ROOM = ROOM == null ? 2 : ROOM