## About The Project

This project is a Mahjong AI for [Mahjong Soul](https://mahjongsoul.game.yo-star.com/) that runs directly in any browser. Everything was written from scratch in native JavaScript without any libraries.  
The AI does not use machine learning, but conventional algorithms. Simply said it's simulating some turns and looking for the best move.  
Compatible with both 3 and 4 player mode.  
[日本語のリードミーはこちら.](./readme_jp.md)  
[中文自述在这里.](./readme_cn.md)  

## Getting Started

* Install a browser extension that lets you run userscripts, like [Tampermonkey](https://www.tampermonkey.net/).
* Grab the latest [release of this project](https://github.com/Jimboom7/AlphaJong/releases) and install it in your browser extension. (For Tampermonkey you can enter the download url at utilities -> Install from URL).
* Open [Mahjong Soul](https://mahjongsoul.game.yo-star.com/) (make sure you are logged in already).
* Go into a game and click "Start Bot" in the GUI at the top.
* You can check "Autostart" to let the bot automatically start new games.
* Detailed logging is output to the browser console ([F12] in most browsers)

### How to avoid bans

There is a high risk of getting banned when using this script without further preparation. Fortunately [the MajSoul Mod Plus project on GitHub](https://github.com/Avenshy/majsoul_mod_plus) is offering a way to avoid bans. They provide a "safe code" file which is the same as the official code of the game but the cheat detection is disabled. Here is how you can use it:  
1. Install the [Header Editor](https://he.firefoxcn.net/en/) plugin.
2. Open the plugin and go to the `Export and Import` tab.
3. Fill in `https://cdn.jsdelivr.net/gh/Avenshy/majsoul_mod_plus/header%20editor.json` as Download Rule and press the Download button on the right.
4. Pick `Suggested Group` and click save.
5. **Make sure that Tampermonkey is turned off** and open the Mahjong Soul game webpage.
6. Clear your browser cache (see image below). Press F12 to open the browser console and go to the `Application` tab. Choose `Storage` and tick the box `Cache storage`. Then click the button `Clear site data`.
7. Refresh (F5) the webpage and check the browser console output. At the top it should display "CODE.JS替换成功！", which means the code was successfully replaced.
8. You can now turn on Tampermonkey and use this bot without getting banned.

![clear_cache](https://raw.githubusercontent.com/Jimboom7/AlphaJong/master/doc/img/clear_cache.png)

**Note**: When the game updates to a new version and the safe code doesn't work anymore, first try cleaning the cache again (as seen in the image above). If that doesn't work the safe code needs to be updated:
1. Check if the [safe_code.js file on MajSoul Mod Plus](https://github.com/Avenshy/majsoul_mod_plus) has been updated for the new version yet.
2. If it has been updated click this link: [jsdelivr_purge_cache](https://purge.jsdelivr.net/gh/Avenshy/majsoul_mod_plus/safe_code.js) to refresh the code. If you see `"status": "finished"` it was successfull.
3. Open Mahjong Soul, clear your browser cache and refresh the page.

If you have problems with the above steps please try opening an issue on [MajSoul Mod Plus](https://github.com/Avenshy/majsoul_mod_plus).

### GUI
![GUI](./doc/img/gui.png)
There is a very simple GUI to control the Bot.  
* Left Button: Start or Stop the Bot.
* ComboBox: AI mode, there are two AI modes.
  * AUTO: which automatically helps the player to operate
  * HELP: only gives hints and does not operate
* Checkbox: Enable Autorun mode. The bot will automatically reload the site and search for a new game after the previous one is finished. The Room can be chosen in the ComboBox next to it.
* Output Field: Simple Logging what the bot is currently doing or waiting for.
* Right Button: Hide the GUI. You can re-show it by pressing + on the Numpad.

### Parameters
The default parameters are usually fine. If you want to modify the behaviour of the bot (e.g. more aggressive playstyle) you can change some constants at the top of the script:

* Performance Mode: Decides how accurate and fast the bot will play. 0 is the fastest mode with low accuracy, 4 is the slowest mode with high accuracy.
* Defense Constants: Constants that modify the defensive playstyle.
* Calls: Constants that modify how often the bot calls for tiles.
* Hand Evaluation Constants: Constants that modify how the value of hands is calculated. Influences if the bot goes for fast or expensive hands.
* Strategy Constants: See Comments

## Statistics

![Stats](https://i.imgur.com/30p4yAN.png)

The bot is able to reach Master rank.

![Yakuman](https://i.imgur.com/j6j2f2V.png)

## Tests

The project contains a testclass with simple "Nani Kiru?" testcases.

## Known Problems

- While the game does not need focus (=you can use other programs while the bot is running), it's not possible to have it in the background. That means if the browser is minimized or you switch to another tab for a while you will get disconnected for AFK. Most modern browsers also check if the window is hidden behind other windows and will drastically reduce the performance then. This behavior can be turned off in the settings, if needed you can set `chrome://flags/#calculate-native-win-occlusion` to disabled (Chrome) or go to `about:config` in Firefox and set `widget.windows.window_occlusion_tracking.enabled` to false.
   - When there is a disconnection the bot will try to solve it by reloading the page.
- If the bot is not able to play fast enough try lowering the Performance Mode (see parameters) or use a different browser (Firefox seems to be fastest).

## Disclaimer

Bots are a violation of Mahjong Soul's Terms of Service. Using this bot is on your own risk and the creator is not responsible for your actions.