/**
 * Creates an HTML table displaying active bank loans.
 * @param {BankLoan[]} loans - Array of loan objects to display.
 * @param {(loan: BankLoan) => void} onSelectLoan - Callback when a loan is selected.
 * @returns {HTMLTableElement|string} The table element or "(None)" if no loans.
 */
function createBankLoansTable(loans = [new BankLoan()], onSelectLoan = (loan = new BankLoan())=>{}) {
    if (loans.length == 0) return `(None)`
    /** @type {Array<Array<string|number|HTMLElement>>} */
    const rows = [
        ['Due Date', 'Term', 'Outstanding Balance', 'Total Repayable', 'Principal', 'Interest']
    ]
    for (const loan of loans) {
        rows.push([
            colorSpan(describeDate(loan.dueYear), gs.year >= loan.dueYear ? COLORS.Red : ''),
            describeTimespan(loan.term),
            statColorSpan(loan.outstandingBalance, loan.outstandingBalance/loan.totalRepayable),
            loan.totalRepayable,
            loan.principal,
            loan.interest
        ])
    }
    const table = createTable(rows, (rowIndex = 0)=>onSelectLoan(loans[rowIndex]));
    
    // Add popovers to header columns
    if (table.rows[0]) {
        const headerRow = table.rows[0];
        if (headerRow.cells[0]) createPopoverElement(headerRow.cells[0], 'Year when the loan must be fully repaid. Late payment incurs penalties.');
        if (headerRow.cells[1]) createPopoverElement(headerRow.cells[1], 'Length of time until the loan is due');
        if (headerRow.cells[2]) createPopoverElement(headerRow.cells[2], 'Amount still owed on this loan');
        if (headerRow.cells[3]) createPopoverElement(headerRow.cells[3], 'Total amount to repay (principal + interest)');
        if (headerRow.cells[4]) createPopoverElement(headerRow.cells[4], 'Original borrowed amount');
        if (headerRow.cells[5]) createPopoverElement(headerRow.cells[5], 'Interest charged on the loan');
    }
    
    return table;
}

/**
 * Displays the bank menu for depositing, withdrawing, and managing loans.
 * @param {Bank} bank - The bank building to interact with.
 */
function showBankMenu(bank = new Bank()) {
    const {planet} = bank
    const reloadMenu = ()=>showBankMenu(bank)
    const isDocked = gs.location == planet

    function deposit(amt = 0) {
        const penalty = bank.calcDepositPenalty(amt)
        gs.credits -= amt
        bank.credits += amt
        bank.playerBalance += amt-penalty
        reloadMenu()
    }

    function withdraw(amt = 0) {
        const penalty = bank.calcWithdrawalPenalty(amt)
        gs.credits += amt-penalty
        bank.credits -= amt-penalty
        bank.playerBalance -= amt
        reloadMenu()
    }

    function borrow(principal = 0, term = 0) {
        const interest = bank.calcLoanInterest(principal, term)
        const loan = new BankLoan(principal, interest, term, gs.year, planet)
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
                    Your Balance After Deposit : ${bank.playerBalance+amt-penalty}<br/>
                    Bank CR After Deposit: ${bank.credits+amt}<br/>
                `
            },
            'Deposit', 'Cancel', (amt = 0)=>deposit(amt), ()=>reloadMenu(),
        )
    }

    function showWithdrawSlider() {
        showSliderModal(
            1, bank.playerBalance, `Withdraw`,
            `How many credits would you like to withdraw?`,
            (amt)=>{
                const penalty = bank.calcWithdrawalPenalty(amt)
                return `
                    Withdrawal Penalty : ${penalty}<br/>
                    Your CR After Deposit: ${gs.credits+amt-penalty}<br/>
                    Your Balance After Withdrawal: ${bank.playerBalance-amt}<br/>
                    Bank CR After Withdrawal: ${bank.credits-amt+penalty}<br/>
                `
            },
            'Withdraw', 'Cancel', (amt = 0)=>withdraw(amt), ()=>reloadMenu(),
        )
    }

    function showBorrowSlider() {
        const maxAmt = bank.calcLoanMaxAmount(gs.captain)
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

    const canWithdraw = bank.playerBalance > 0
    const canDeposit = gs.credits > 0
    const canBorrow = bank.calcLoanMaxAmount(gs.captain) > 0
    
    // Check access
    const accessDeniedReason = BuildingType.getAccessDeniedReason(planet, bank)
    const canAccess = accessDeniedReason === null

    /** @type {ButtonData[]} */
    const baseButtons = [
        ['Withdraw', ()=>showWithdrawSlider(), !canAccess || !isDocked || !canWithdraw],
        ['Deposit', ()=>showDepositSlider(), !canAccess || !isDocked || !canDeposit],
        ['Borrow', ()=>showBorrowSlider(), !canAccess || !isDocked || !canBorrow],
    ]

    function onSelectLoan(loan = new BankLoan()) {
        const canRepay = gs.credits > 0
        /** @type {ButtonData[]} */
        const buttons = [
            ...baseButtons,
            ['Repay', ()=>showRepaySlider(loan), !canRepay],
            ['Back', ()=>showPlanetMenu(planet)],
        ]
        refreshPanelButtons('bank_panel', buttons)
    }

    let infoContainer = ce({
        children: [
            accessDeniedReason ? colorSpan(accessDeniedReason, COLORS.Orange) + '<br/>' : '',
            `<u>Your loans</u>`,
            createBankLoansTable(gs.loans, onSelectLoan),
            `Your CR: ${gs.credits} | Your Balance: ${bank.playerBalance}<br/>`,
            `Bank CR: ${bank.credits} | Bank Transaction Penalty: ${roundToPlaces(bank.calcWithdrawalPenalty(100),2)}%<br/>`,
            `Max Approved Loan: ${bank.calcLoanMaxAmount(gs.captain)}<br/>`,
        ]
    })

    showPlanetModal(
        planet,
        `${coloredName(planet)} - Bank`,
        infoContainer,
        [
            ...baseButtons,
            ['Back', ()=>showPlanetMenu(planet)]
        ],
        'bank_panel',
        (nextPlanet) => nextPlanet.settlement?.bank ? showBankMenu(nextPlanet.settlement.bank) : showPlanetMenu(nextPlanet)
    );

}
