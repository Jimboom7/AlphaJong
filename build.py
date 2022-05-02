def addFileToString(inputString, filename):
    inputString += "\n\n"
    
    with open('src/' + filename) as fp:
        inputString += fp.read()
        
    return inputString
    
VERSION = "1.3.0-experimental"

data = "// ==UserScript==\n// @name         AlphaJong\n// @namespace    alphajong\n// @version      " + VERSION + "\n// @description  A Mahjong Soul Bot.\n// @author       Jimboom7\n// @match        https://mahjongsoul.game.yo-star.com/*\n// @match        https://majsoul.com/*\n// @match        https://game.maj-soul.com/*\n// @match        https://majsoul.union-game.com/*\n// @match        https://game.mahjongsoul.com/*\n// ==/UserScript=="

data = addFileToString(data, "parameters.js")
data = addFileToString(data, "gui.js")
data = addFileToString(data, "api.js")
data = addFileToString(data, "utils.js")
data = addFileToString(data, "logging.js")
data = addFileToString(data, "yaku.js")
data = addFileToString(data, "ai_offense.js")
data = addFileToString(data, "ai_defense.js")
data = addFileToString(data, "main.js")
      
with open ('build/AlphaJong_' + VERSION + '.user.js', 'w') as fp:
    fp.write(data)