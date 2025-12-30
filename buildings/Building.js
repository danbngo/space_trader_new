/**
 * Base class for all buildings on a planet.
 * @class Building
 */
class Building {
    /**
     * @param {Planet} planet - The planet this building is on.
     * @param {BuildingType} buildingType - The type of building.
     */
    constructor(planet = new Planet(), buildingType = BUILDING_TYPES_ALL[0]) {
        /** @type {Planet} */
        this.planet = planet
        /** @type {BuildingType} */
        this.buildingType = buildingType
        /** @type {number} */
        this.credits = 1
        /** @type {boolean} */
        this.enabled = true
        this.normalize()
    }
    normalize() {
        this.credits = this.buildingType.baseCredits * this.planet.civilization.wealth * this.planet.civilization.inflation
    }
    get rake() {
        const corruption = this.planet.civilization.corruption
        const barterSkill = gs.fleet.totalSkills.getAmount(SKILLS.Barter)
        return corruption / (1 + barterSkill / 50)
    }
}
