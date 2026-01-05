/**
 * A building where credits can be deposited/withdrawn and loans can be taken.
 * @class Bank
 * @extends {Building}
 */
class Bank extends Building {
    /**
     * @param {Planet} planet - The planet this bank is on.
     * @param {Moon} moon - The moon this building is on (null if on planet surface).
     */
    constructor(planet = new Planet(), moon = null) {
        super(planet, BUILDING_TYPES.BANK, moon)
        /** @type {number} */
        this.playerBalance = 0
    }
    calcDepositPenalty(depositAmount = 0) {
        return Math.ceil( depositAmount * Math.pow(0.01, 1/(1+this.planet.c.corruption)) )
    }
    calcWithdrawalPenalty(withdrawalAmount = 0) {
        return Math.ceil( withdrawalAmount * Math.pow(0.01, 1/(1+this.planet.c.corruption)) )
    }
    calcLoanInterest(loanAmount = 1, loanDuration = 1) {
        console.log('calculating loan interest:', loanAmount, loanDuration)
        return Math.ceil( loanAmount * Math.pow(0.01*loanDuration, 1/(1+this.planet.c.corruption)) )
    }
    calcLoanMaxAmount(officer) {
        let maxLoanAmount = Math.pow(officer.level, 1.5) * 5000 * this.level
        maxLoanAmount += officer.fame.total*10 - officer.infamy.total*10
        maxLoanAmount += this.playerBalance
        maxLoanAmount -= officer.bounty.total
        maxLoanAmount -= officer.calcTotalDebts()
        return Math.floor(maxLoanAmount)
    }
}
