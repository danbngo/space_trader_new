/**
 * A building for religious and spiritual activities.
 * @class Temple
 * @extends {Building}
 */
class Temple extends Building {
    /**
     * @param {Planet} planet - The planet this temple is on.
     */
    constructor(planet = new Planet()) {
        super(planet, BUILDING_TYPES.TEMPLE)
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
