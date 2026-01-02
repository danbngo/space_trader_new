/**
 * Base class for all buildings on a planet.
 * @class Building
 */
class Building {
    /**
     * @param {Planet | DwarfPlanet | SpaceStation} planet - The planet this building is on.
     * @param {BuildingType} buildingType - The type of building.
     * @param {Moon} moon - The moon this building is on (null if on planet surface).
     */
    constructor(planet = new Planet(), buildingType = BUILDING_TYPES_ALL[0], moon = null) {
        /** @type {Planet | DwarfPlanet | SpaceStation} */
        this.planet = planet
        /** @type {BuildingType} */
        this.buildingType = buildingType
        /** @type {Moon} */
        this.moon = moon
        /** @type {number} */
        this.credits = 1
        this.level = 1
        this.permitted = true;
        //this.normalize() //danmod this causes errors because the extending child class tries to use ITS normalize function instead of the one below
    }
    normalize() {
        this.credits = Math.round(this.buildingType.baseCredits * this.planet.c.wealth * this.planet.c.inflation)
    }
    get rake() {
        const corruption = this.planet.c.corruption
        const barterSkill = gs.fleet.totalSkills.getAmount(SKILLS.Barter)
        return corruption / (1 + barterSkill / 50)
    }
    get damaged() {
        return this.level <= 0
    }
}
