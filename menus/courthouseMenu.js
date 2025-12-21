

function showCourthouseMenu(courthouse = new Courthouse()) {
    const {planet} = courthouse
    const reloadMenu = ()=>showCourthouseMenu(courthouse)
    const isDocked = gs.location == planet

    function payBounty(amount = 0) {
        const penalty = courthouse.calcPayBountyPenalty(amount)
        gs.credits -= amount + penalty
        reloadMenu()
    }

    function serveJailTime(days = 0) {
        gs.year += days/365
        gs.captain.bounty = 0
        reloadMenu()
    }

    function showPayBountySlider() {
        const maxBountyRepayment = Math.min(gs.captain.bounty, gs.credits)
        showSliderModal(
            1, maxBountyRepayment, `Bounty Payment`,
            `How much of your bounty would you like to pay off?`,
            (amt)=>{
                const penalty = courthouse.calcPayBountyPenalty(amt)
                return `
                    Bounty Payment Penalty: ${penalty}<br/>
                    Your CR After Paying: ${gs.credits-amt-penalty}<br/>
                    Your Bounty After Paying: ${gs.captain.bounty-amt}<br/>`
            },
            'Pay', 'Cancel', (amt = 0)=>payBounty(amt), ()=>reloadMenu(),
        )
    }

    function showServeJailTimeModal(days = 0) {
        showModal(`Serve Jail Time`,
            `Are you sure you want to serve <b>${days}</b> days in jail to clear your bounty of <b>${gs.captain.bounty}</b> CR?<br/>`,
            [
                ['Yes', ()=>{serveJailTime(days)}],
                ['No', ()=>{reloadMenu()}],
            ],
            'jail_time_modal'
        )
    }

    const canPayBounty = gs.credits > 0 && gs.captain.bounty > 0

    const baseButtons = [
        ['Pay Bounty', ()=>showPayBountySlider(), !isDocked || !canPayBounty],
        ['Serve Jail Time', ()=>showServeJailTimeModal(Math.ceil(gs.captain.bounty*JAIL_DAYS_PER_1000CR_FINE/1000)), !isDocked || gs.captain.bounty <= 0],
    ]

    let infoContainer = ce({
        children: [
            `Your CR: ${gs.credits} | Your Bounty: ${gs.captain.bounty}<br/>`,
            `Courthouse Pay Bounty Penalty: ${roundToPlaces(courthouse.calcPayBountyPenalty(100),2)}%<br/>`,
        ]
    })

    panel = showModal(
        `${coloredName(planet)} - Courthouse`,
        `${gs.captain.bounty > 0 ? `The courthouse grants you temporary amnesty since you have come of own volition.` : ''}`,
        infoContainer,
        [
            ...baseButtons,
            ['Back', ()=>showPlanetMenu(planet)]
        ],
        'courthouse_panel'
    );

}
