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
        this.normalize()
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
        maxLoanAmount += officer.reputation.total*10
        maxLoanAmount += this.playerBalance
        maxLoanAmount -= officer.bounty.total
        maxLoanAmount -= officer.calcTotalDebts()
        // Cap the max loan by the bank's available credits
        maxLoanAmount = Math.min(maxLoanAmount, this.credits)
        return Math.floor(maxLoanAmount)
    }
}
