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
        this.level = 1
        this.exists = true;
        //this.normalize() //danmod this causes errors because the extending child class tries to use ITS normalize function instead of the one below
    }
    normalize() {
        const multiplier = this.planet?.objectType?.powerMultiplier ?? 1
        this.credits = Math.round(this.buildingType.baseCredits * this.planet.c.wealth * this.planet.c.inflationRate * multiplier)
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
