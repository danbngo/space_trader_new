
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

    const canWithdraw = bank.playerBalance > 0
    const canDeposit = gs.credits > 0
    
    // Check access
    const accessDeniedReason = BuildingType.getAccessDeniedReason(planet, bank)
    const canAccess = accessDeniedReason === null

    /** @type {ButtonData[]} */
    const baseButtons = [
        ['Withdraw', ()=>showWithdrawSlider(), !canAccess || !isDocked || !canWithdraw],
        ['Deposit', ()=>showDepositSlider(), !canAccess || !isDocked || !canDeposit],
    ]

    let infoContainer = ce({
        children: [
            accessDeniedReason ? colorSpan(accessDeniedReason, COLORS.Orange) + '<br/>' : '',
            `Your CR: ${gs.credits} | Your Balance: ${bank.playerBalance}<br/>`,
            `Bank CR: ${bank.credits} | Bank Transaction Penalty: ${roundToPlaces(bank.calcWithdrawalPenalty(100),2)}%<br/>`,
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