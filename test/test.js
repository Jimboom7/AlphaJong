//################################
// TESTS
// Contains some testcases and a benchmark test
//################################

//TEST PARAMETERS
var TEST_CASES = ["Efficiency", "Defense", "PushFold", "Dora", "Yaku", "Strategy", "Waits", "Call", "Issue", "Example"];
var currentTestcase = 0;
var currentTestStep = 0;
var passes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var overall = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var testCallTile = {};
var testPlayerRiichi = [0, 0, 0, 0];
var testPlayerHand = [13, 13, 13, 13];
var testStartTime = 0;
var expected = [];

//Only run if debug mode
if (isDebug()) {
	testStartTime = new Date();
	runTestcases();
}

//Test Main
function runTestcases() {
	runTestcase(TEST_CASES[currentTestcase]);
	if (currentTestcase >= TEST_CASES.length) {
		showEndResult();
		return;
	}
	setTimeout(runTestcases, 100); //Loop needs to be delayed, otherwise browser crashes
}

//Show the final result
function showEndResult() {
	var time = new Date() - testStartTime;
	log("#################");
	log("TESTRESULTS");
	for (var i = 0; i < TEST_CASES.length; i++) {
		if (passes[i] == overall[i]) {
			log("<span style='color: green;'>" + TEST_CASES[i] + ": " + passes[i] + "/" + overall[i] + " passed!</span>");
		}
		else {
			log("<b style='color: red;'>" + TEST_CASES[i] + ": " + passes[i] + "/" + overall[i] + " failed!</b>");
		}
	}
	log("Time needed: " + time + "ms, or " + time / overall.reduce((pv, cv) => pv + cv, 0) + "ms per test.");
	log("#################");
}

//List of testcases
function runTestcase(testcase) {
	resetGlobals();
	currentTestStep++;

	switch (testcase) {
		case "Efficiency":
			runEfficiencyTestcase();
			break;
		case "Defense":
			runDefenseTestcase();
			break;
		case "PushFold":
			runPushFoldTestcase();
			break;
		case "Dora":
			runDoraTestcase();
			break;
		case "Yaku":
			runYakuTestcase();
			break;
		case "Strategy":
			runStrategyTestcase();
			break;
		case "Waits":
			runWaitsTestcase();
			break;
		case "Call":
			runCallTestcase();
			break;
		case "Issue":
			runIssueTestcase();
			break;
		case "Example":
			runExampleTestcase();
			break;
		default:
			log("Testcase doesn't exist! " + testcase);
			return;
	}
	if (currentTestStep == 0) {
		return;
	}

	initialDiscardedTilesSafety();
	updateAvailableTiles();
	determineStrategy();

	checkDiscard();
}

//Discard a tile and check if it meets the expectation
function checkDiscard() {
	var tile = discard();
	log("Expected Discards:");
	overall[currentTestcase]++;
	for (let ex of expected) {
		log(ex);
		if (ex == tile.index + getNameForType(tile.type)) {
			log("<span style='color: green;'>" + TEST_CASES[currentTestcase] + " Testcase " + currentTestStep + " passed!</span>");
			passes[currentTestcase]++;
			log(" ");
			return;
		}
	}
	log("<b style='color: red;'>" + TEST_CASES[currentTestcase] + " testcase " + currentTestStep + " failed!</b>");
}

function logTestcase(title) {
	log("<b>" + TEST_CASES[currentTestcase] + " " + currentTestStep + ": " + title + "</b>");
}

function nextTestcase() {
	currentTestcase++;
	currentTestStep = 0;
}

