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

> `getTileDoraValue(Tile)` includes both the current tile's dora, and the current game's Dora into calculation.<br/>
> Check in `utils.js` for the function.

Check [Suits](#suits) section to determine the `type`.

# Tile-String (Mostly for logging)
Tiles as Strings comes in this format: `{Number}{Suit}`.

## [Suits](#suits)

`m` - Money (Man, 萬子). `0` for `type` property in Tile object. <br/>
`p` - Drums (Pin, 筒). The circle tiles. `1` for `type`.<br/>
`s` - Bamboo (Sō, 索子). `2` for `type`.

**Red Fives** - Red fives have a `!` between the prefix and number.
> Example: `5!s` is a 5-Red Bamboo.
However, in hand-evaluation for calls, Red-Fives will become index 0. `0s` would represent a 5-Red Bamboo in an Open-Call

### Honor Tiles
All Honor tiles begins with a `z`. `3` for `type` property in Tile object.

`1z` - East (ton, 東).<br/>
`2z` - South (Nan, 南).<br/>
`3z` - West (Shā, 西).<br/>
`4z` - North (Pei, 北)<br/>
`5z` - White Dragon. The blank-tile.<br/>
`6z` - Green Dragon (hatsu, 發).<br/>
`7z` - Red Dragon (chun, 中).

## Hand Evaluation
When evaluting entire hand, everything will be shortened where possible.

*Example:* `27m 79p 3345!679s 35z 1s`.<br/>
![27m 79p 3345!679s 35z 1s](./hand-evalution-example.png?raw=true "Hand Evaluation Image for 27m 79p 3345!679s 35z 1s")

**Open Hands**<br/>
Same concept as above, but Red-Fives will become index 0.<br/>
The hand will be reversed too, reading from right-to-left.

*Example:* `055m 555p`.<br/>
![055m 555p](./open-hand-example.png?raw=true "Open Hand Image for 055m 555p")