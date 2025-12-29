/**
 * A building where bounties can be paid off.
 * @class Courthouse
 * @extends {Building}
 */
class Courthouse extends Building {
    /**
     * @param {Planet} planet - The planet this courthouse is on.
     */
    constructor(planet = new Planet()) {
        super(planet, BUILDING_TYPES.COURTHOUSE)
    }
    calcPayBountyPenalty(bountyAmount = 0) {
        return Math.ceil( bountyAmount * Math.pow(0.01, 1/(1+this.planet.civilization.corruption)) )
    }
}
