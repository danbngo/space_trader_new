/**
 * Base class for all buildings on a planet.
 * @class Building
 */
class Building {
    /**
     * @param {Planet} planet - The planet this building is on.
     * @param {BuildingType} buildingType - The type of building.
     * @param {Moon} moon - The moon this building is on (null if on planet surface).
     */
    constructor(planet = new Planet(), buildingType = BUILDING_TYPES_ALL[0], moon = null) {
        /** @type {Planet} */
        this.planet = planet
        /** @type {BuildingType} */
        this.buildingType = buildingType
        /** @type {Moon} */
        this.moon = moon
        /** @type {number} */
        this.credits = 1
        /** @type {boolean} */
        this.enabled = true
        this.normalize()
    }
    normalize() {
        this.credits = this.buildingType.baseCredits * this.planet.c.wealth * this.planet.c.inflation
    }
    get rake() {
        const corruption = this.planet.c.corruption
        const barterSkill = gs.fleet.totalSkills.getAmount(SKILLS.Barter)
        return corruption / (1 + barterSkill / 50)
    }
}
