//################################
// TESTS
// Contains some testcases and a benchmark test
//################################

//Only run if debug mode
if(isDebug()) {
	testsRunning = true;
	startTime = new Date();
	runTestcases();
	//runBenchmarks();
}

//Test Main
function runTestcases() {
	
	if(testsRunning) {
		currentTest++;
		setTimeout(runTestcases, 100); //Loop needs to be delayed, otherwise browser crashes
		runTestcase();
	}
	else {
		currentTest--;
		endTime = new Date();
		var time = endTime - startTime;
		log("#################");
		log("TESTRESULTS");
		log(passes + "/" + currentTest + " passed!");
		log("Time needed: " + time + "ms, or " + time/currentTest + "ms per test.");
		log("#################");
	}
}

//List of testcases
function runTestcase() {
	dora = [{index: 1, type: 0, dora: false}];
	discards = [[],[],[],[]];
	calls = [[],[],[],[]];
	seatWind = 2;
	roundWind = 1;
	tilesLeft = 70;
	strategy = STRATEGIES.GENERAL;
	EFFICIENCY_VALUE = 1;
	YAKU_VALUE = 1;
	DORA_VALUE = 0.3;
	SAFETY_VALUE = 0.5;
	TEST_DANGER_LEVEL = 1;
	WAIT_VALUE = 0.3;
	isClosed = true;
	
	switch(currentTest) {
	case 1:
		log("Testcase 1: Standard Hand");
		ownHand = [
		{index: 1, type: 0, dora: false}, {index: 2, type: 0, dora: false}, {index: 3, type: 0, dora: false},
		{index: 9, type: 0, dora: false}, {index: 2, type: 1, dora: false}, {index: 2, type: 1, dora: false},
		{index: 4, type: 1, dora: false}, {index: 5, type: 1, dora: false}, {index: 6, type: 1, dora: false},
		{index: 4, type: 2, dora: false}, {index: 4, type: 2, dora: false}, {index: 4, type: 2, dora: false},
		{index: 6, type: 2, dora: false}, {index: 7, type: 2, dora: false}];
		var expected = ["9p"];
		break;
	case 2:
		log("Testcase 2: Standard Hand 2");
		ownHand = [
		{index: 1, type: 0, dora: false}, {index: 2, type: 0, dora: false}, {index: 3, type: 0, dora: false},
		{index: 9, type: 0, dora: false}, {index: 2, type: 1, dora: false}, {index: 2, type: 1, dora: false},
		{index: 4, type: 1, dora: false}, {index: 5, type: 1, dora: false}, {index: 6, type: 1, dora: false},
		{index: 4, type: 2, dora: false}, {index: 4, type: 2, dora: false}, {index: 4, type: 2, dora: false},
		{index: 6, type: 2, dora: false}, {index: 9, type: 2, dora: false}];
		discards = [[{index: 9, type: 2, dora: false}],[],[],[]];
		var expected = ["9p", "9s"];
		break;
	case 3:
		log("Testcase 3: Keep Pair");
		ownHand = [
		{index: 1, type: 0, dora: false}, {index: 2, type: 0, dora: false}, {index: 3, type: 0, dora: false},
		{index: 6, type: 0, dora: false}, {index: 7, type: 0, dora: false}, {index: 2, type: 1, dora: false},
		{index: 2, type: 1, dora: false}, {index: 4, type: 1, dora: false}, {index: 5, type: 1, dora: false},
		{index: 6, type: 1, dora: false}, {index: 4, type: 2, dora: false}, {index: 5, type: 2, dora: false},
		{index: 7, type: 2, dora: false}, {index: 8, type: 2, dora: false}];

		var expected = ["7s", "8s"];
		break;
	case 4:
		log("Testcase 4: Keep Bridge");
		ownHand = [
		{index: 1, type: 0, dora: false}, {index: 2, type: 0, dora: false}, {index: 3, type: 0, dora: false},
		{index: 7, type: 0, dora: false}, {index: 9, type: 0, dora: false}, {index: 1, type: 1, dora: false},
		{index: 1, type: 1, dora: false}, {index: 4, type: 1, dora: false}, {index: 5, type: 1, dora: false},
		{index: 6, type: 1, dora: false}, {index: 2, type: 2, dora: false}, {index: 3, type: 2, dora: false},
		{index: 4, type: 2, dora: false}, {index: 6, type: 2, dora: false}];
		discards = [[],[{index: 6, type: 2, dora: false}],[],[]];
		var expected = ["6s"];
		break;
	case 5:
		log("Testcase 5: Throw away fake bridge");
		ownHand = [
		{index: 1, type: 0, dora: false}, {index: 2, type: 0, dora: false}, {index: 6, type: 0, dora: false},
		{index: 7, type: 0, dora: false}, {index: 9, type: 0, dora: false}, {index: 2, type: 1, dora: false},
		{index: 2, type: 1, dora: false}, {index: 4, type: 1, dora: false}, {index: 5, type: 1, dora: false},
		{index: 6, type: 1, dora: false}, {index: 2, type: 2, dora: false}, {index: 3, type: 2, dora: false},
		{index: 4, type: 2, dora: false}, {index: 6, type: 2, dora: false}];

		var expected = ["9p"];
		break;
	case 6:
		log("Testcase 6: Keep better straight");
		ownHand = [
		{index: 2, type: 0, dora: false}, {index: 3, type: 0, dora: false}, {index: 8, type: 0, dora: false},
		{index: 9, type: 0, dora: false}, {index: 2, type: 1, dora: false}, {index: 2, type: 1, dora: false},
		{index: 4, type: 1, dora: false}, {index: 5, type: 1, dora: false},
		{index: 6, type: 1, dora: false}, {index: 2, type: 2, dora: false}, {index: 3, type: 2, dora: false},
		{index: 4, type: 2, dora: false}, {index: 6, type: 2, dora: false}, {index: 7, type: 2, dora: false}];
		discards = [[],[{index: 9, type: 0, dora: false}],[],[]];
		var expected = ["9p"];
		break;
	case 7:
		log("Testcase 7: Keep dora for triple");
		dora = [{index: 7, type: 0, dora: false}];
		ownHand = [
		{index: 4, type: 0, dora: false}, {index: 5, type: 0, dora: false}, {index: 7, type: 0, dora: false},
		{index: 8, type: 0, dora: false}, {index: 2, type: 1, dora: false}, {index: 2, type: 1, dora: false},
		{index: 4, type: 1, dora: false}, {index: 5, type: 1, dora: false},
		{index: 6, type: 1, dora: false}, {index: 2, type: 2, dora: false}, {index: 3, type: 2, dora: false},
		{index: 4, type: 2, dora: false}, {index: 6, type: 2, dora: false}, {index: 7, type: 2, dora: false}];
		var expected = ["5p"];
		break;
	case 8:
		tilesLeft = 40;
		log("Testcase 8: Throw dora for better hand");
		dora = [{index: 7, type: 0, dora: false}];
		ownHand = [
		{index: 4, type: 0, dora: false}, {index: 5, type: 0, dora: false}, {index: 6, type: 0, dora: false},
		{index: 8, type: 0, dora: false}, {index: 2, type: 1, dora: false}, {index: 2, type: 1, dora: false},
		{index: 4, type: 1, dora: false}, {index: 5, type: 1, dora: false},
		{index: 6, type: 1, dora: false}, {index: 2, type: 2, dora: false}, {index: 3, type: 2, dora: false},
		{index: 4, type: 2, dora: false}, {index: 6, type: 2, dora: false}, {index: 7, type: 2, dora: false}];
		var expected = ["8p"];
		break;
	case 9:
		log("Testcase 9: Keep dora for double");
		dora = [{index: 8, type: 0, dora: false}];
		ownHand = [
		{index: 4, type: 0, dora: false}, {index: 5, type: 0, dora: false}, {index: 6, type: 0, dora: false},
		{index: 9, type: 0, dora: false}, {index: 1, type: 1, dora: false}, {index: 1, type: 1, dora: false},
		{index: 2, type: 1, dora: false}, {index: 3, type: 1, dora: false},
		{index: 4, type: 1, dora: false}, {index: 6, type: 1, dora: false}, {index: 3, type: 2, dora: false},
		{index: 4, type: 2, dora: false}, {index: 5, type: 2, dora: false}, {index: 8, type: 2, dora: false}];
		DORA_VALUE = 2;
		var expected = ["8s"];
		break;
	case 10:
		log("Testcase 10: Check Chi Pair Overlap");
		dora = [{index: 8, type: 0, dora: false}];
		ownHand = [
		{index: 4, type: 0, dora: false}, {index: 5, type: 0, dora: false}, {index: 6, type: 0, dora: false},
		{index: 1, type: 1, dora: false}, {index: 1, type: 1, dora: false},
		{index: 2, type: 1, dora: false}, {index: 3, type: 1, dora: false},
		{index: 4, type: 1, dora: false}, {index: 6, type: 1, dora: false}, {index: 7, type: 1, dora: false},
		{index: 3, type: 2, dora: false}, {index: 4, type: 2, dora: false}, {index: 5, type: 2, dora: false}];
		var expected = ["6m", "7m"];
		break;
	case 11:
		log("Testcase 11: Check Chi Pair Overlap 2");
		dora = [{index: 8, type: 0, dora: false}];
		ownHand = [
		{index: 4, type: 0, dora: false}, {index: 5, type: 0, dora: false}, {index: 6, type: 0, dora: false},
		{index: 1, type: 1, dora: false}, {index: 1, type: 1, dora: false},
		{index: 2, type: 1, dora: false}, {index: 3, type: 1, dora: false},
		{index: 5, type: 1, dora: false}, {index: 5, type: 1, dora: false}, {index: 6, type: 1, dora: false},
		{index: 3, type: 2, dora: false}, {index: 4, type: 2, dora: false}, {index: 5, type: 2, dora: false},
		{index: 6, type: 1, dora: false}];
		var expected = ["1m"];
		break;
	case 12:
		log("Testcase 12: Check Chi Triple Overlap");
		dora = [{index: 8, type: 0, dora: false}];
		ownHand = [
		{index: 4, type: 0, dora: false}, {index: 5, type: 0, dora: false}, {index: 6, type: 0, dora: false},
		{index: 1, type: 1, dora: false}, {index: 1, type: 1, dora: false}, {index: 1, type: 1, dora: false},
		{index: 2, type: 1, dora: false}, {index: 3, type: 1, dora: false},
		{index: 5, type: 1, dora: false}, {index: 6, type: 1, dora: false}, {index: 7, type: 1, dora: false},
		{index: 3, type: 2, dora: false}, {index: 4, type: 2, dora: false}, {index: 6, type: 2, dora: false}];
		var expected = ["6s"];
		break;
	case 13:
		log("Testcase 13: Check Chi Triple Overlap 2");
		dora = [{index: 8, type: 0, dora: false}];
		ownHand = [
		{index: 4, type: 0, dora: false}, {index: 5, type: 0, dora: false}, {index: 6, type: 0, dora: false},
		{index: 1, type: 1, dora: false}, {index: 1, type: 1, dora: false}, {index: 1, type: 1, dora: false},
		{index: 2, type: 1, dora: false}, {index: 3, type: 1, dora: false}, {index: 4, type: 1, dora: false},
		{index: 5, type: 1, dora: false}, {index: 6, type: 1, dora: false}, {index: 7, type: 1, dora: false},
		{index: 3, type: 2, dora: false}, {index: 4, type: 2, dora: false}];
		var expected = ["1m"];
		break;
	case 14:
		log("Testcase 14: Example 1");
		dora = [{index: 2, type: 1, dora: false}];
		ownHand = [
		{index: 2, type: 1, dora: false}, {index: 2, type: 1, dora: false}, {index: 5, type: 1, dora: true},
		{index: 7, type: 1, dora: false}, {index: 2, type: 0, dora: false}, {index: 7, type: 0, dora: false},
		{index: 8, type: 0, dora: false}, {index: 8, type: 0, dora: false}, {index: 8, type: 0, dora: false},
		{index: 6, type: 2, dora: false}, {index: 6, type: 2, dora: false}, {index: 5, type: 3, dora: false},
		{index: 6, type: 3, dora: false}, {index: 4, type: 2, dora: false}];
		
		discards = [[{index: 7, type: 9, dora: false}, {index: 3, type: 3, dora: false}, {index: 3, type: 3, dora: false}],
		[{index: 6, type: 2, dora: false}, {index: 2, type: 3, dora: false},
		{index: 3, type: 3, dora: false}],[{index: 5, type: 3, dora: false},
		{index: 1, type: 3, dora: false}, {index: 6, type: 3, dora: false}],
		[{index: 3, type: 3, dora: false}, {index: 5, type: 1, dora: false},
		{index: 5, type: 3, dora: false}, {index: 8, type: 2, dora: false}]];
		var expected = ["5z"];
		break;
	case 15:
		log("Testcase 15: Example 2");
		dora = [{index: 7, type: 0, dora: false}];
		ownHand = [
		{index: 3, type: 1, dora: false}, {index: 5, type: 1, dora: false}, {index: 5, type: 1, dora: false},
		{index: 5, type: 1, dora: false}, {index: 6, type: 1, dora: false}, {index: 6, type: 1, dora: false},
		{index: 1, type: 0, dora: false}, {index: 5, type: 0, dora: false}, {index: 8, type: 0, dora: false},
		{index: 2, type: 2, dora: false}, {index: 4, type: 2, dora: false}, {index: 4, type: 2, dora: false},
		{index: 9, type: 2, dora: false}, {index: 6, type: 3, dora: false}];
		
		var expected = ["6z"];
		break;
	case 16:
		log("Testcase 16: Chiitoitsu");
		strategy = STRATEGIES.CHIITOITSU;
		dora = [{index: 7, type: 0, dora: false}];
		ownHand = getHandFromString("1122m5588p234s111z");
		discards = [getHandFromString("1z"),[],[],[]];

		var expected = ["1z"];
		break;
	case 17:
		log("Testcase 17: Fold");
		strategy = STRATEGIES.FOLD;
		dora = [{index: 7, type: 0, dora: false}];
		ownHand = getHandFromString("1122m5588p234s111z");
		TEST_DANGER_LEVEL = 100;

		var expected = ["1z"];
		break;
	case 18:
		log("Testcase 18: Fold 2");
		strategy = STRATEGIES.GENERAL;
		dora = [{index: 7, type: 0, dora: false}];
		ownHand = getHandFromString("13579m224477p123z");
		
		discards = [[],getHandFromString("1122666m5588p234s"),getHandFromString("57m"),getHandFromString("4m2p")];
		var expected = ["2p"];
		TEST_DANGER_LEVEL = 50;
		determineStrategy();
		break;
	case 19:
		log("Testcase 19: Yaku: Yakuhai");
		dora = [{index: 7, type: 0, dora: false}];
		ownHand = getHandFromString("111234m5688p23s11z");
		
		discards = [[],getHandFromString("5p"),getHandFromString("57m"),getHandFromString("4m2p")];

		var expected = ["5p"];
		break;
	case 20:
		log("Testcase 20: Yaku: Tanyao");
		dora = [{index: 1, type: 0, dora: false}];
		ownHand = getHandFromString("23469m222488p345s");

		var expected = ["9m"];
	break;
	case 21:
		log("Testcase 21: Finished Hand");
		dora = [{index: 1, type: 0, dora: false}];
		ownHand = getHandFromString("234789m22234888p");
		var expected = ["9m"];
	break;
	case 22:
		log("Testcase 22: Example");
		dora = [{index: 2, type: 2, dora: false}];
		ownHand = getHandFromString("378p27m23466s347z8p");

		var expected = ["3z"];
	break;
	case 23:
		log("Testcase 23: Yaku: Single Yakuhai");
		dora = [{index: 7, type: 0, dora: false}];
		ownHand = getHandFromString("111222m5588p39s13z");

		var expected = ["3z"];
		break;
	case 24:
		log("Testcase 24: Yaku: Two from Tanyao");
		dora = [{index: 1, type: 1, dora: false}];
		ownHand = getHandFromString("222444m145679p33s");

		var expected = ["1p"];
		break;
	case 25:
		log("Testcase 25: Yaku: One from Tanyao");
		dora = [{index: 1, type: 1, dora: false}];
		ownHand = getHandFromString("2224447m1255p336s");

		var expected = ["1p"];
		break;
	case 26:
		log("Testcase 26: Keep Pair instead of triple");
		dora = [{index: 1, type: 1, dora: false}];
		ownHand = getHandFromString("111456m2256p123s2p");

		var expected = ["1m", "2p"];
		break;
	case 27:
		log("Testcase 27: Bridge vs. Border Wait");
		dora = [{index: 1, type: 1, dora: false}];
		ownHand = getHandFromString("11189m13789p123s");
		discards = [[],getHandFromString("1m"),getHandFromString("1m"),getHandFromString("1m")];
		var expected = ["9m"];
		break;
	case 28:
		log("Testcase 28: Open Hand");
		dora = [{index: 1, type: 1, dora: false}];
		ownHand = getHandFromString("2256p123s2p");
		calls[0] = getHandFromString("111444m");

		var expected = ["2p"];
		break;
	case 29:
		log("Testcase 29: Open Hand 2");
		dora = [{index: 4, type: 0, dora: false}];
		ownHand = getHandFromString("66734s");
		calls[0] = getHandFromString("111333555m");

		var expected = ["7s"];
		break;
	case 30:
		log("Testcase 30: Chi Pair Overlap 2");
		dora = [{index: 4, type: 0, dora: false}];
		ownHand = getHandFromString("11123455m25677p7s");

		var expected = ["2p", "7s"];
		break;
	case 31:
		log("Testcase 31: Chi Pair Overlap 3");
		dora = [{index: 4, type: 0, dora: false}];
		ownHand = getHandFromString("1112345578999m2p");

		var expected = ["2p"];
		break;
	case 32:
		log("Testcase 32: Test Pon Call");
		dora = [{index: 1, type: 1, dora: false}];
		ownHand = getHandFromString("222444m222367p3s");
		updateAvailableTiles();
		testCallTile = {index: 8, type: 0, dora: false, doraValue: 0};
		callTriple(["6p|7p"], 0);

		var expected = ["3s"];
		break;
	case 33:
		log("Testcase 33: Test Chi Call with Options");
		dora = [{index: 1, type: 1, dora: false}];
		ownHand = getHandFromString("222444m222357p3s");
		updateAvailableTiles();
		testCallTile = {index: 4, type: 0, dora: false, doraValue: 0};
		callTriple(["2p|3p", "3p|5p"], 0);

		var expected = ["3s"];
		break;
	case 34:
		log("Testcase 34: Test Furiten");
		dora = [{index: 1, type: 1, dora: false}];
		ownHand = getHandFromString("11122233344m45p5s");
		discards = [[{index: 6, type: 0, dora: false, doraValue: 0}], [], [], []];

		var expected = ["4p", "5p"];
		break;
	case 35:
		log("Testcase 35: Test Iipeikou");
		dora = [{index: 1, type: 1, dora: false}];
		ownHand = getHandFromString("111222m4455667p5s");
		discards = [[{index: 6, type: 0, dora: false, doraValue: 0}], [], [], []];

		var expected = ["7p"];
		break;
	case 36:
		log("Testcase 36: Test Honitsu");
		dora = [{index: 1, type: 1, dora: false}];
		ownHand = getHandFromString("111222555789m5s7z");
		discards = [[{index: 6, type: 0, dora: false, doraValue: 0}], [], [], []];

		var expected = ["5s"];
		break;
	case 37:
		log("Testcase 37: Test Ittsuu");
		dora = [{index: 1, type: 1, dora: false}];
		ownHand = getHandFromString("12345689m67s777z");
		discards = [[{index: 6, type: 0, dora: false, doraValue: 0}], [], [], []];

		var expected = ["6s"];
		break;
	case 38:
		log("Testcase 38: Test Sanankou");
		dora = [{index: 1, type: 1, dora: false}];
		ownHand = getHandFromString("22233367m3488p88s");
		discards = [[{index: 2, type: 0, dora: false, doraValue: 0}], [], [], []];
		
		var expected = ["3p"];
		break;
	case 39:
		isClosed = false;
		log("Testcase 39: Test Toitoi");
		dora = [{index: 1, type: 1, dora: false}];
		ownHand = getHandFromString("333666m788p88s");
		discards = [[], [{index: 6, type: 0, dora: false, doraValue: 0}, {index: 6, type: 0, dora: false, doraValue: 0}], [{index: 9, type: 0, dora: false, doraValue: 0}], []];
		calls = [[{index: 1, type: 1, dora: false, doraValue: 0}, {index: 1, type: 1, dora: false, doraValue: 0}, {index: 1, type: 1, dora: false, doraValue: 0}], [], [], []];

		var expected = ["7p"];
		break;
	case 40:
		log("Testcase 40: Test Chinitsu");
		dora = [{index: 1, type: 1, dora: false}];
		ownHand = getHandFromString("111222568899m33z");

		var expected = ["3z"];
		break;
	case 41:
		log("Testcase 41: Sanshoku Douko");
		dora = [{index: 1, type: 1, dora: false}];
		ownHand = getHandFromString("111m11199p1167s");

		var expected = ["6s", "9p"];
		break;
	case 42:
		log("Testcase 42: Sanshoku");
		dora = [{index: 1, type: 1, dora: false}];
		ownHand = getHandFromString("123m12399p1289s");
		discards = [[], [{index: 3, type: 2, dora: false, doraValue: 0}], [], []];

		var expected = ["9s"];
		break;
	case 43:
		log("Testcase 43: Chanta");
		dora = [{index: 1, type: 1, dora: false}];
		ownHand = getHandFromString("123m123999p579s22z");
		discards = [[], [{index: 3, type: 2, dora: false, doraValue: 0}], [], []];

		var expected = ["5s"];
		break;
	case 44:
		log("Testcase 44: Honrou");
		dora = [{index: 1, type: 1, dora: false}];
		ownHand = getHandFromString("111m111999p11159s");
		discards = [[], [{index: 9, type: 2, dora: false, doraValue: 0}, {index: 9, type: 2, dora: false, doraValue: 0}], [], []];

		var expected = ["5s"];
		break;
	case 45:
		log("Testcase 45: Shousangen");
		dora = [{index: 1, type: 1, dora: false}];
		ownHand = getHandFromString("456s23p78s5556667z");

		var expected = ["2p"];
		break;
	case 46:
		log("Testcase 46: Daisangen");
		dora = [{index: 1, type: 1, dora: false}];
		ownHand = getHandFromString("456s23p55566677z");

		var expected = ["2p"];
		break;
	case 47:
		log("Testcase 47: Junchan");
		dora = [{index: 1, type: 1, dora: false}];
		ownHand = getHandFromString("123m123999p11579s");
		discards = [[], [{index: 3, type: 2, dora: false, doraValue: 0}], [], []];

		var expected = ["5s"];
		break;
	default:
		testsRunning = false;
		return;
	}
	updateAvailableTiles();
	
	var tile = discard();
	log("Expected Discards:");
	for(var i = 0; i < expected.length; i++) {
		log(expected[i]);
		if(expected[i] == tile.index + getNameForType(tile.type)) {
			log("TESTCASE " + currentTest + " PASSED!");
			passes++;
			log(" ");
			return;	
		}
	}
	log("<b>TESTCASE " + currentTest + " FAILED!</b>");	
}


