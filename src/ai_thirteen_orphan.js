//################################
// AI Thirteen Orphan
// AI to handle Thirteen Orphan strategy.
//
// TODO: Merge with ai_offense (?)
// (Some may have to be merged into util.js instead?)
//
// TODO: Actual implementation for the AI to use it.
//################################

// PARAMETERS
var thirteen_orphan_set = "19m19p19s1234567z";
var max_missing_orphan_count = 2; // If an orphan has been discarded more than this time (and is not in hand), we don't go for thirteen orphan.
// Ie. 'Red Dragon' is not in hand, but been discarded 3-times on field. We stop going for thirteen orphan.


// Used at the start of a match to see if we can go for thirteen orphansm
function startCanDoThirteenOrphan(){
    var ownTerminalHonors = getAllTerminalHonorFromHand(ownHand)

    // Automatically fails if below min-required length.
    // (Probably can remove this check, as checking after filtering uniques shouldn't take too long either.)
    if (ownTerminalHonors.length < THIRTEEN_ORPHANS){
        return false;
    }

    // Filter out all duplicate terminal/honors
    var uniqueTerminalHonors = ownTerminalHonors.filter(function(t, i) {
        return ownTerminalHonors.indexOf(t) == i;
    });

    // Fails if we do not have enough unique orphans.
    if (uniqueTerminalHonors.length < THIRTEEN_ORPHANS){
        return false;
    }

    return true;
}

// Used during the match to see if its still viable to go for thirteen orphans.
// TODO: Test Cases
function canDoThirteenOrphan(){

    var ownTerminalHonors = getAllTerminalHonorFromHand(ownHand)
    // Filter out all duplicate terminal/honors
    var uniqueTerminalHonors = ownTerminalHonors.filter(function(t, i) {
        return ownTerminalHonors.indexOf(t) == i;
    });

    // Get list of missing orphans.
    var thirteenOrphanTiles = getTilesFromString(thirteen_orphan_set);
    var missingOrphans = thirteenOrphanTiles.filter(function(t) {
        return !uniqueTerminalHonors.includes(t);
      });

    // TODO: Should we check for our own discards, to see if we had discarded an orphan we need? (furiten check)
    // Probably reduntant as we would ideally never discard our own needed tiles. (?)

    // Check if there are enough required orphans in the pool.
    // TODO: Possible optimization?
    var allOrphansDiscards = getAllDiscardsWithOrphans();
    for (var i = 0; i < missingOrphans.length; ++i){
        var discardCount = 0;
        for (var n = 0; n < allOrphansDiscards.length; ++n){
            if (allOrphansDiscards[n] == missingOrphans[i]){
                ++discardCount;
            }

            // Too many of a needed orphan was discarded; No thirteen orphans.
            if (discardCount > max_missing_orphan_count){
                return false;
            }
        }
    }

    return true;
}

// Return all orphan discards
// TODO: Possible optimization?
function getAllDiscardsWithOrphans(){
    var allOrphansDiscards = [];

    for (var i = 0; i < discards.length; ++i){
        for (var n = 0; n < discards[i].length; ++n){

            if (isTerminalOrHonor(discards[i][n])){
                allOrphansDiscards.push(discards[i][n]);
            }
        }
    }

    return allOrphansDiscards;
}

// Returns Tile[], where all is terminal/honors.
function getAllTerminalHonorFromHand(hand){
    var allTerminalHonor = [];
    for (var i = 0; i < hand.length; ++i) { 
        if (isTerminalOrHonor(hand[i])){
            allTerminalHonor.push(hand[i]);
        }
    }
    return allTerminalHonor;
}



function isTerminalOrHonor(tile){
    // Honor tiles
    if (tile.type == 3){
        return true;
    }

    // 1 or 9.
    if (tile.index == 1 || tile.index == 9){
        return true;
    }

    return false;
}