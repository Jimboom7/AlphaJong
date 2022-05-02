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
	let chuurenpoutou = getChuurenPoutou(hand, triplets, sequences);
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
function getChuurenPoutou(hand, triplets, sequences) {
	if (hand.find(tile => tile.type != hand[0].type)) {
		return { open: 0, closed: 0 };
	}

	let crtIdx = 1;
	let red_five = false;

	if (hand[0].index === 0) {
		red_five = true;
	}

	for (let idx = red_five ? 1 : 0; idx < hand.length; idx++) {
		if (hand[idx].index === crtIdx + 1) {
			crtIdx++;
		} else if (hand[idx].index === 6 && crtIdx === 4 && red_five) { // red five?
			crtIdx = 6;
		}
	}

	if (crtIdx != 9) {
		return { open: 0, closed: 0 };
	}

	if (parseInt(triplets.length / 3) === 1 && parseInt(sequences.length / 3) === 3) {
		return { open: YAKUMAN_SCORE, closed: YAKUMAN_SCORE };
	}

	return { open: 0, closed: 0 };
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