//################################
// BENCHMARK/SIMULATION
//################################


//Main benchmark
function runBenchmarks() {
		
	var NUMBER_OF_RUNS = 50;
	
	if(currentTest < (NUMBER_OF_RUNS*50)) {
		setTimeout(runBenchmark, 5000); //Loop needs to be delayed, otherwise browser crashes
	}
	else {
		endTime = new Date();
		var time = endTime - startTime;
		log("#################");
		var time = 0;
		var val = 0;
		for(var i = 0; i < winValues.length; i++) {
			log("Hand Turns: " + winValues[i].time + ", Hand Values: " + winValues[i].value);
			if(winValues[i].time != 0) {
				time += winValues[i].time;
				val += winValues[i].value;
			}
		}
		log("Average Turns: " + (time / passes) + " Average Value: " + (val / passes));
		log("Tenpai Hands: " + passes + " out of " + NUMBER_OF_RUNS);
		log("#################");
	}
}

//Simulates turns and check if tenpai
function runBenchmark() {
	
	log(" ");
	
	setTestData();

	while(tilesLeft > 4) {
		simulateTurn();
		
		var value = getTilePriorities(ownHand);
		var triplesAndPairs = getTriplesAndPairsInHand(ownHand);
		handWithoutTriples = getHandWithoutTriples(ownHand, triplesAndPairs.triples);
		var doubles = getDoublesInHand(handWithoutTriples);
		if(isTenpai(triplesAndPairs, doubles, value[0].efficiency)) {
			log("<h2>Tenpai</h2>");
			passes++;
			log("Turns: " + (currentTest % 50));
			log("Value: " + (value[0].dora + value[0].yaku.closed));
			winValues.push({time: (currentTest % 50), value: (value[0].dora + value[0].yaku.closed)});
			currentTest += 50 - (currentTest % 50);
			runBenchmarks();
			return;
		}
		
		determineStrategy();
		
		
		discard();
		tilesLeft--;
		currentTest++;
	}
	
	log("<h2>No Ten</h2>");
	var value = getTilePriorities(ownHand);
	winValues.push({time: 0, value: (value[0].dora + value[0].yaku.closed)});
	currentTest += 50 - (currentTest % 50);
	runBenchmarks();
	
}

