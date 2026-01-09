/**
 * Handles rendering and updating of fleets on the star map
 * NOTE: Currently minimal as AI fleets were removed from the game
 */
class StarMapFleetsHandler {
    /**
     * @param {StarMap} starMap - Reference to the parent StarMap instance
     */
    constructor(starMap) {
        this.starMap = starMap
        this.cvs = starMap.cvs
        this.starSystem = starMap.starSystem
    }

    handleAll() {
        // No fleet rendering needed - player location is highlighted on planets/stations instead
    }
}

