//################################
// YAKU
// Contains the yaku calculations
//################################

//Returns the closed and open yaku value of the hand
function getYaku(inputHand, inputCalls) {
	
	var hand = inputHand.concat(inputCalls); //Add calls to hand
	
	var yakuOpen = 0;
	var yakuClosed = 0;
	
	// ### 1 Han ###
	
	var triplesAndPairs = getTriplesAndPairsInHand(hand);
	//handWithoutTriples = getHandWithoutTriples(hand, triplesAndPairs.triples);
	var handWithoutTriplesAndPairs = getHandWithoutTriples(hand, triplesAndPairs.triples.concat(triplesAndPairs.pairs));
	var doubles = getDoublesInHand(handWithoutTriplesAndPairs);
	//var tenpai = isTenpai(triplesAndPairs, doubles);
	var pons = getPonsInHand(hand);
	var chis = getBestChisInHand(hand);

	//Yakuhai
	//Wind/Dragon Triples
	//Open
	if(strategy != STRATEGIES.CHIITOITSU) {
		var yakuhai = getYakuhai(triplesAndPairs.triples);
		yakuOpen += yakuhai.open;
		yakuClosed += yakuhai.closed;
	}
	
	//Riichi (Bot has better results without additional value for Riichi)
	//Closed
	//var riichi = getRiichi(tenpai);
	//yakuOpen += riichi.open;
	//yakuClosed += riichi.closed;
	
	//Tanyao
	//Open
	var tanyao = getTanyao(hand, inputCalls);
	yakuOpen += tanyao.open;
	yakuClosed += tanyao.closed;
	
	//Pinfu (Bot has better results without additional value for Pinfu)
	//Closed
	//var pinfu = getPinfu(triplesAndPairs, doubles, tenpai);
	//yakuOpen += pinfu.open;
	//yakuClosed += pinfu.closed;
	
	//Iipeikou (Identical Sequences in same type)
	//Closed
	var iipeikou = getIipeikou(triplesAndPairs.triples);
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
	var sanankou = getSanankou(inputHand);
	yakuOpen += sanankou.open;
	yakuClosed += sanankou.closed;
	
	//Sankantsu
	//3 Kans
	//Open
	//-> TODO: Should not influence score, but Kan calling.
	
	//Toitoi
	//All Triplets
	//Open
	var toitoi = getToitoi(hand);
	yakuOpen += toitoi.open;
	yakuClosed += toitoi.closed;
	
	//Sanshoku Doukou
	//3 same index triplets in all 3 types
	//Open
	var sanshokuDouko = getSanshokuDouko(pons);
	yakuOpen += sanshokuDouko.open;
	yakuClosed += sanshokuDouko.closed;
	
	//Sanshoku
	//3 same index straights in all types
	//Open/-1 Han after call
	var sanshoku = getSanshoku(chis);
	yakuOpen += sanshoku.open;
	yakuClosed += sanshoku.closed;
	
	//Shousangen
	//Little 3 Dragons (2 Triplets + Pair)
	//Open
	var shousangen = getShousangen(pons, triplesAndPairs.pairs);
	yakuOpen += shousangen.open;
	yakuClosed += shousangen.closed;
	
	//Chanta
	//Half outside Hand (including terminals)
	//Open/-1 Han after call
	var chanta = getChanta(pons, chis, triplesAndPairs.pairs);
	yakuOpen += chanta.open;
	yakuClosed += chanta.closed;
	
	//Honrou
	//All Terminals and Honors (means: Also 4 triplets)
	//Open
	var honrou = getHonrou(hand);
	yakuOpen += honrou.open;
	yakuClosed += honrou.closed;
	
	//Ittsuu
	//Pure Straight
	//Open/-1 Han after call
	var ittsuu = getIttsuu(triplesAndPairs.triples);
	yakuOpen += ittsuu.open;
	yakuClosed += ittsuu.closed;
	
	//3 Han
	
	//Ryanpeikou
	//2 times identical sequences (2 Iipeikou)
	//Closed
	
	//Junchan
	//All Terminals
	//Open/-1 Han after call
	var junchan = getJunchan(pons, chis, triplesAndPairs.pairs);
	yakuOpen += junchan.open;
	yakuClosed += junchan.closed;
	
	//Honitsu
	//Half Flush
	//Open/-1 Han after call
	var honitsu = getHonitsu(hand);
	yakuOpen += honitsu.open;
	yakuClosed += honitsu.closed;
	
	//6 Han
	
	//Chinitsu
	//Full Flush
	//Open/-1 Han after call
	var chinitsu = getChinitsu(hand);
	yakuOpen += chinitsu.open;
	yakuClosed += chinitsu.closed;
	
	//Yakuman
	
	//Daisangen
	//Big Three Dragons
	//Open
	var daisangen = getDaisangen(pons);
	yakuOpen += daisangen.open;
	yakuClosed += daisangen.closed;
	
	//4 Concealed Triplets
	//Closed
	
	//All Honours
	//Open
	
	//All Green
	//Open
	
	//All Terminals
	//Open
	
	//Four Little Winds
	//Open
	
	//4 Kans
	//Open
	
	//9 Gates
	//Closed
	
	//Thirteen Orphans
	//Closed
	
	//Double Yakuman
	
	//4 Concealed Triplets Single Wait
	//Closed
	
	//13 Wait Thirteen Orphans
	//Closed
	
	//True Nine Gates
	//Closed
	
	//Four Big Winds
	//Open
	
	return {open: yakuOpen, closed: yakuClosed};
}

