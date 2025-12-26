/**
 * A building where bounties can be paid off.
 * @class Courthouse
 * @extends {Building}
 */
class Courthouse extends Building {
    /**
     * @param {Planet} planet - The planet this courthouse is on.
     * @param {number} baseRake - The base commission percentage.
     */
    constructor(planet = new Planet(), baseRake = 1) {
        super(planet, BUILDING_TYPES.COURTHOUSE, baseRake)
    }
    calcPayBountyPenalty(bountyAmount = 0) {
        return Math.ceil( bountyAmount * Math.pow(0.01, 1/(1+this.rake)) )
    }
}
