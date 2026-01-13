/**
 * A building where credits can be deposited/withdrawn and loans can be taken.
 * @class Bank
 * @extends {Building}
 */
class Bank extends Building {
    /**
     * @param {Planet} planet - The planet this bank is on.
     */
    constructor(planet = new Planet()) {
        super(planet, BUILDING_TYPES.BANK)
        /** @type {number} */
        this.playerBalance = 0
    }
    calcDepositPenalty(depositAmount = 0) {
        return Math.ceil( depositAmount * Math.pow(0.01, 1/(1+this.planet.c.corruption)) )
    }
    calcWithdrawalPenalty(withdrawalAmount = 0) {
        return Math.ceil( withdrawalAmount * Math.pow(0.01, 1/(1+this.planet.c.corruption)) )
    }
}
