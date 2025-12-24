

function showCourthouseMenu(courthouse = new Courthouse()) {
    const {planet} = courthouse
    const reloadMenu = ()=>showCourthouseMenu(courthouse)
    const isDocked = gs.location == planet
    const planetBounty = gs.captain.bounty.getAmount(planet)

    function payBounty(amount = 0) {
        const penalty = courthouse.calcPayBountyPenalty(amount)
        gs.credits -= amount + penalty
        gs.captain.bounty.increment(planet, -amount)
        reloadMenu()
    }

    function serveJailTime(days = 0) {
        gs.year += days/365
        gs.captain.bounty.setAmount(planet, 0)
        reloadMenu()
    }

    function showPayBountySlider() {
        const maxBountyRepayment = Math.min(planetBounty, gs.credits)
        showSliderModal(
            1, maxBountyRepayment, `Bounty Payment`,
            `How much of your bounty would you like to pay off?`,
            (amt)=>{
                const penalty = courthouse.calcPayBountyPenalty(amt)
                return `
                    Bounty Payment Penalty: ${penalty}<br/>
                    Your CR After Paying: ${gs.credits-amt-penalty}<br/>
                    Your Bounty After Paying: ${planetBounty-amt}<br/>`
            },
            'Pay', 'Cancel', (amt = 0)=>payBounty(amt), ()=>reloadMenu(),
        )
    }

    function showServeJailTimeModal(days = 0) {
        showModal(`Serve Jail Time`,
            `Are you sure you want to serve <b>${describeTimespan(days/365)}</b> days in jail to clear your bounty of <b>${planetBounty}</b> CR?<br/>`,
            [
                ['Yes', ()=>{serveJailTime(days)}],
                ['No', ()=>{reloadMenu()}],
            ],
            'jail_time_modal'
        )
    }

    const canPayBounty = gs.credits > 0 && planetBounty > 0

    const baseButtons = [
        ...(isDocked && canPayBounty ? [['Pay Bounty', ()=>showPayBountySlider()]] : []),
        ...(isDocked && planetBounty > 0 ? [['Serve Jail Time', ()=>showServeJailTimeModal(Math.ceil(planetBounty*JAIL_DAYS_PER_1000CR_FINE/1000))]] : []),
    ]

    let infoContainer = ce({
        children: [
            `Your CR: ${gs.credits} | Your Bounty (${planet.name}): ${planetBounty}<br/>`,
            `Your Total Bounty (All Planets): ${gs.captain.bounty.total}<br/>`,
            `Courthouse Pay Bounty Penalty: ${roundToPlaces(courthouse.calcPayBountyPenalty(100),2)}%<br/>`,
        ]
    })

    showModal(
        `${coloredName(planet)} - Courthouse`,
        ce({
            children:[
                `${isDocked && planetBounty > 0 ? `The courthouse grants you temporary amnesty since you have come of own volition.` : ''}`,
                infoContainer,
            ]
        }),
        [
            ...baseButtons,
            ['Back', ()=>showPlanetMenu(planet)]
        ],
        'courthouse_panel'
    );

}
