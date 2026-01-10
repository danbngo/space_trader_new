/**
 * Travel menu - displays animated space travel to destination using CombatMap
 */
function showTravelMap() {
    if (!gs.destination || gs.travelYearsRemaining === null) {
        console.error('Cannot show travel map: no destination or travel time set')
        showStarMap()
        return
    }

    console.log('Showing travel map to:', gs.destination.name)

    // Create a fake encounter with no enemies (just for the route travel animation)
    const travelEncounter = {
        playerShips: gs.fleet.ships.filter(ship => !ship.disabled),
        enemyShips: [], // No enemies during travel
        endEncounter: () => {
            // When travel completes, check if we arrived
            if (gs.travelYearsRemaining <= 0) {
                console.log('Travel complete, arrived at:', gs.destination?.name)
                showStarMap(gs.destination)
            } else {
                // Should not happen, but fallback to star map
                showStarMap()
            }
        }
    }

    // Create combat map in route travel mode (creates its own canvas and renders stars)
    currentMap = new CombatMap(travelEncounter)
}
