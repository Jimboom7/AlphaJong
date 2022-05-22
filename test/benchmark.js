//################################
// BENCHMARK
// Contains offense and defense benchmark test
//################################

//TEST PARAMETERS
var NUMBER_OF_RUNS = 10;
var currentTest = 0;
var passes = 0;
var winValues = [];
var testPlayerRiichi = [0, 0, 0, 0];
var testPlayerHand = [13, 13, 13, 13];

//Only run if debug mode
if (isDebug()) {
	runOffenseBenchmark();
	//runDefenseBenchmark();
}

//################################
// OFFENSE BENCHMARK
//################################

//Main
function runOffenseBenchmark() {
	seed = currentTest * 100;

	if (currentTest < (NUMBER_OF_RUNS * 50)) {
		setTimeout(runOffense, 1000); //Loop needs to be delayed, otherwise browser crashes
	}
	else {
		log("#################");
		var time = 0;
		var val = 0;
		for (let wv of winValues) {
			log("Hand Turns: " + wv.time + ", Hand Values: " + wv.value);
			if (wv.time != 0) {
				time += wv.time;
				val += wv.value;
			}
		}
		log("Average Turns: " + (time / passes) + " Average Value: " + (val / passes));
		log("Tenpai Hands: " + passes + " out of " + NUMBER_OF_RUNS);
		log("#################");
	}
}

//Simulates turns and check if tenpai. No Calls, only closed hands.
async function runOffense() {
	log(" ");

	setTestData();

	while (tilesLeft > 4) {
		simulateTurn();
		updateDiscardedTilesSafety();

		var value = await getTilePriorities(ownHand);
		if (value[0].shanten == 0) {
			log("<h2>Tenpai</h2>");
			passes++;
			log("Turns: " + (currentTest % 50));
			var score = calculateScore(0, value[0].dora + value[0].yaku.closed, value[0].fu);
			log("Value: " + score);
			winValues.push({ time: (currentTest % 50), value: score });
			currentTest += 50 - (currentTest % 50);
			runOffenseBenchmark();
			return;
		}

		determineStrategy();


		discard();
		updateDiscardedTilesSafety();
		tilesLeft--;
		currentTest++;
	}

	log("<h2>No Ten</h2>");
	var value = await getTilePriorities(ownHand);
	winValues.push({ time: 0, value: (value[0].dora + value[0].yaku.closed) });
	currentTest += 50 - (currentTest % 50);
	runOffenseBenchmark();
}

//Set testdata for benchmark
function setTestData() {
	log("Set Test Data.");

	discards = [[], [], [], []];
	calls = [[], [], [], []];
	ownHand = [];
	dora = [];

	seatWind = 2;
	roundWind = 1;
	tilesLeft = 70;
	strategy = STRATEGIES.GENERAL;
	EFFICIENCY_VALUE = 1;
	SCORE_VALUE = 0.5;
	SAFETY_VALUE = 0;
	WAIT_VALUE = 0.3;
	FOLD_CONSTANT = 1000;

	dora = drawTile(dora);
	for (var i = 0; i < 13; i++) {
		ownHand = drawTile(ownHand);
	}
	tilesLeft = 68;
}

//Simulates a turn
function simulateTurn() {
	updateAvailableTiles();

	var randomTile = availableTiles[Math.floor(pseudoRandom() * availableTiles.length)];
	discards[1].push(randomTile);
	tilesLeft--;

	updateAvailableTiles();
	randomTile = availableTiles[Math.floor(pseudoRandom() * availableTiles.length)];
	discards[2].push(randomTile);
	updateAvailableTiles();
	tilesLeft--;

	updateAvailableTiles();
	randomTile = availableTiles[Math.floor(pseudoRandom() * availableTiles.length)];
	discards[3].push(randomTile);
	tilesLeft--;

	ownHand = sortTiles(ownHand);
	ownHand = drawTile(ownHand);
}

//Simulate draw of tile
function drawTile(hand) {
	updateAvailableTiles();
	var randomTile = availableTiles[Math.floor(pseudoRandom() * availableTiles.length)];
	hand.push(randomTile);
	updateAvailableTiles();
	return hand;
}

//Pseudo random functionality, so every benchmark is similar
var seed = 100;
function pseudoRandom() {
	var x = Math.sin(seed++) * 10000;
	return x - Math.floor(x);
}

//################################
// DEFENSE BENCHMARK
// Takes some situations from real games and checks which tiles are the safest.
// Only looks at defense, not efficiency or value.
// A smaller value is a better result.
// Does not take the value of the deal-in into account.
//################################

