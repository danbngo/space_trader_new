/**
 * Base class for all buildings on a planet.
 * @class Building
 */
class Building {
    /**
     * @param {Planet} planet - The planet this building is on.
     * @param {BuildingType} buildingType - The type of building.
     * @param {number} credits - The credits available at this building.
     */
    constructor(planet = new Planet(), buildingType = BUILDING_TYPES_ALL[0], credits = 0) {
        /** @type {Planet} */
        this.planet = planet
        /** @type {BuildingType} */
        this.buildingType = buildingType
        /** @type {number} */
        this.credits = credits
        /** @type {number} */
        this.baseCredits = credits //gradually revert back towards this amount over time
        /** @type {boolean} */
        this.enabled = true
    }
    normalize() {
        this.credits = this.baseCredits
    }
    get rake() {
        const corruption = this.planet.civilization.corruption
        const barterSkill = gs.fleet.totalSkills.getAmount(SKILLS.Barter)
        return corruption / (1 + barterSkill / 50)
    }
}
