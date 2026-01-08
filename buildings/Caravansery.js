/**
 * A building where players can take escort missions.
 * @class Caravansery
 * @extends {Building}
 */
class Caravansery extends Building {
    /**
     * @param {Planet} planet - The planet this caravansery is on.
     */
    constructor(planet = new Planet()) {
        super(planet, BUILDING_TYPES.CARAVANSERY)
        this.normalize()
    }
}
