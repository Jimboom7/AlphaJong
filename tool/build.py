#!/usr/bin/env python3

import os


src_dir = "src"
build_dir = "build"

src_files = [
    'parameters.js',
    'gui.js',
    'api.js',
    'utils.js',
    'logging.js',
    'yaku.js',
    'ai_offense.js',
    'ai_defense.js',
    'main.js',
]

version = "1.2.1"
author = "Jimboom7"

header = f"""// ==UserScript==
// @name         AlphaJong
// @namespace    alphajong
// @version      {version}
// @description  A Mahjong Soul Bot.
// @author       {author}
// @match        https://mahjongsoul.game.yo-star.com/*
// @match        https://majsoul.com/*
// @match        https://game.maj-soul.com/*
// @match        https://majsoul.union-game.com/*
// @match        https://game.mahjongsoul.com/*
// ==/UserScript==
"""


def main():
    ret = [header]
    for file in src_files:
        with open(os.path.join(src_dir, file), 'r') as f:
            ret.append(f.read())

    output = "\n".join(ret)
    output_name = os.path.join(build_dir, f"AlphaJong_{version}.user.js")
    with open(output_name, "w") as f:
        f.write(output)

    print(f'build finish >> {output_name}')


if __name__ == "__main__":
    main()
