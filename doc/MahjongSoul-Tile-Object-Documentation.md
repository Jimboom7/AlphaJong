# MahjongSoul Tile Object Documentation
Contains details about Tile object, and Tile as a String for logging purposes.

# Tile Object

Currently, the `Tile` object looks something like this:
```
{
	index: Int, // The number on this tile.
	type: Int, // The Suit of this tile.
	dora: Boolean, // If this tile is a Red-Five or not.
	doraValue: getTileDoraValue(Tile)
}
```

> Index, type and dora are set by the game itself, doraValue is additionally calculated by AlphaJong.<br/>
> `getTileDoraValue(Tile)` includes both the current tile's (red) dora, and the current game's Dora into calculation. Check in `utils.js` for the function.<br/>

Check [Suits](#suits) section to determine the `type`.

# Tile-String (Mostly for logging)
Tiles as Strings comes in this format: `{Number}{Suit}`.

## [Suits](#suits)

`m` - Money (Man, 萬子). `0` for `type` property in Tile object. <br/>
`p` - Drums (Pin, 筒). The circle tiles. `1` for `type`.<br/>
`s` - Bamboo (Sō, 索子). `2` for `type`.

### Red Fives
Have the number 0.
> Example: `0s` is a 5-Red Bamboo.

### Honor Tiles
All Honor tiles have the character `z`. `3` for `type` property in Tile object.

`1z` - East (ton, 東).<br/>
`2z` - South (Nan, 南).<br/>
`3z` - West (Shā, 西).<br/>
`4z` - North (Pei, 北)<br/>
`5z` - White Dragon. The blank-tile.<br/>
`6z` - Green Dragon (hatsu, 發).<br/>
`7z` - Red Dragon (chun, 中).

## Logging of multiple tiles
When logging multiple tiles the string will be shortened according to the sorting. Tiles of the same suit that follow each only display their number.

*Example:* `27m 79p 0334679s 35z 1s`.<br/>
![27m 79p 0334579s 35z 1s](./img/hand-evalution-example.png?raw=true "Hand Evaluation Image for 27m 79p 0334679s 35z 1s")

*Example:* `055m 555p`.<br/>
![055m 555p](./img/open-hand-example.png?raw=true "Open Hand Image for 055m 555p")