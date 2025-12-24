class BankLoan {
    constructor(principal = 0, interest = 0, term = 0, startYear = gs.year, planet = null) {
        this.principal = principal
        this.interest = interest
        this.term = term
        this.startYear = startYear
        this.dueYear = startYear + term
        this.outstandingBalance = this.totalRepayable;
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