class BankLoan {
    constructor(principal = 0, interest = 0, term = 0, startYear = gs.year) {
        this.principal = principal
        this.interest = interest
        this.term = term
        this.startYear = startYear
        this.dueYear = startYear + term
    }
    get overdue() {
        return gs.year > this.dueYear
    }
    get totalRepayable() {
        return this.principal + this.interest
    }
}