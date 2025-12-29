/**
 * A building where credits can be deposited/withdrawn and loans can be taken.
 * @class Bank
 * @extends {Building}
 */
class Bank extends Building {
    static playerBalance = 0 //might need to improve this later if like..multiplayer becomes a thing

    /**
     * @param {Planet} planet - The planet this bank is on.
     * @param {number} credits - The credits available at this bank.
     */
    constructor(planet = new Planet(), credits = 0) {
        super(planet, BUILDING_TYPES.BANK, credits)
    }
    calcDepositPenalty(depositAmount = 0) {
        return Math.ceil( depositAmount * Math.pow(0.01, 1/(1+this.planet.civilization.corruption)) )
    }
    calcWithdrawalPenalty(withdrawalAmount = 0) {
        return Math.ceil( withdrawalAmount * Math.pow(0.01, 1/(1+this.planet.civilization.corruption)) )
    }
    calcLoanInterest(loanAmount = 1, loanDuration = 1) {
        console.log('calculating loan interest:', loanAmount, loanDuration)
        return Math.ceil( loanAmount * Math.pow(0.01*loanDuration, 1/(1+this.planet.civilization.corruption)) )
    }
    calcLoanMaxAmount(officer = new Officer()) {
        let maxLoanAmount = Math.pow(officer.level, 1.5) * 5000
        maxLoanAmount += officer.fame.total*10 - officer.infamy.total*10
        maxLoanAmount += Bank.playerBalance
        maxLoanAmount -= officer.bounty.total
        maxLoanAmount -= officer.calcTotalDebts()
        return Math.floor(maxLoanAmount)
    }
}
