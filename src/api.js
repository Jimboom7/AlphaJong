//################################
// API (MAHJONG SOUL)
//################################

function getOperationList() {
	return view.DesktopMgr.Inst.oplist;
}

function getOperations() {
	return mjcore.E_PlayOperation;
}

function getDora() {
	return view.DesktopMgr.Inst.dora;
}

function getPlayerHand() {
	return view.DesktopMgr.Inst.players[0].hand;
}

function getDiscardsOfPlayer(player) {
	return view.DesktopMgr.Inst.players[player].container_qipai;
}

function getCallsOfPlayer(player) {
	return view.DesktopMgr.Inst.players[player].container_ming.pais;
}

function getTilesLeft() {
	return view.DesktopMgr.Inst.left_tile_count;
}

function localPosition2Seat(player) {
	return view.DesktopMgr.Inst.localPosition2Seat(player);
}

function getSeatWind(player) {
	return ((4 + localPosition2Seat(player) - view.DesktopMgr.Inst.index_ju) % 4) + 1
}

function getRoundWind() {
	return view.DesktopMgr.Inst.index_change + 1;
}

function setAutoCallWin(win) {
	view.DesktopMgr.Inst.setAutoHule(win);
	//view.DesktopMgr.Inst.setAutoNoFulu(true) //Auto No Chi/Pon/Kan
}

function getTileForCall() {
	var tile = view.DesktopMgr.Inst.lastqipai.val;
	tile.doraValue = getTileDoraValue(tile);
	return tile;
}

function makeCall(type) {
	app.NetAgent.sendReq2MJ('FastTest', 'inputChiPengGang', {type: type, index: 0, timeuse: 2});
}

function declineCall() {
	app.NetAgent.sendReq2MJ('FastTest', 'inputChiPengGang', {cancel_operation: true, timeuse: 2});
}

function sendRiichiCall(tile) {
	app.NetAgent.sendReq2MJ('FastTest', 'inputOperation', {type: mjcore.E_PlayOperation.liqi, tile: tile, moqie: false, timeuse: 2}); //Moqie: Throwing last drawn tile (Riichi -> false)
}

function callDiscard(tile) {
	view.DesktopMgr.Inst.players[0]._choose_pai = tile;
	view.DesktopMgr.Inst.players[0].DoDiscardTile();
}

function getPlayerLinkState(player) {
	return view.DesktopMgr.player_link_state[localPosition2Seat(player)];
}

function getNumberOfPlayerHand(player) {
	return view.DesktopMgr.Inst.players[player].hand.length;
}

function isEndscreenShown() {
	return view.DesktopMgr.Inst.gameEndResult != null;
}

function isDisconnect() {
	return uiscript.UI_Hanguplogout.Inst != null && uiscript.UI_Hanguplogout.Inst._me.visible;
}

function isPlayerRiichi(player) { //Problem: Does not detect Riichi when it was just called by the previous player (Stick not visible yet)
	return view.DesktopMgr.Inst.players[player].liqibang._activeInHierarchy || getDiscardsOfPlayer(player).last_is_liqi;
}