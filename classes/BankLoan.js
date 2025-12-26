/**
 * Represents a bank loan taken by a player.
 * @class BankLoan
 */
class BankLoan {
    /**
     * @param {number} principal - The principal amount of the loan.
     * @param {number} interest - The interest amount on the loan.
     * @param {number} term - The term duration of the loan in years.
     * @param {number} startYear - The year when the loan was taken.
     * @param {Planet} planet - The planet where this loan was taken.
     */
    constructor(principal = 0, interest = 0, term = 0, startYear = gs.year, planet = null) {
        /** @type {number} */
        this.principal = principal
        /** @type {number} */
        this.interest = interest
        /** @type {number} */
        this.term = term
        /** @type {number} */
        this.startYear = startYear
        /** @type {number} */
        this.dueYear = startYear + term
        /** @type {number} */
        this.outstandingBalance = this.totalRepayable;
        /** @type {Planet} */
        this.planet = planet // Track which planet this loan is from
    }
    repay(amount = 0) {
        this.outstandingBalance = Math.max(0, this.outstandingBalance - amount)
    }
    get paidOff() {
        return this.outstandingBalance <= 0
    }
    get overdue() {
        return this.outstandingBalance > 0 && gs.year > this.dueYear
    }
    get totalRepayable() {
        return this.principal + this.interest
    }
    toJSON() {
        // Custom serialization for JSON.stringify
        return {
            principal: this.principal,
            interest: this.interest,
            term: this.term,
            startYear: this.startYear,
            dueYear: this.dueYear,
            outstandingBalance: this.outstandingBalance,
            planet: this.planet?.name || null // Save planet as name string
        }
    }
}