## About The Project

This project is a Mahjong AI for [Mahjong Soul](https://mahjongsoul.game.yo-star.com/) that runs directly in the browser. Everything was written by scratch in native JavaScript without any libraries.
This AI does not use machine learning, but conventional algorithms. Simply said it's simulating some turns (with heuristics to save calculation time) and looking for the best move.

## Getting Started

* Install a browser extension that lets you run custom Javascript like [Custom Style Script](https://addons.mozilla.org/de/firefox/addon/custom-style-script/). The popular Greasemonkey sometimes makes problems, but it should work too.
* Copy the scripts under /src into your browser extension. Make sure that the main class will be loaded last.
* Open [Mahjong Soul](https://mahjongsoul.game.yo-star.com/) (make sure you are logged in already).
* If Autorun is set to true the bot will automatically start games. You can manually start/stop the bot by pressing + on the Numpad.
* Logging is output to the browser console (Ctrl + Shift + J [Chrome] or Ctrl + Shift + K [Firefox])

### Parameters

#### Important Parameters
* AUTORUN: The bot will automatically start games if set to true
* ROOM: The type of game the bot will start. See comment for further information.

#### Other Parameters
* Defense Constants: Constants that modify the defensive playstyle.
* Calls: Constants that modify how often the bot calls for tiles.
* Hand Evaluation Constants: Constants that modify how the value of hands is calculated. Influences if the bot goes for fast or expensive hands.
* Strategy Constants: See Comments
Default values should be ok in most cases.

## Statistics

![Stats](https://i.imgur.com/ii4TmYj.png)
The stats contain many games by older versions of the bot and should be better in the latest version. Maximum ranking was Expert around 1000 points.

![Yakuman](https://i.imgur.com/j6j2f2V.png)

## Tests

The project contains a testclass with simple "Nani Kiru?" testcases.

## Known Problems

- There is a memory leak (in Firefox) that will eat up a few gigabytes of RAM after some hours. You need to manually restart the browser after some time.
- Bot sometimes gets disconnected due to "inactivity". Current workaround is reloading the page, a real solution should fake some mouse activity.