/**
 * A building for religious and spiritual activities.
 * @class Temple
 * @extends {Building}
 */
class Temple extends Building {
    /**
     * @param {Planet | DwarfPlanet | SpaceStation} planet - The planet this temple is on.
     * @param {Moon} moon - The moon this building is on (null if on planet surface).
     */
    constructor(planet = new Planet(), moon = null) {
        super(planet, BUILDING_TYPES.TEMPLE, moon)
        this.normalize()
    }
}
