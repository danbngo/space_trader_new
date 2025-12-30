/**
 * A building where bounties can be paid off.
 * @class Courthouse
 * @extends {Building}
 */
class Courthouse extends Building {
    /**
     * @param {Planet} planet - The planet this courthouse is on.
     * @param {Moon} moon - The moon this building is on (null if on planet surface).
     */
    constructor(planet = new Planet(), moon = null) {
        super(planet, BUILDING_TYPES.COURTHOUSE, moon)
    }
    calcPayBountyPenalty(bountyAmount = 0) {
        //higher corruption = EASIER to pay off bounties.
        //maybe examine logic for this later. it might make more sense for player to have to pay a fraction of his total bounty
        //OR, if you're caught with a bounty you pay it PLUS do jailtime.
        return Math.ceil( bountyAmount * this.planet.c.inflation * Math.pow(0.01, 1+this.planet.c.corruption) )
    }
}
