/**
 * A building for religious and spiritual activities.
 * @class Temple
 * @extends {Building}
 */
class Temple extends Building {
    /**
     * @param {Planet} planet - The planet this temple is on.
     * @param {Moon} moon - The moon this building is on (null if on planet surface).
     */
    constructor(planet = new Planet(), moon = null) {
        super(planet, BUILDING_TYPES.TEMPLE, moon)
        this.normalize()
    }
    
    /**
     * Calculate the cost to tithe based on captain's level.
     * @param {Officer} captain - The captain tithing.
     * @returns {number} The cost in credits.
     */
    calcTitheCost(captain = new Officer()) {
        return Math.round(Math.pow(captain.level, 1.5) * 100);
    }
}
