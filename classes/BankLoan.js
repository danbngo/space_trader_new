class BankLoan {
    constructor(principal = 0, interest = 0, term = 0, startYear = gs.year) {
        this.principal = principal
        this.interest = interest
        this.term = term
        this.startYear = startYear
        this.dueYear = startYear + term
        this.outstandingBalance = this.totalRepayable;
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
}