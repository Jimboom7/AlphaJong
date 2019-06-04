//################################
// PARAMETERS
// Contains Parameters to change the playstile of the bot
//################################

//AI PARAMETERS
var AUTORUN = true; //Automatically start new Games 
var ROOM = 5; //2 = Bronze East, 3 = Bronze South, 5 = Silver East, ...

//DEFENSE CONSTANTS
var FOLD_CONSTANT = 17; //Lower -> Earlier Fold. Default: 25
var RECENT_DISCARD_MODIFIER = 10; // Higher Value: Recent Discards have more impact
var SUJI_MODIFIER = 1; //Higher Value: Suji is worth more

//CALLS
var CALL_CONSTANT = 3; //Amount of han (Open Yaku + Dora) that is needed for calls (to accelerate high value hands). Default: 3
var CALL_YAKU_THRESHOLD = 0.01; //How many Yakus does the hand need to call for tiles? Default: 0.01 (aka medium chance for yaku soon)
var CALL_KAN_CONSTANT = 60; //Higher Value: Higher Threshold for calling Kans. Default: 60
var EFFICIENCY_THRESHOLD = 1; // If efficiency of hand is below this threshhold (& dealer): Call if hand has open yaku.

//HAND EVALUATION CONSTANTS
var EFFICIENCY_VALUE = 1; // 0 -> ignore Efficiency (lol). Default: 1
var YAKU_VALUE = 0.5; // 0 -> ignore Yaku. Default: 0.5
var DORA_VALUE = 0.3; // 0 -> ignore Dora. Default: 0.3
var SAFETY_VALUE = 0.5; // 0 -> Ignore Safety. Default: 0.5
var PAIR_VALUE = 0.5; //Value for the first pair when evaluating the hand (Triples are 1). Default: 0.5
var WAIT_VALUE = 0.3; //Value for good waits when tenpai. Maximum: 1. Default: 0.3

//STRATEGY CONSTANTS
var CHIITOITSU = 5; //Number of Pairs in Hand to go for chiitoitsu
var THIRTEEN_ORPHANS = 10; //Number of Honor/Terminals in hand to go for 13 orphans
var RIICHI_TILES_LEFT = 6; //How many tiles need to be left for calling Riichi
var WAITS_FOR_RIICHI = 3; //Waits needed to call Riichi at the start of the game. Goes down over time. Default: 3

//LOGGING
var LOG_AMOUNT = 3; //Amount of Messages to log for Tile Priorities



//### GLOBAL VARIABLES DO NOT CHANGE ###
var run = false; //Is the bot running
const STRATEGIES = { //ENUM of strategies
	GENERAL: 'General',
	CHIITOITSU: 'Chiitoitsu',
	FOLD: 'Fold'
}
var strategy = STRATEGIES.GENERAL; //Current strategy
var strategyAllowsCalls = true; //Does the current strategy allow calls?
var isClosed = true; //Is own hand closed?
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
var lastTilesLeft = 0; //Counter to check if bot is working
var isConsideringCall = false;

//TEST
var testRunning = false;
var currentTest = 0;
var passes = 0;
var startTime = 0;
var winValues = [];
var TEST_DANGER_LEVEL = 50; 
var testCallTile = {};

//Factorials for chance of tile draw calculation. Pre calculated to save time
var facts = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800, 479001600, 6227020800, 87178291200, 1307674368000, 20922789888000, 355687428096000, 6402373705728000, 121645100408832000, 2432902008176640000, 51090942171709440000, 1.1240007277776077e+21, 2.585201673888498e+22, 6.204484017332394e+23, 1.5511210043330986e+25, 4.0329146112660565e+26, 1.0888869450418352e+28, 3.0488834461171384e+29, 8.841761993739701e+30, 2.6525285981219103e+32, 8.222838654177922e+33, 2.631308369336935e+35, 8.683317618811886e+36, 2.9523279903960412e+38, 1.0333147966386144e+40, 3.719933267899012e+41, 1.3763753091226343e+43, 5.23022617466601e+44, 2.0397882081197442e+46, 8.159152832478977e+47, 3.3452526613163803e+49, 1.4050061177528798e+51, 6.041526306337383e+52, 2.6582715747884485e+54, 1.1962222086548019e+56, 5.5026221598120885e+57, 2.5862324151116818e+59, 1.2413915592536073e+61, 6.082818640342675e+62, 3.0414093201713376e+64, 1.5511187532873822e+66, 8.065817517094388e+67, 4.2748832840600255e+69, 2.308436973392414e+71, 1.2696403353658276e+73, 7.109985878048635e+74, 4.052691950487722e+76, 2.350561331282879e+78, 1.3868311854568986e+80, 8.320987112741392e+81, 5.075802138772248e+83, 3.146997326038794e+85, 1.98260831540444e+87, 1.2688693218588417e+89, 8.247650592082472e+90, 5.443449390774431e+92, 3.647111091818868e+94, 2.4800355424368305e+96, 1.711224524281413e+98, 1.197857166996989e+100, 8.504785885678622e+101, 6.123445837688608e+103, 4.4701154615126834e+105, 3.3078854415193856e+107, 2.480914081139539e+109, 1.8854947016660498e+111, 1.4518309202828584e+113, 1.1324281178206295e+115, 8.946182130782973e+116, 7.156945704626378e+118, 5.797126020747366e+120, 4.75364333701284e+122, 3.945523969720657e+124, 3.314240134565352e+126, 2.8171041143805494e+128, 2.4227095383672724e+130, 2.107757298379527e+132, 1.8548264225739836e+134, 1.6507955160908452e+136, 1.4857159644817607e+138, 1.3520015276784023e+140, 1.24384140546413e+142, 1.1567725070816409e+144, 1.0873661566567424e+146, 1.0329978488239052e+148, 9.916779348709491e+149, 9.619275968248206e+151, 9.426890448883242e+153, 9.33262154439441e+155, 9.33262154439441e+157, 9.425947759838354e+159, 9.614466715035121e+161, 9.902900716486175e+163, 1.0299016745145622e+166, 1.0813967582402903e+168, 1.1462805637347078e+170, 1.2265202031961373e+172, 1.3246418194518284e+174, 1.4438595832024928e+176, 1.5882455415227421e+178, 1.7629525510902437e+180, 1.9745068572210728e+182, 2.2311927486598123e+184, 2.543559733472186e+186, 2.925093693493014e+188, 3.3931086844518965e+190, 3.969937160808719e+192, 4.6845258497542883e+194, 5.574585761207603e+196, 6.689502913449124e+198, 8.09429852527344e+200, 9.875044200833598e+202, 1.2146304367025325e+205, 1.5061417415111404e+207, 1.8826771768889254e+209, 2.372173242880046e+211, 3.012660018457658e+213, 3.8562048236258025e+215, 4.9745042224772855e+217, 6.466855489220472e+219, 8.471580690878817e+221, 1.118248651196004e+224, 1.4872707060906852e+226, 1.992942746161518e+228];