//Defense Benchmark Main
function runDefenseBenchmark() {
	var testDefenseValue = 0;
	var overall_checks = 0;
	var testDefenseData = [ //Testdata: 1. Debug String, 2. Deal in Tiles, 4. What tile did the Riichi player discard?
		["2s|0m120679s222z9m|777z||111z|342687m789s|1m9s1p463m8p7m1p26s9m30p1m77p2z|1z23p37m53z6m3z81s2m5p1s6z9p4z2p|43z32p2m44685p8m4z44p8m7z|3z1m4238s56z2p55z8m9p3m4z1s1p|0,0,0,0|1|1|0", "45m1p", [null, null, null, null]],
		["3m|2378m340778p567s5p||076s|||177z3s|65z1s1z1p3z|1m7z9p5z62p|22154z2p|0,0,1,0|4|1|47", "1p4s", [null, null, getTileFromString("2p"), null]],
		["6m|4678m23888p2388s1p||345s||888m|1z1m33z26s5z55p|127z9m2z742p79s|7z1p1m3s5z199p1z2m9p|156z27s8p26z95m1s2z|0,0,0,0|3|1|27", "14m", [null, null, null, null]],
		["4z|345567m123p78889s|||465m||3472z1m8p9m3s1z1m3z4m|91p7553z9p8s8m3p3s|27z1s1z7s9388p88m6p|9m17p3m27p9s911m446z|1,1,0,0|2|1|21", "47p", [null, getTileFromString("5m"), null, null]],
		["2s|66778m22p333666s6z|||340s||3z1p1z1s9m1s7z4s4p8s|532z1m47s89m4s|2z98113p977s7z|32141z97s1m49p|1,0,0,0|1|1|30", "8s6z", [null, null, null, null]],
		["6p|6678m2446p7s5556z||||777p|4z1p2z1m1p7z6p4z7p|9m81s9p3m9p14z|7z12s1z1m2z12m|47z9s913p1s3z1s|0,1,0,0|4|1|36", "69s", [null, getTileFromString("7p"), null, null]],
		["3s|234m4678p455667s3p||777z999m555p||222p|54z1p1s6z9s5z8m1p7z2p|4z9s2z1m8p82m967p5m1s3p3m|12s12z2967s123m22z8m|91m51z923s34p1s4p23m1z|0,0,0,0|4|1|16", "468s", [null, null, null, null]],
		["8m|24999m789p234s66z2m|||||415z6s7p2s4m4s68m2p5z1p|74z1p1s2p2s8p23z7s3z67m|217z3p7z6s1m4s655z6s2p|327z37m3s1m5s1z11s46z1p|1,1,0,0|2|1|16", "4m39p", [null, getTileFromString("7m"), null, null]],
		["3z|13056m67p1789s44z7s|||||9m177z3p22z|3635615z|26z1p76m3p3s3m|31z88m5s8p1m2p|0,0,1,0|3|1|39", "1m", [null, null, getTileFromString("3m"), null]],
		["3z|667m678p4567888s8p||304m|||47z93m243p|9p1m251z9s5z9m|4z9p73z9s2z8p8m1z|11m72z2s1p7m4p6z|0,0,0,0|3|1|36", "47p", [null, null, null, null]],
		["28s|2344577m340p6m|2222p|555z|||2z913s7p8s6z6s5m4s9m12z|76z13p19s1m2s44z5s971p|3z1s74z18m8s1p5m799p9m|2z1m9p6z3p73z2s234z2s1z1s|1,0,0,0|2|1|14", "6p7s", [null, null, null, null]],
		["5z|2344567m1255798s|||999p||1z6m163z5p6m11329p1m3p1m0p7z|7z2m33z3m7s1m1s7p2z66p4s9m4p4s3m|1m164z24m43p1z762p3s2m4s7z8m4p|2z1p3z1s2627z8s8m5p44z645p7s|0,1,0,0|1|1|0", "2p5z", [null, getTileFromString("4s"), null, null]],
		["1p|407m567p12305s334z||111z|||257z9m9s1m2p|7z3m5z8s8612p6s|6527z8s9p3m1z2p|23z9p9m899s7p4z|0,0,1,0|4|1|35", "36p14s", [null, null, getTileFromString("2p"), null]],
		["5m|40p222456789s44z3p|||||1p2m2z2m1s60m2p4z8s4m1z7m1z|6534z1s2m2z799m34s9p1m|2435m2p63m1p7z11p7z9p9m|51z9s713m6p77z14m99p4s8m|1,1,0,0|2|1|12", "258p", [null, getTileFromString("9p"), null, null]],
		["8p|199m199s7z4s|555222z||||14p0m7p2m8s4z756m3s3z8m3p|1z8s4z3m8s9p0s7z7s73z154p|9p1m64z5s5z7s6m3s1p7s8m|331124z3636m1z3p|0,1,0,0|1|1|17", "14s", [null, getTileFromString("9p"), null, null]],
		["8m|566778m678p4568s2p||111z234m|||42z19s5z634s3m|7534z1p25s89p2z7p1m|65z9p1s198m3z8p3s3z4s|4z1s1m985s2m22z9p7z8p|1,0,0,0|4|1|24", "25p", [null, null, null, null]],
		["1z2p|4568m36789p566s6z2m||||7777z|9s9m33z1m7p11s1p|2p279m7p2z4s2z83s|14z2m34z1m4s79m3s|1p17m11z4p2z17s9p|0,1,0,0|4|1|29", "36p", [null, getTileFromString("7m"), null, null]],
		["1p|23467m33446p456s7m||564m678222p|||1z9p43z1p426z|732z1m71z9p12s9m3s9p|56z9m8p14s2m1z72s38m|2z7p8m3z6p2m0s5p4z3s9p|0,0,1,0|4|1|26", "2356p", [null, null, getTileFromString("2m"), null]],
		["2p|4589m45689p34887s|||||14572z1s3z9s4z|7542z1s980m3z|54z117p29s798m|122z7s94m9p261s|0,0,1,0|3|1|31", "58s", [null, null, getTileFromString("8m"), null]],
		["6m|12m33p123567s111z5p||||456m678s|9p38s66m6z6p7z7m4z1p45z8s22m5p|92s1m34z3m7s19m767z1p9m222z|3z2p57z2s41z44m99s9p1s98m|11s6z4s2m6z9p8m2z9s53z6s3z4188m|1,0,0,0|2|1|2", "48p", [null, null, null, null]],
		["6p|34m56p266677s5m|222z|||111z|67z3p7m6z93p1s|9s33z9m7z8m5z|6z9p9m8p43z9s|1m196s4m2s4p4s|0,0,0,0|2|1|39", "58p", [null, null, null, null]],
		["5s|111m135688p367s53z|||||9m7z8m9p27m4z7890m9s4m6z|9p7z3p22m4p36m243z6m5z9m|3z6p2647m6p2s1p88m9s5m9s|3z13m2z9s5m7z1p5m4z7m1p6z2s|0,0,0,1|1|1|13", "36s", [null, null, null, getTileFromString("1p")]],
		["4m|123678m3468p235s8p|||222z|342s|4z9p65z1p9m5z98s|34651z1p1m382s|9p2s6z3p1m1p3m7s33z|196s1p8m2p9m6z12m6s|0,0,0,0|4|1|29", "47p", [null, null, null, null]],
		["3z|78m9p13306s44z1s|999m||||9s2p9s1p2s72441m9s1m11z7p5z9s|7z77p2m87s4z7s6z68p5z5m2z8p7z2m|5z7s3p7m64z44m0p5s15z5p3m5s3m3z|1827s336z356p8s113m8p2z2m|0,1,1,0|2|2|1", "478m4s", [0, 1, 1, 0], [null, getTileFromString("6p"), getTileFromString("7m"), null]],
		["8s|123m34588p224448s|||076p|444z|1s321z3m1p98m1z6s6p8m3z8m1z5p2m|4m6z60m9p4m7s4p2z9p2m3z2s5m2z5m|1s6527z8s7m9p1z42m5z2s9m9p6m7z|3z5p5z66363s5z7s4p66m46z5m4p7z|0,1,0,0|1|2|1", "9s", [null, getTileFromString("4p"), null, null]],
		["7p|345p1s7772z|444z465s|555z|678p|403s555m067p|1z1m362z46m8p2s22m|9m1z8m7z9s3z4m1p7m9s97m|1z1m2p2m3s9p9s4m9p1m|63z927m7s8p16m8s5p|0,0,0,0|4|2|25", "3p1347s2z", [null, null, null, null]],
		["6p|067m3357p588s7m|333s||444s||1573z1p1m6z9p2m26z2s1p|2m1z1s2p19m6z4m3z9m4s|4z9p5z1s6z22p5z7s2z2p3m4p|9m4z1s54z315p1z9p1m73z|0,0,0,0|3|2|19", "147m", [null, null, null, null]],
		["4z|05m467895p|222z777m||354m453s222m||6z882s6z94s9m|9m8p3m49p|9s1p5z9p2z37m|9m377z8p4s6z|0,0,0,0|3|2|42", "25p", [null, null, null, null]],
		["49m|233567m3067p666s4p||9999p|777111z444s888p|666z|1p36z911s7p4z4p4z0s8p2z3s|3z9m8s1m1p5z2p5s2p2s1z97s|1m324z177s5z2s8m3z83s6m2p1m7p2m|9m91s45z67m4p8m9s2z54s9m7z2m2s|0,0,0,0|3|1|6", "4m15p", [null, null, null, null]],
		["6p|3457p1233s|777666z||||4z2s5z2m8s4z618m1p5z5s8p7m|4z18m25z4s6z6m129p1z7m|1p14s6m7s9m9p4m7s1z1p8m|4z19s7z33m2s2p15z93m|0,0,1,0|1|1|18", "7p", [null, null, getTileFromString("6m"), , null]],
		["0s|345m1145679p456s2p|||||342z9s7z6m4p812m37p8s7m8s6p|46z12m7z9s99m94p1m1z6p7s2m5z8s|3z9p557z8s48m5s124z3m2p2s1m5z|6z1p267342z99s8m5s7p1z229p|1,0,1,0|4|1|2", "14s", [null, null, getTileFromString("1z"), null]],
		["7z|23499m567p55z7s|403s||111z111m||18s2p773z91p86m|4m9s62z13m99p7z|63z4s2m88p6z7m8p8m7p9s|413z6139s3m2z1s|0,0,0,0|3|2|28", "58s4p", [null, null, null, null]],
		["8p|36679m36p6s55z2s|342m|111z|897111s333z||8p43s346p1s7z8s2z8m4p3644z2p|2z4p84m2p79s9p7674z6p33m|8p199m61p0m19p2z90p9s1m28p16z|1p8m4z215p7z9p2z4p6z5p9s5585m|0,0,0,0|3|1|2", "5s", [null, null, null, null]],
		["3z2s|478m3888p3099s46z7s||||2222m|17z46948p13m8s9p1s363p9m|257z7p8s3m14p3z8m47s4z9p9s2z|2z1p2737z97p11z8s71p71s11m|315z8s7p5z41s4p989m7s891m1p|0,1,0,0|3|1|2", "47m", [null, getTileFromString("4p"), null, null]],
		["1p|23067m25778p47s7z3s|||||25z1m18s8999m8s11z9m6s2p4m|27z9s6z9p3266s8m1z1m6z12p4z|2564z99p2111s3p1m6z8m2s6p|91p8s5m32s2z6s3p8s1z1m2p5z3p4m4z|0,0,0,1|2|1|4", "59s7p", [null, null, null, getTileFromString("3s")]],
		["9m|45m3578999p12334s||333z||576s678m|412575z2p8m2s1m771s|8s2m4s421z9s7z8p8m2z9m5p7m|475z1p982s2m9s1p1s6z|3z2p2z331m1s2m2p5s76m6s7p1m|0,0,0,0|2|1|15", "69p", [null, null, null, null]],
		["9m|45m3578999p12334s||333z||576s678m|412575z2p8m2s1m771s|8s2m4s421z9s7z8p8m2z9m5p7m|475z1p982s2m9s1p1s6z|3z2p2z331m1s2m2p5s76m6s7p1m|0,0,0,0|2|1|15", "4s", [null, null, null, null]],
		["0s|3479m57p78995s|111z||||247z1p4s|3z124s|4z1s97m|42z1m2s|0,1,0,0|1|1|52", "147p1m6z", [null, getTileFromString("4s"), null, null]],
		["2m|45m079p23488s666z1s||777z789s|||2m57z9m2p344z2s|91m2p5z2p415m1p3m1z4m|25z1s98m3s125p5s2m1z|8p49s7m1p1z76m6s4z7m|0,0,0,0|4|1|25", "47s", [null, null, null, null]],
		["8m|5679m89p1122678s7p||||786p|9s254z54s5m7z4m5z|91p73z39s6m3s1p2m|2z8p2m462z5s5p9m|357z98s4p3s98m2z6m|0,0,0,0|2|1|29", "14m", [null, null, null, null]]
	];
	var tileset = getTilesFromString("123456789m123456789p123456789s1234567z");

	for (let data of testDefenseData) {
		readDebugString(data[0]);
		initialDiscardedTilesSafety();
		updateAvailableTiles();
		dangerTiles = getTilesFromString(data[1]);
		riichiTiles = data[2];

		for (let tile of tileset) {
			tile.danger = getTileDanger(tile);
		}

		tileset.sort(function (p1, p2) {
			return p2.danger - p1.danger;
		});
		testDefenseValue += checkDefense(dangerTiles, tileset);
		overall_checks += dangerTiles.length;
	}
	log("Defense Value: " + (testDefenseValue / overall_checks));
	return testDefenseValue / overall_checks;
}

function checkDefense(dangerTiles, tileset) {
	var testDefenseValue = 0;
	for (var i = 0; i < tileset.length; i++) {
		for (let dangerTile of dangerTiles) {
			if (getTileName(dangerTile) == getTileName(tileset[i])) {
				testDefenseValue += i;
			}
		}
	}
	return testDefenseValue;
}