//Offensive Testcases
function runEfficiencyTestcase() {
	switch (currentTestStep) {
		case 1:
			logTestcase("Standard Hand");
			ownHand = getTilesFromString("1239p22456m44468s");
			expected = ["9p"];
			break;

		case 2:
			logTestcase("Standard Hand 2");
			ownHand = getTilesFromString("1239p22456m44469s");
			discards = [[{ index: 9, type: 2, dora: false }], [], [], []];
			expected = ["9p", "9s"];
			break;

		case 3:
			logTestcase("Keep Pair");
			ownHand = getTilesFromString("12367p22456m4578s");
			expected = ["4s", "5s"];
			break;

		case 4:
			logTestcase("Keep Kanchan");
			ownHand = getTilesFromString("12379p11456m2346s");
			//discards = [[], [{ index: 6, type: 2, dora: false }], [], []];
			expected = ["6s"];
			break;

		case 5:
			logTestcase("Throw away fake Kanchan");
			ownHand = getTilesFromString("12679p22456m2346s");
			expected = ["9p"];
			break;

		case 6:
			logTestcase("Keep Ryanmen over Penchan");
			ownHand = getTilesFromString("2389p22456m23489s");
			expected = ["9p"];
			break;

		case 7:
			logTestcase("Check Chi Pair Overlap");
			ownHand = getTilesFromString("456p11234677m345s");
			expected = ["7m"];
			break;

		case 8:
			logTestcase("Check Chi Pair Overlap 2");
			ownHand = getTilesFromString("456p1123556m345s6m");
			expected = ["1m"];
			break;

		case 9:
			logTestcase("Check Chi Triple Overlap");
			ownHand = getTilesFromString("456p11123567m346s");
			expected = ["6s"];
			break;

		case 10:
			logTestcase("Check Chi Triple Overlap 2");
			ownHand = getTilesFromString("456p111234567m34s");
			expected = ["1m", "4m", "7m"];
			break;

		case 11:
			logTestcase("Keep Pair instead of triple");
			ownHand = getTilesFromString("111456m2256p123s2p");
			expected = ["1m", "2p"];
			break;

		case 12:
			logTestcase("Open Hand");
			ownHand = getTilesFromString("2256p234s2p");
			calls[0] = getTilesFromString("222444m");
			isClosed = false;
			expected = ["2p"];
			break;

		case 13:
			logTestcase("Open Hand 2");
			ownHand = getTilesFromString("66734s");
			calls[0] = getTilesFromString("111333555m");
			isClosed = false;
			expected = ["3s", "4s"];
			break;

		case 14:
			logTestcase("Chi Pair Overlap 2");
			ownHand = getTilesFromString("11123455m25677p7s");
			expected = ["2p", "7s"];
			break;

		case 15:
			logTestcase("Chi Pair Overlap 3");
			ownHand = getTilesFromString("1112345578999m2p");
			expected = ["2p"];
			break;

		default:
			nextTestcase();
			return;
	}
}

function runDefenseTestcase() {
	switch (currentTestStep) {
		case 1:
			logTestcase("Sakigiri");
			ownHand = getTilesFromString("112445999m5559p9s");
			discards = [getTilesFromString("999p"), getTilesFromString("3333p9s"), getTilesFromString("2222s9s"), getTilesFromString("444p9s")];
			expected = ["9p"];
			break;

		default:
			nextTestcase();
			return;
	}
}

function runPushFoldTestcase() {
	switch (currentTestStep) {
		case 1:
			logTestcase("Fold 1");
			ownHand = getTilesFromString("1122m5579p234s111z");
			testPlayerRiichi = [0, 1, 1, 1];
			expected = ["1z"];
			break;

		case 2:
			logTestcase("Fold 2");
			ownHand = getTilesFromString("13579m224567p123z");
			discards = [[], getTilesFromString("1133699m2p"), getTilesFromString("567567567m2p"), getTilesFromString("2567567p")];
			calls = [[], getTilesFromString("555z"), getTilesFromString("666z"), getTilesFromString("777z")];
			expected = ["2p"];
			break;

		default:
			nextTestcase();
			return;
	}
}

function runDoraTestcase() {
	switch (currentTestStep) {
		case 1:
			logTestcase("Keep dora in Kanchan");
			dora = getTilesFromString("1p");
			ownHand = getTilesFromString("2468p11555m23467s");
			expected = ["8p"];
			break;

		case 2:
			tilesLeft = 40;
			logTestcase("Throw dora for better hand");
			dora = getTilesFromString("7p");
			ownHand = getTilesFromString("4568p22456m23467s");
			expected = ["8p"];
			break;

		case 3:
			logTestcase("Keep dora for pair");
			dora = getTilesFromString("8p");
			ownHand = getTilesFromString("4569p123467m3458s");
			expected = ["1m", "8s"];
			break;

		default:
			nextTestcase();
			return;
	}
}

