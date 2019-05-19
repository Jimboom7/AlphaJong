//################################
// PARAMETERS
//################################

//AI PARAMETERS
var AUTORUN = true;
var ROOM = 2; //2 = Bronze, 4 = Silver, ...

//DEFENSE CONSTANTS
var FOLD_CONSTANT = 50; //Higher -> Earlier Fold. Default: 40

//CALLS
var CALL_CONSTANT = 70; //Higher Value: Higher Threshold for making a call
var CALL_YAKU_THRESHOLD = 0.8; //How many Yakus does the hand need to call for tiles? Default: 0.8 (Good chance to get a Yaku soon)
var CALL_KAN_CONSTANT = 50; //Higher Value: Higher Threshold for calling Kans

//HAND EVALUATION CONSTANTS
var EFFICIENCY_VALUE = 1; // 0 -> ignore Efficiency (lol). Default: 1
var YAKU_VALUE = 1; // 0 -> ignore Yaku. Default: 1
var DORA_VALUE = 0.3; // 0 -> ignore Dora. Default: 0.5
var SAFETY_VALUE = 0.5; // 0 -> Ignore Safety. Default: 0.5
var PAIR_VALUE = 0.5; //Value for the first pair when evaluating the hand. Default: 0.5 (Triples are 1)

//NOT YET IMPLEMENTED:
var BIG_HAND_MODIFIER = 100; //Higher Value -> The bot will try to get higher value hands at the start. Minimum: 10
var BIG_HAND_DECAY = 10; //Reduction of Big hand Values over time. => Will try to get easier hands later.
var MODIFY_BIG_HAND_VALUE_DYNAMICALLY = false; //The bot will try to get easier hands when in first place, bigger hands when last.



//STRATEGY CONSTANTS
var CHIITOITSU = 5; //Number of Pairs in Hand to go for chiitoitsu
var THIRTEEN_ORPHANS = 10; //Number of Honor/Terminals in hand to go for 13 orphans

//LOGGING
var LOG_AMOUNT = 3; //Amount of Messages to log for hand Values

//OTHERS
var RIICHI_TILES_LEFT = 6; //How many tiles need to be left for calling Riichi



//GLOBAL VARIABLES DO NOT CHANGE
var TEST_DANGER_LEVEL = 50;
var run = false;
var bigHandThreshhold = 50;
var bigHandValue = BIG_HAND_MODIFIER;

//STRATEGY
const STRATEGIES = {
	GENERAL: 'General',
	CHIITOITSU: 'Chiitoitsu',
	FOLD: 'Fold'
}
var strategy = STRATEGIES.GENERAL;
var strategyAllowsCalls = true;
var isClosed = true;

//VALUES
var dora = []; //Array of Tiles (index, type, dora)
var ownHand = [];  //index, type, dora
var discards = []; //Later: Change to array for each player
var calls = []; //Calls/Melds of each player
var availableTiles = []; //Tiles that are available
var seatWind = 1; //1: East,... 4: North
var roundWind = 1; //1: East,... 4: North
var tilesLeft = 0; //tileCounter
var visibleTiles = []; //Tiles that are visible
var isPlayerRiichi = [false, false, false, false];
var errorCounter = 0; //Counter to check if bot is working
var lastTilesLeft = 0;

//TEST
var testRunning = false;
var currentTest = 0;
var passes = 0;
var startTime = 0;
var winValues = [];