//Yakuhai
function getYakuhai(triples) {
	var yakuhai = 0;
	yakuhai = triples.filter(tile => tile.type == 3 && (tile.index > 4 || tile.index == seatWind || tile.index == roundWind)).length/3;
	yakuhai += triples.filter(tile => tile.type == 3 && tile.index == seatWind && tile.index == roundWind).length/3;
	return {open: yakuhai, closed: yakuhai};
}

//Riichi
function getRiichi(tenpai) {
	if(tenpai) {
		return {open: 0, closed: 1};
	}
	return {open: 0, closed: 0};
}

//Tanyao
function getTanyao(hand, inputCalls) {
	if(hand.filter(tile => tile.type != 3 && tile.index > 1 && tile.index < 9).length >= 13 && inputCalls.filter(tile => tile.type == 3 || tile.index == 1 || tile.index == 9).length == 0) {
		return {open: 1, closed: 1};
	}
	return {open: 0, closed: 0};
}

//Pinfu (Does not detect all Pinfu)
function getPinfu(triplesAndPairs, doubles, tenpai) {

	if(isClosed && tenpai && parseInt(triplesAndPairs.triples.length/3) == 3 && parseInt(triplesAndPairs.pairs.length/2) == 1 && getPonsInHand(triplesAndPairs.triples).length == 0) {
		doubles = sortHand(doubles);
		for(var i = 0; i < doubles.length - 1; i++) {
			if(doubles[i].index > 1 && doubles[i+1].index < 9 && Math.abs(doubles[0].index - doubles[1].index) == 1) {
				return {open: 1, closed: 1};
				break;
			}
		}
	}
	return {open: 0, closed: 0};
}

//Iipeikou
function getIipeikou(triples) {
	for(var i = 0; i < triples.length; i++) {
		var tiles1 = getNumberOfTilesInHand(triples, triples[i].index, triples[i].type);
		var tiles2 = getNumberOfTilesInHand(triples, triples[i].index + 1, triples[i].type);
		var tiles3 = getNumberOfTilesInHand(triples, triples[i].index + 2, triples[i].type);
		if(tiles1 == 2 && tiles2 == 2 && tiles3 == 2) {
			return {open: 0, closed: 1};
		}
	}
	return {open: 0, closed: 0};
}