function runYakuTestcase() {
	switch (currentTestStep) {
		case 1:
			logTestcase("Yakuhai");
			//dora = getTilesFromString("7p");
			ownHand = getTilesFromString("111234m5688p23s11z");
			discards = [[], [], [], []];
			expected = ["5p"];
			break;

		case 2:
			logTestcase("Tanyao");
			ownHand = getTilesFromString("23469m222488p345s");
			expected = ["9m"];
			break;

		case 3:
			logTestcase("Yaku: Single Yakuhai");
			ownHand = getTilesFromString("111222m5588p39s13z");
			expected = ["1z", "3z"];
			break;

		case 4:
			logTestcase("Yaku: Two from Tanyao");
			ownHand = getTilesFromString("222444m145679p33s");
			expected = ["1p"];
			break;

		case 5:
			logTestcase("Yaku: One from Tanyao");
			ownHand = getTilesFromString("222456m1366p3368s");
			expected = ["1p"];
			break;

		case 6:
			logTestcase("Test Iipeikou");
			ownHand = getTilesFromString("111222m4455667p5s");
			discards = [[{ index: 6, type: 0, dora: false, doraValue: 0 }], [], [], []];
			expected = ["5s"];
			break;

		case 7:
			logTestcase("Test Honitsu");
			ownHand = getTilesFromString("111222555789m5s7z");
			expected = ["5s"];
			break;

		case 8:
			logTestcase("Test Ittsuu");
			ownHand = getTilesFromString("12345689m579s777z");
			expected = ["5s", "7s", "9s"];
			break;

		case 9:
			logTestcase("Test Sanankou");
			ownHand = getTilesFromString("22233368m2488p88s");
			expected = ["8m", "2p"];
			break;

		case 10:
			isClosed = false;
			logTestcase("Test Toitoi");
			ownHand = getTilesFromString("333666m688p88s");
			discards = [[], [{ index: 8, type: 0, dora: false, doraValue: 0 }, { index: 6, type: 0, dora: false, doraValue: 0 }], [{ index: 9, type: 0, dora: false, doraValue: 0 }], []];
			calls = [[{ index: 1, type: 1, dora: false, doraValue: 0 }, { index: 1, type: 1, dora: false, doraValue: 0 }, { index: 1, type: 1, dora: false, doraValue: 0 }], [], [], []];
			expected = ["6p"];
			break;

		case 11:
			logTestcase("Test Chinitsu");
			ownHand = getTilesFromString("111222568899m33z");
			expected = ["3z"];
			break;

		case 12:
			logTestcase("Sanshoku Douko");
			ownHand = getTilesFromString("11156m11199p1167s");
			expected = ["6s", "7s", "5m", "6m", "9p"];
			break;

		case 13:
			logTestcase("Sanshoku Doujun");
			ownHand = getTilesFromString("12389m12399p1289s");
			expected = ["8m", "9m", "8s", "9s"];
			break;

		case 14:
			logTestcase("Chanta");
			ownHand = getTilesFromString("123m123999p579s22z");
			discards = [[], [{ index: 3, type: 2, dora: false, doraValue: 0 }], [], []];
			expected = ["5s"];
			break;

		case 15:
			logTestcase("Honrou");
			ownHand = getTilesFromString("111m111999p112s55z");
			expected = ["2s"];
			break;

		case 16:
			logTestcase("Shousangen");
			ownHand = getTilesFromString("456s23p78s5556667z");
			expected = ["2p"];
			break;

		case 17:
			logTestcase("Daisangen");
			ownHand = getTilesFromString("456s246p55566677z");
			expected = ["2p", "4p", "6p"];
			break;

		case 18:
			logTestcase("Junchan");
			ownHand = getTilesFromString("123m123999p11579s");
			discards = [[], [{ index: 3, type: 2, dora: false, doraValue: 0 }], [], []];
			expected = ["5s"];
			break;

		case 19:
			logTestcase("Pinfu");
			dora = getTilesFromString("7s");
			ownHand = getTilesFromString("123m123789p11568s");
			expected = ["8s"];
			break;

		default:
			nextTestcase();
			return;
	}
}

function runStrategyTestcase() {
	switch (currentTestStep) {
		case 1:
			logTestcase("Chiitoitsu");
			ownHand = getTilesFromString("1122m5588p234s114z");
			discards = [getTilesFromString("1z"), [], [], []];

			expected = ["2s", "3s", "4s"];
			break;

		case 2:
			logTestcase("Thirteen Orphans");
			ownHand = getTilesFromString("1559m19s1234567z5m");
			expected = ["5m"];
			break;

		case 3:
			logTestcase("Thirteen Orphans - safest discard");
			ownHand = getTilesFromString("159m159p19s12345z5s");
			discards = [[], getTilesFromString("46m456p"), getTilesFromString("456m456p"), getTilesFromString("222m5p")];
			calls = [[], getTilesFromString("777888p"), getTilesFromString("777888m"), getTilesFromString("777888s")];
			expected = ["5p"];
			break;

		case 4:
			logTestcase("Thirteen Orphans - abandon strategy"); //6z all gone -> change strategy
			ownHand = getTilesFromString("159m159p19s12345z5s");
			discards = [[], getTilesFromString("12345z66z"), getTilesFromString("34566z"), getTilesFromString("222m55p5z")];
			expected = ["5z"];
			break;

		default:
			nextTestcase();
			return;
	}
}

