#!/usr/bin/env python3
#-*-coding:utf-8-*-

import os

def addFileToString(inputString, filename):
    inputString += "\n\n"
    
    with open('src/' + filename, encoding="utf-8") as fp:
        inputString += fp.read()
        
    return inputString
    
VERSION = "1.3.2_beta"

data = f"""// ==UserScript==
// @name         AlphaJong
// @namespace    alphajong
// @version      {VERSION}
// @description  A Mahjong Soul Bot.
// @author       Jimboom7
// @match        https://mahjongsoul.game.yo-star.com/*
// @match        https://majsoul.com/*
// @match        https://game.maj-soul.com/*
// @match        https://game.maj-soul.net/*
// @match        https://majsoul.union-game.com/*
// @match        https://game.mahjongsoul.com/*
// ==/UserScript==
"""

def main():
    global data

    if not os.path.exists("build"):
        os.mkdir("build")

    data = addFileToString(data, "parameters.js")
    data = addFileToString(data, "gui.js")
    data = addFileToString(data, "api.js")
    data = addFileToString(data, "utils.js")
    data = addFileToString(data, "logging.js")
    data = addFileToString(data, "yaku.js")
    data = addFileToString(data, "ai_offense.js")
    data = addFileToString(data, "ai_defense.js")
    data = addFileToString(data, "main.js")
        
    with open ('build/AlphaJong_' + VERSION + '.user.js', 'w', encoding="utf-8") as fp:
        fp.write(data)

if __name__ == "__main__":
    main()
