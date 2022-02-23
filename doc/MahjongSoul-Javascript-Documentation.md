# Mahjong Soul Javascript Documentation
An overview of useful objects, functions and variables in the Mahjong Soul Sourcecode.  
This does by no means cover everything, it's just some stuff that seems interesting and is/can be used by AlphaJong.  

## view.DesktopMgr
Contains data related to the game that is currently ongoing.  
**Careful:** Can be null if no match was started yet, or can contain old data after a game is finished.  
Is a singleton, view.DesktopMgr.Inst is usually what you want to access.  

### Useful Data
**view.DesktopMgr.Inst.oplist** - List of operations available for the player (call a pon etc.). The datapoint "combination" contains the combination of tiles for the call(multiple are possible).  mjcore.E_PlayOperation contains all operations with their IDs, see "Others" for more info.  
**view.DesktopMgr.Inst.dora** - Dora indicator.  
**view.DesktopMgr.Inst.players[number]** - Data of the players. 0 is the player himself. Contains lots of data, .hand for example are the tiles in the hand (unknown for other players), .container_qipai the discards and .container_ming.pais the called tiles, .score the Score.  
**view.DesktopMgr.Inst.left_tile_count** - Amount of tiles left.  
**view.DesktopMgr.Inst.localPosition2Seat(player)** - A function to convert the local position to the seat. Opposite: view.DesktopMgr.Inst.seat2LocalPosition(playerSeat);  
**view.DesktopMgr.Inst.index_player** The current player number.  
**view.DesktopMgr.Inst.index_ju** - Own Wind.  
**view.DesktopMgr.Inst.index_change** - The Round Wind.  
**view.DesktopMgr.Inst.index_ben** - Number of repetitions of this round.  
**view.DesktopMgr.Inst.index_player** - The player whose turn it is.  
**view.DesktopMgr.Inst.setAutoHule(bool)** - Auto Ron/Tsumo.  
**view.DesktopMgr.Inst.setAutoNoFulu(bool)** - Auto no calls.  
**view.DesktopMgr.Inst.lastqipai** - Last thrown tile (can be available for call).  
**view.DesktopMgr.Inst.players[0]._choose_pai** - Tile chosen for discard.  
**view.DesktopMgr.Inst.players[0].DoDiscardTile()** - discard tile.  
**view.DesktopMgr.player_link_state[playerSear]** - Shows disconnects.  
**view.DesktopMgr.Inst.gameEndResult** - Has data when game is over.  
**view.DesktopMgr.Inst.players[playerNumber].liqibang._activeInHierarchy** - check player is riichi  
**return view.DesktopMgr.Inst.game_config.mode.mode** Gamemode: 1 = East Round, 2 = South Round  


## GameMgr.Inst
Contains data of everything that is not related to the ongoing game, like player data or connection status.  
Is a singleton, GameMgr.Inst is usually what you want to access.  

### Useful Data
**GameMgr.Inst.clientHeatBeat()** - Function to send a Heatbeat (afk detection).  
**GameMgr.Inst._last_heatbeat_time** - Timestamp of the last heatbeat.  
**GameMgr.Inst.login_loading_end** - Is true after the game has finished the initial loading, false otherwise.  


## uiscript
Contains data of UI elements. Although the name suggests otherwise, this does not only contain pure visual UI functions.  
uiscript contains lots of different UI elements which are again singletons. They will still exist even after they are closed (enabled is set to false then; usually they can be closed with Inst.close() and Inst.show()), but the initialization might occur later (e.g. starting an actual match).  

### Useful Data
**uiscript.UI_Hangup_Warn.Inst** - AFK warning window  
**uiscript.UI_PiPeiYuYue.Inst** - "Searching for Match" window  
**uiscript.UI_PiPeiYuYue.Inst.addMatch(ROOM)** - Start search for a new match in ROOM.  
**uiscript.UI_Character_Emo** - Maybe emotes? Not sure yet.  
**uiscript.UI_GameEnd** - Game End Screen  
**uiscript.UI_Lobby.Inst.setPage(page)** - Switch Pages in the Lobby  
**uiscript.UI_Lobby.Inst.page_east_north.show(level)** - Show page for Ranked Matches (Parameter is 1 for bronze, 2 for silver etc.)  
**uiscript.UI_Lobby.Inst.page_east_north.btns[0]** - Buttons in the ranked menu (might be useful to click them, but idk how)  
**uiscript.UI_Lobby.Inst.page0.onDisable(0)** - Close main menu  
**uiscript.UI_Lobby.Inst.me.in.play(speed, loop)** - Play animation for character appearing in the main lobby (out() for disappearing).  
**uiscript.UI_Lobby.Inst.say("lobby_playerlogin")** - Let character in the main lobby say something (only existing texts work)  
**uiscript.UI_Hanguplogout.Inst** - When disconnected.  


## app.NetAgent
Can be used to directly communicate with the server.  
Generally: **app.NetAgent.sendReq2MJ(type, command, data)** - sends a requests to the server.  

### Useful Data
**app.NetAgent.sendReq2MJ('FastTest', 'inputChiPengGang', {type: mjcore.E_PlayOperation, index: 0, timeuse: 2});** - Makes a call for a tile. For more functions search in the code of the game.  
**app.NetAgent.sendReq2MJ('FastTest', 'inputChiPengGang', {type: this.choosed_op, index: t})** - "Detailed" call  
**app.NetAgent.sendReq2MJ('FastTest', 'inputChiPengGang', {cancel_operation: true, timeuse = 2})** - Cancel  
**app.NetAgent.sendReq2MJ('FastTest', 'confirmNewRound', {})** - New Round  
**app.NetAgent.sendReq2Lobby('Lobby', 'matchGame', {match_mode: X, client_version_string: GameMgr.Inst.getClientVersion()})** - Search for game  
**app.NetAgent.sendReq2Lobby('Lobby', 'heatbeat', {no_operation_counter: 0})** -  Send a heatbeat (to prevent kick for afk)  


## Others
**game.Tools.strOfLocalization(number)** - Localized Strings. Might be useful to scan all these to find specific functions in the code(?)  
**tile.toString()** -Convert a tile to a string (For example "4z").  
**cfg.desktop.matchmode.get(ROOM_ID)** - More information about the Rooms  

### Operation Data
For calls etc. The operation "names" and IDs are in this variable: **mjcore.E_PlayOperation**  
0: "none"  
1: "dapai"  
2: "eat" -> CHI  
3: "peng" -> PON  
4: "an_gang" -> KAN (Ankan)  
5: "ming_gang" -> KAN (Daiminkan)  
6: "add_gang" -> KAN (Shouminkan)  
7: "liqi" -> RIICHI  
8: "zimo" _> TSUMO  
9: "rong" -> RON  
10: "jiuzhongjiupai" -> ???  
11: "babei" -> KITA  

### Laya
Laya is the engine used by Mahjong Soul. The documentation can be found here: [Documentation (layabox.com)](http://layaair.ldc.layabox.com/api/English/). Not sure if this is of any use, AlphaJong doesn't touch this at the moment.