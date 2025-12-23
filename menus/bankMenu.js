function createBankLoansTable(loans = [new BankLoan()], onSelectLoan = (loan = new BankLoan())=>{}) {
    if (loans.length == 0) return `(None)`
    /** @type {Array<Array<string|number|HTMLElement>>} */
    const rows = [
        ['Due Date', 'Term', 'Outstanding Balance', 'Total Repayable', 'Principal', 'Interest']
    ]
    for (const loan of loans) {
        rows.push([
            colorSpan(describeDate(loan.dueYear), gs.year >= loan.dueYear ? 'red' : ''),
            describeTimespan(loan.term),
            statColorSpan(loan.outstandingBalance, loan.outstandingBalance/loan.totalRepayable),
            loan.totalRepayable,
            loan.principal,
            loan.interest
        ])
    }
    return createTable(rows, (rowIndex = 0)=>onSelectLoan(loans[rowIndex]))
}


function showBankMenu(bank = new Bank()) {
    const {planet} = bank
    const reloadMenu = ()=>showBankMenu(bank)
    const isDocked = gs.location == planet

    function deposit(amt = 0) {
        const penalty = bank.calcDepositPenalty(amt)
        gs.credits -= amt
        bank.credits += amt
        Bank.playerBalance += amt-penalty
        reloadMenu()
    }

    function withdraw(amt = 0) {
        const penalty = bank.calcWithdrawalPenalty(amt)
        gs.credits += amt-penalty
        bank.credits -= amt-penalty
        Bank.playerBalance -= amt
        reloadMenu()
    }

    function borrow(principal = 0, term = 0) {
        const interest = bank.calcLoanInterest(principal, term)
        const loan = new BankLoan(principal, interest, term)
        gs.loans.push(loan)
        gs.credits += loan.principal
        bank.credits -= loan.principal
        reloadMenu()
    }

    function repay(loan = new BankLoan(), amount = 0) {
        gs.credits -= amount
        bank.credits += amount
        loan.repay(amount)
        if (loan.outstandingBalance <= 0) safeRemove(gs.loans, loan)
        reloadMenu()
    }

    function showDepositSlider() {
        showSliderModal(
            1, gs.credits, `Deposit`,
            `How many credits would you like to deposit?`,
            (amt)=>{
                const penalty = bank.calcDepositPenalty(amt)
                return `
                    Deposit Penalty : ${penalty}<br/>
                    Your CR After Deposit: ${gs.credits-amt}<br/>
                    Your Balance After Deposit : ${Bank.playerBalance+amt-penalty}<br/>
                    Bank CR After Deposit: ${bank.credits+amt}<br/>
                `
            },
            'Deposit', 'Cancel', (amt = 0)=>deposit(amt), ()=>reloadMenu(),
        )
    }

    function showWithdrawSlider() {
        showSliderModal(
            1, Bank.playerBalance, `Withdraw`,
            `How many credits would you like to withdraw?`,
            (amt)=>{
                const penalty = bank.calcWithdrawalPenalty(amt)
                return `
                    Withdrawal Penalty : ${penalty}<br/>
                    Your CR After Deposit: ${gs.credits+amt-penalty}<br/>
                    Your Balance After Withdrawal: ${Bank.playerBalance-amt}<br/>
                    Bank CR After Withdrawal: ${bank.credits-amt+penalty}<br/>
                `
            },
            'Withdraw', 'Cancel', (amt = 0)=>withdraw(amt), ()=>reloadMenu(),
        )
    }

    function showBorrowSlider() {
        const maxAmt = bank.calcLoanMaxAmount()
        showSliderModal(
            1, maxAmt, `Borrow - Amount`,
            `How many credits would you like to borrow?`,
            (amt)=>`
                Your CR After Loan: ${gs.credits+amt}<br/>
                Bank CR After Loan: ${bank.credits-amt}<br/>
            `,
            'Continue', 'Cancel', (amt = 0)=>showBorrowSlider2(amt), ()=>reloadMenu(),
        )
    }

    function showBorrowSlider2(amt = 0) {
        showSliderModal(
            1, BANK_MAX_LOAN_YEARS, `Borrow - Term`,
            `The bank allows you to choose a term for the loan.<br/>How many years until you repay it?`,
            (term)=>{
                const interest = bank.calcLoanInterest(amt, term)
                return `
                    Loan Amount: ${amt}<br/>
                    Interest: ${interest}<br/>
                    Total Repayment: ${amt + interest}<br/>
                `
            },
            'Borrow', 'Cancel', (term = 0)=>borrow(amt, term), ()=>reloadMenu(),
        )
    }

    function showRepaySlider(loan = new BankLoan()) {
        showSliderModal(
            1, loan.outstandingBalance, `Repay Loan`,
            `How much would you like to repay on your ${loan.overdue ? 'overdue' : ''} loan due on ${describeDate(loan.dueYear)}?`,
            (amt)=>{
                return `
                    Balance After Repayment: ${loan.outstandingBalance-amt}<br/>
                    Current Balance: ${loan.outstandingBalance}<br/>
                `
            },
            'Repay', 'Cancel', (amt = 0)=>repay(loan, amt), ()=>reloadMenu(),
        )
    }

    const canWithdraw = Bank.playerBalance > 0
    const canDeposit = gs.credits > 0
    const canBorrow = bank.calcLoanMaxAmount(gs.captain) > 0

    const baseButtons = [
        ...(isDocked && canWithdraw ? [['Withdraw', ()=>showWithdrawSlider()]] : []),
        ...(isDocked && canDeposit ? [['Deposit', ()=>showDepositSlider()]] : []),
        ...(isDocked && canBorrow ? [['Borrow', ()=>showBorrowSlider()]] : []),
    ]

    function onSelectLoan(loan = new BankLoan()) {
        const canRepay = gs.credits > 0
        const buttons = [
            ...baseButtons,
            ...(canRepay ? [['Repay', ()=>showRepaySlider(loan)]] : []),
            ['Back', ()=>showPlanetMenu(planet)],
        ]
        refreshPanelButtons('bank_panel', buttons)
    }

    let infoContainer = ce({
        children: [
            `<u>Your loans</u>`,
            createBankLoansTable(gs.loans, onSelectLoan),
            `Your CR: ${gs.credits} | Your Balance: ${Bank.playerBalance}<br/>`,
            `Bank CR: ${bank.credits} | Bank Transaction Penalty: ${roundToPlaces(bank.calcWithdrawalPenalty(100),2)}%<br/>`,
            `Max Approved Loan: ${bank.calcLoanMaxAmount(gs.captain)}<br/>`,
        ]
    })

    showModal(
        `${coloredName(planet)} - Bank`,
        infoContainer,
        [
            ...baseButtons,
            ['Back', ()=>showPlanetMenu(planet)]
        ],
        'bank_panel'
    );

}
