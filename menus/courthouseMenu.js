/**
 * Displays the courthouse menu for paying bounties and serving jail time.
 * @param {Courthouse} courthouse - The courthouse building to interact with.
 */
function showCourthouseMenu(courthouse = new Courthouse()) {
    const {planet} = courthouse
    const reloadMenu = ()=>showCourthouseMenu(courthouse)
    const isDocked = gs.location == planet
    const planetBounty = gs.captain.bounty.getAmount(planet)
    const currentRank = gs.captain.ranks.get(planet) || RANK_TYPES.NO_RANK
    const planetReputation = gs.captain.reputation.getAmount(planet)

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
            `Serve <b>${describeTimespan(days/365)}</b> days in jail to clear your bounty of <b>${planetBounty}</b> CR?<br/>`,
            [
                ['Yes', ()=>{serveJailTime(days)}],
                ['No', ()=>{reloadMenu()}],
            ],
            'jail_time_modal'
        )
    }

    function upgradeRank() {
        const price = courthouse.calcUpgradeRankPrice(gs.captain)
        const nextRank = RANK_TYPES_ALL.find(r => r.level === currentRank.level + 1)
        gs.credits -= price
        gs.captain.ranks.set(planet, nextRank)
        reloadMenu()
    }

    function showUpgradeRankModal() {
        const price = courthouse.calcUpgradeRankPrice(gs.captain)
        const nextRank = RANK_TYPES_ALL.find(r => r.level === currentRank.level + 1)
        showModal(`Upgrade Rank`,
            `Upgrade your rank from ${colorSpan(currentRank.name, currentRank.color)} to ${colorSpan(nextRank.name, nextRank.color)} for ${price} CR?<br/>`,
            [
                ['Yes', ()=>{upgradeRank()}],
                ['No', ()=>{reloadMenu()}],
            ],
            'upgrade_rank_modal'
        )
    }

    const canPayBounty = gs.credits > 0 && planetBounty > 0
    const upgradePrice = courthouse.calcUpgradeRankPrice(gs.captain)
    const canUpgradeRank = upgradePrice !== null && planetReputation > 0 && planetBounty === 0 && gs.credits >= upgradePrice
    
    // Helper functions to get disabled reasons
    function getPayBountyDisabledReason() {
        if (!isDocked) return "Must be docked to pay bounty";
        if (planetBounty <= 0) return "No bounty to pay";
        if (gs.credits <= 0) return "Insufficient credits";
        return null;
    }
    
    function getServeJailTimeDisabledReason() {
        if (!isDocked) return "Must be docked to serve jail time";
        if (planetBounty <= 0) return "No bounty to clear";
        return null;
    }
    
    function getUpgradeRankDisabledReason() {
        if (!isDocked) return "Must be docked to upgrade rank";
        if (upgradePrice === null) return "Already at maximum rank";
        if (planetBounty > 0) return "Must clear bounty first";
        if (planetReputation <= 0) return "Requires positive reputation";
        if (gs.credits < upgradePrice) return `Insufficient credits (need ${upgradePrice} CR)`;
        return null;
    }

    /** @type {ButtonData[]} */
    const baseButtons = [
        ['Pay Bounty', ()=>showPayBountySlider(), !isDocked || !canPayBounty, getPayBountyDisabledReason()],
        ['Serve Jail Time', ()=>showServeJailTimeModal(Math.ceil(planetBounty*JAIL_DAYS_PER_1000CR_FINE/1000)), !isDocked || planetBounty <= 0, getServeJailTimeDisabledReason()],
        ['Upgrade Rank', ()=>showUpgradeRankModal(), !isDocked || !canUpgradeRank, getUpgradeRankDisabledReason()],
    ]

    const nextRank = RANK_TYPES_ALL.find(r => r.level === currentRank.level + 1)
    
    // Create rank display with popover
    const rankSpan = ce({tag: 'span', innerHTML: colorSpan(currentRank.name, currentRank.color)});
    createPopoverElement(rankSpan, currentRank.description);
    
    const rankUpgradeInfo = upgradePrice !== null 
        ? ce({children: ['Rank Upgrade: ', rankSpan, ` → ${colorSpan(nextRank.name, nextRank.color)} for ${upgradePrice} CR`, ce({tag: 'br'})]})
        : ce({children: ['Rank: ', rankSpan, ' (Max Rank)', ce({tag: 'br'})]});

    let infoContainer = ce({
        children: [
            `Your CR: ${gs.credits} | Your Bounty (${coloredName(planet)}): ${planetBounty}<br/>`,
            `Your Total Bounty (All Planets): ${gs.captain.bounty.total}<br/>`,
            `Courthouse Pay Bounty Penalty: ${roundToPlaces(courthouse.calcPayBountyPenalty(100),2)}%<br/>`,
            rankUpgradeInfo,
            upgradePrice !== null && !canUpgradeRank && isDocked ? colorSpan(`Rank upgrade requires positive reputation, no bounty, and ${upgradePrice} CR.`, COLORS.Orange) + '<br/>' : '',
        ]
    })

    /** @type {ButtonData[]} */
    const buttons = [
            ...baseButtons,
            ['Back', ()=>showPlanetMenu(planet)]
    ]

    showPlanetModal(
        planet,
        `${coloredName(planet)} - Courthouse`,
        ce({
            children:[
                `${isDocked && planetBounty > 0 ? `The courthouse grants you temporary amnesty since you have come of own volition.` : ''}`,
                infoContainer,
            ]
        }),
        buttons,
        'courthouse_panel',
        (nextPlanet) => nextPlanet.settlement?.courthouse ? showCourthouseMenu(nextPlanet.settlement.courthouse) : showPlanetMenu(nextPlanet)
    );

}
