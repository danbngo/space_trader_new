/**
 * Base class for all buildings on a planet.
 * @class Building
 */
class Building {
    /**
     * @param {Planet} planet - The planet this building is on.
     * @param {BuildingType} buildingType - The type of building.
     * @param {number} baseRake - The base commission/fee percentage for transactions.
     * @param {number} credits - The credits available at this building.
     */
    constructor(planet = new Planet(), buildingType = BUILDING_TYPES_ALL[0], baseRake = 1, credits = 0) {
        /** @type {Planet} */
        this.planet = planet
        /** @type {BuildingType} */
        this.buildingType = buildingType
        /** @type {number} */
        this.baseRake = baseRake
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
        console.log('Calculating rake for building on planet', this.planet.name,'with baseRake', this.baseRake,'and player barter skill', gs.fleet.totalSkills.getAmount(SKILLS.Barter),'skills:',gs.fleet.totalSkills)
        return this.baseRake/(1 + gs.fleet.totalSkills.getAmount(SKILLS.Barter)/50)
    }
}
