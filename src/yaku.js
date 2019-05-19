//################################
// YAKU
//################################

function getYaku(inputHand) {
	hand = [...inputHand];
	hand = getHandWithCalls(hand); //Add Calls to hand
	
	var yakuOpen = 0;
	var yakuClosed = 0;
	
	// ### 1 Han ###
	
	var triplesAndPairs = getTriplesAndPairsInHand(hand);
	//handWithoutTriples = getHandWithoutTriples(hand, triplesAndPairs.triples);
	handWithoutTriplesAndPairs = getHandWithoutTriples(hand, triplesAndPairs.triples.concat(triplesAndPairs.pairs));
	var doubles = getDoublesInHand(handWithoutTriplesAndPairs);
	var tenpai = isTenpai(triplesAndPairs, doubles);

	//Yakuhai
	//Wind/Dragon Triples
	//Open
	if(strategy != STRATEGIES.CHIITOITSU) {
		var yakuhai = getYakuhai(triplesAndPairs.triples);
		yakuOpen += yakuhai.open;
		yakuClosed += yakuhai.closed;
	}
	
	//Riichi
	//Closed
	var riichi = getRiichi(tenpai);
	yakuOpen += riichi.open;
	yakuClosed += riichi.closed;
	
	//Tanyao
	//Open
	var tanyao = getTanyao(hand, tenpai);
	yakuOpen += tanyao.open;
	yakuClosed += tanyao.closed;
	
	//Pinfu (?)
	//Closed
	var pinfu = getPinfu(triplesAndPairs, doubles, tenpai);
	yakuOpen += pinfu.open;
	yakuClosed += pinfu.closed;
	
	//Iipeikou (Identical Sequences in same type)
	//Closed
	
	//2 Han
	
	//Chiitoitsu
	//7 Pairs
	//Closed
	// -> Not necessary
	
	//Sanankou
	//3 concealed triplets (Open auch ok!)
	//Open*
	
	//Sankantsu - -ater
	//3 Kans
	//Open
	
	//Toitoi
	//All Triplets
	//Open
	
	//Sanshoku Doukou
	//3 same index triplets in all 3 types
	//Open
	
	//Shousangen
	//Little 3 Dragons (2 Triplets + Pair)
	//Open
	
	//Chanta
	//Half outside Hand (including terminals)
	//Open/-1 Han after call
	
	//Honrou
	//All Terminals and Honors (means: Also 4 triplets)
	//Open
	
	//Ittsuu
	//Pure Straight
	//Open/-1 Han after call
	
	//Sanshoku
	//3 same index straights in all types
	//Open/-1 Han after call
	
	//3 Han
	
	//Ryanpeikou
	//2 times identical sequences
	//Closed
	
	//Junchan
	//All Terminals
	//Open/-1 Han after call
	
	//Honitsu
	//Half Flush
	//Open/-1 Han after call
	
	//6 Han
	
	//Chinitsu
	//Full Flush
	//Open/-1 Han after call
	
	//Yakuman
	
	//Big Three Dragons
	//Open
	
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

function getYakuhai(triples) {
	var yakuhai = 0;
	//TODO: Count Honor triples
	yakuhai = triples.filter(tile => tile.type == 3 && (tile.index > 4 || tile.index == seatWind || tile.index == roundWind)).length/3;
	return {open: yakuhai, closed: yakuhai};
}

function getRiichi(tenpai) {
	if(tenpai) {
		return {open: 0, closed: 1};
	}
	return {open: 0, closed: 0};
}

//Should actually check whole hand, but works better with triples/doubles in hand
function getTanyao(hand, tenpai) {
	var tanyao = 0;
	if(hand.filter(tile => tile.type != 3 && tile.index > 1 && tile.index < 9).length >= 13) { //&& tenpai ?)
		tanyao = 1;
	}
	return {open: tanyao, closed: tanyao};
}

function getPinfu(triplesAndPairs, doubles, tenpai) {
	var pinfu = 0;

	if(isClosed && tenpai && parseInt(triplesAndPairs.triples.length/3) == 3 && parseInt(triplesAndPairs.pairs.length/2) == 1 && getPonsInHand(triplesAndPairs.triples).length == 0) { //Should work to detect pinfu
		doubles = sortHand(doubles);
		for(var i = 0; i < doubles.length - 1; i++) {
			if(doubles[i].index > 1 && doubles[i+1].index < 9 && Math.abs(doubles[0].index - doubles[1].index) == 1) {
				pinfu = 1;
				break;
			}
		}
	}
	return {open: 0, closed: pinfu};
}