//Sanankou
function getSanankou(hand) {
	if(!isConsideringCall) {
		var concealedTriples = getPonsInHand(hand);
		if(parseInt(concealedTriples.length/3) >= 3) {
			return {open: 2, closed: 2};
		}
	}
	
	return {open: 0, closed: 0};
}

//Toitoi
function getToitoi(hand) {
	var pons = getPonsInHand(hand);
	if(parseInt(pons.length/3) >= 4) {
		return {open: 2, closed: 2};
	}
	
	return {open: 0, closed: 0};
}

//Sanshoku Douko
function getSanshokuDouko(triples) {
	for(var i = 1; i <= 9; i++) {
		if(triples.filter(tile => tile.index == i && tile.type < 3).length >= 9) {
			return {open: 2, closed: 2};
		}
	}
	return {open: 0, closed: 0};
}

//Sanshoku Douko
function getSanshoku(chis) {
	for(var i = 1; i <= 7; i++) {
		if(chis.filter(tile => tile.index == i || tile.index == i + 1 || tile.index == i + 2).length >= 9) {
			return {open: 2, closed: 1};
		}
	}
	return {open: 0, closed: 0};
}

//Shousangen - TODO: Check for Kans
function getShousangen(hand) {
	if(hand.filter(tile => tile.type == 3 && tile.index >= 5).length == 8) {
		return {open: 2, closed: 2};
	}
	return {open: 0, closed: 0};
}

//Daisangen - TODO: Check for Kans
function getDaisangen(hand) {
	if(hand.filter(tile => tile.type == 3 && tile.index >= 5).length >= 9) {
		return {open: 10, closed: 10}; //Yakuman -> 10?
	}
	return {open: 0, closed: 0};
}

//Chanta - poor detection
function getChanta(pons, chis, pairs) {
	if((pons.concat(pairs)).filter(tile => tile.type == 3 || tile.index == 1 || tile.index == 9).length + (chis.filter(tile => tile.index == 1 || tile.index == 9).length * 3) >= 13) {
		return {open: 1, closed: 2};
	}
	return {open: 0, closed: 0};
}

//Honrou
function getHonrou(hand) {
	if(hand.filter(tile => tile.type == 3 || tile.index == 1 || tile.index == 9).length >= 13) {
		return {open: 3, closed: 2}; // - Added to Chanta
	}
	return {open: 0, closed: 0};
}

//Junchan
function getJunchan(pons, chis, pairs) {
	if((pons.concat(pairs)).filter(tile => tile.type != 3 && (tile.index == 1 || tile.index == 9)).length + (chis.filter(tile => tile.index == 1 || tile.index == 9).length * 3) >= 13) {
		return {open: 1, closed: 1}; // - Added to Chanta
	}
	return {open: 0, closed: 0};
}

//Ittsuu
function getIttsuu(triples) {
	for(var j = 0; j <= 2; j++) {
		for(var i = 1; i <= 9; i++) {
			if(!triples.some(tile => tile.type == j && tile.index == i)) {
				i=10;
				continue;
			}
			if(i == 9) {
				return {open: 1, closed: 2};
			}
		}
	}
	return {open: 0, closed: 0};
}

//Honitsu
function getHonitsu(hand) {
	if(hand.filter(tile => tile.type == 3 || tile.type == 0).length >= 13 || hand.filter(tile => tile.type == 3 || tile.type == 1).length >= 13 || hand.filter(tile => tile.type == 3 || tile.type == 2).length >= 13) { //&& tenpai ?
		return {open: 2, closed: 3};
	}
	return {open: 0, closed: 0};
}

//Chinitsu
function getChinitsu(hand) {
	if(hand.filter(tile => tile.type == 0).length >= 13 || hand.filter(tile => tile.type == 1).length >= 13 || hand.filter(tile => tile.type == 2).length >= 13) { //&& tenpai ?
		return {open: 3, closed: 3}; //Score gets added to honitsu -> 5/6 han
	}
	return {open: 0, closed: 0};
}