//Set testdata for benchmark
function setTestData() {
	log("Set Test Data.");

	discards = [[],[],[],[]];
	calls = [[],[],[],[]];
	ownHand = [];
	dora = [];
	
	seatWind = 2;
	roundWind = 1;
	tilesLeft = 70;
	strategy = STRATEGIES.GENERAL;
	EFFICIENCY_VALUE = 1;
	YAKU_VALUE = 2;
	DORA_VALUE = 1;
	SAFETY_VALUE = 0.5;
	PAIR_VALUE = 0.5;
	WAIT_VALUE = 0.3;
	FOLD_CONSTANT = 1000;
	
	dora = drawTile(dora);
	for(var i = 0; i < 13; i++) {
		ownHand = drawTile(ownHand);
	}
	tilesLeft = 68;
}

//Simulates a turn
function simulateTurn() {
	updateAvailableTiles();
	
	var randomTile = availableTiles[Math.floor(Math.random() * availableTiles.length)];
	discards[1].push(randomTile);
	//log("Player 2 discard:");
	//printTile(randomTile);
	tilesLeft--;
	
	updateAvailableTiles();
	var randomTile = availableTiles[Math.floor(Math.random() * availableTiles.length)];
	discards[2].push(randomTile);
	updateAvailableTiles();
	//log("Player 3 discard:");
	//printTile(randomTile);
	tilesLeft--;
	
	updateAvailableTiles();
	var randomTile = availableTiles[Math.floor(Math.random() * availableTiles.length)];
	discards[3].push(randomTile);
	//log("Player 4 discard:");
	//printTile(randomTile);
	tilesLeft--;
	
	ownHand = sortHand(ownHand);
	ownHand = drawTile(ownHand);
}

//Simulate draw of tile
function drawTile(hand) {
	updateAvailableTiles();
	var randomTile = availableTiles[Math.floor(Math.random() * availableTiles.length)];
	hand.push(randomTile);
	//log("Drew Tile:");
	//printTile(randomTile);
	updateAvailableTiles();
	return hand;
}