function runWaitsTestcase() {
	switch (currentTestStep) {
		case 1:
			logTestcase("Test Furiten");
			dora = getTilesFromString("1m");
			ownHand = getTilesFromString("11122233344m45p5s");
			discards = [getTilesFromString("6p"), [], [], []];
			expected = ["4p", "5p"];
			break;

		case 2:
			logTestcase("Test Pair Furiten");
			readDebugString("6z|1m33p406777s77z|576m||231m|999s|93p261z1s|8s2z91s2p|1s9p51z2p|35z1m94p|0,0,0,0|1|1|48");
			expected = ["3p", "4s"];
			break;

		case 3:
			logTestcase("Test Complex Furiten");
			ownHand = getTilesFromString("1113456m666999s1z"); // 3 tile wait (2m, 3m, 6m) in furiten
			discards = [[{ index: 2, type: 1, dora: false, doraValue: 0 }], [], [], []];
			expected = ["3m", "6m"];
			break;

		case 4:
			logTestcase("Test Wait Quality 2");
			ownHand = getTilesFromString("111333555789m5s4z");
			expected = ["5s"];
			break;

		case 5:
			logTestcase("Test Dora Wait 1"); //Should keep dora over better wait
			dora = getTilesFromString("4p");
			ownHand = getTilesFromString("111333555m5p123s4z");
			expected = ["4z"];
			break;

		default:
			nextTestcase();
			return;
	}
}

function runCallTestcase() {
	switch (currentTestStep) {
		case 1:
			logTestcase("Test Pon Call");
			ownHand = getTilesFromString("222444m22678p367s");
			updateAvailableTiles();
			testCallTile = { index: 8, type: 0, dora: false, doraValue: 0 };
			callTriple(["6p|7p"], 0);
			expected = ["3s"];
			if (callResult) { //Should decline
				expected = ["0z"];
			}
			break;

		case 2:
			logTestcase("Test Chi Call with Options");
			ownHand = getTilesFromString("222444m2223457p3s");
			updateAvailableTiles();
			testCallTile = { index: 4, type: 0, dora: false, doraValue: 0 };
			callTriple(["2p|3p", "3p|5p"], 0);
			expected = ["3s"];
			if (callResult) { //Should decline
				expected = ["0z"];
			}
			break;

		case 3:
			logTestcase("Test Yakuhai Pon (Should accept, check log)");
			readDebugString("1s|34489m2479p30s66z|||||22z9s44z|9m4z7s8m1z|1s1z65s6z|9s2z9m4p|0,0,0,0|1|1|51");
			updateAvailableTiles();
			testCallTile = { index: 6, type: 3, dora: false, doraValue: 0 };
			var callResult = callTriple(["6z|6z"], 0);
			expected = ["9m"];
			if (!callResult) { //Should accept
				expected = ["0z"];
			}
			break;




		default:
			nextTestcase();
			return;
	}
}

function runIssueTestcase() {
	switch (currentTestStep) {
		case 1:
			logTestcase("Issue #12-1"); // https://github.com/Jimboom7/AlphaJong/issues/12#issuecomment-1045805246
			readDebugString("1m|012234567m68p6s57z|||||3z1p4s3z|7m21z9p|32z9m3z9m|1p9s9p7z5s|0,0,0,0|2|1|70");
			expected = ["6s", "7z", "5z"];
			break;

		case 2:
			logTestcase("Issue #12-2"); // https://github.com/Jimboom7/AlphaJong/issues/12#issuecomment-1045805246
			readDebugString("1m|12234567m68p68s57z||456m||555z|4z1p4s3z|7m21z97p|42z9m3z9m|1p9s9p7z5s7p|0,0,0,0|2|1|70");
			expected = ["7z", "5z"];
			break;

		case 3:
			logTestcase("Issue #12-4"); // https://github.com/Jimboom7/AlphaJong/issues/12#issuecomment-1046320488
			readDebugString("1m|4447788m6p222344s||123m|034p999s666z||38p1s255z|5m479p9s36z|19m24788p6s44z|1m9p1s122337z|0,0,0,0|2|1|20");
			expected = ["6p"];
			break;

		case 4:
			logTestcase("Issue #15-1"); // https://github.com/Jimboom7/AlphaJong/issues/15#issuecomment-1047236697
			readDebugString("1m|12234550678p477z|||678p444s||6m368s23z|245m4z|1138m1s2z|5m19s236z|0,0,0,0|2|1|40");
			expected = ["4z"];
			break;

		case 5:
			logTestcase("Issue #36 - Dangerous Discard"); // https://github.com/Jimboom7/AlphaJong/issues/36
			readDebugString("6s|345666m334677p33s|||||515z9p199m|5z1m12z9p64z7p|6z21m26z1p7z2p|437z9m45s3m4p|0,0,0,1|4|2|38");
			SAFETY_VALUE = 1; //Doesn't work without changing parameters
			riichiTiles = [null, null, null, getTileFromString("4p")];
			expected = ["4p"];
			break;

		default:
			nextTestcase();
			return;
	}
}

function runExampleTestcase() {
	switch (currentTestStep) {
		case 1:
			logTestcase("Complex Hand");
			ownHand = getTilesFromString("113m223457p12379s");
			expected = ["3m", "7p"];
			break;
		default:
			nextTestcase();
			return;
	}
}