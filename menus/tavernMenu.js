/**
 * Creates an HTML table displaying available officers for hire at tavern.
 * @param {Officer[]} officers - Array of officers available for hire.
 * @param {Tavern} tavern - The tavern building.
 * @param {(officer: Officer) => void} onSelectOfficer - Callback when an officer is selected.
 * @returns {HTMLTableElement|string} The officers table or "(None)" if no officers.
 */
function createHireOfficerMenu(officers = [new Officer()], tavern = new Tavern(), onSelectOfficer = (officer = new Officer())=>{}) {
    if (officers.length == 0) return colorSpan('(No officers available)', COLORS.Yellow)
    
    /** @type {any[]} */
    const rows = [
        ['Officer Name', 'Race', 'Level', 'Piloting', 'Trading', 'Engineering', 'Combat', 'Hire Price']
    ]
    for (const officer of officers) {
        if (!(tavern instanceof Tavern)) continue; // Type guard
        const hirePrice = tavern.calcHirePrice(officer)
        const raceDisplay = officer.race ? `${officer.race.symbol}` : '👤'
        rows.push([
            officer.name,
            raceDisplay,
            officer.level,
            officer.skills.getAmount(SKILLS.PILOTING),
            officer.skills.getAmount(SKILLS.TRADING),
            officer.skills.getAmount(SKILLS.ENGINEERING),
            officer.skills.getAmount(SKILLS.COMBAT),
            hirePrice
        ])
    }
    return createTable(rows, (rowIndex = 0)=>onSelectOfficer(officers[rowIndex]))
}

/**
 * Displays the tavern menu with tabs for hiring and gossip.
 * @param {Tavern} tavern - The tavern building to interact with.
 * @param {boolean} showGossip - Whether to show the gossip tab instead of hiring.
 */
function showTavernMenu(tavern, showGossip = false) {
    const {planet} = tavern
    const reloadMenu = (gossip = showGossip) => showTavernMenu(tavern, gossip)
    const isDocked = gs.location == planet
    
    function hireOfficer(officer) {
        if (!(tavern instanceof Tavern)) return; // Type guard
        const hirePrice = tavern.calcHirePrice(officer)
        gs.credits -= hirePrice
        gs.fleet.addOfficer(officer)
        safeRemove(tavern.officers, officer)
        reloadMenu(false)
    }

    function showHireOfficerModal(officer) {
        if (!(tavern instanceof Tavern)) return; // Type guard
        const hirePrice = tavern.calcHirePrice(officer)
        const implantsText = officer.implants.length > 0 
            ? '<br/><b>Cybernetic Implants:</b><br/>' + officer.implants.map(i => colorSpan(i.implantType.name, i.implantType.color) + ` (${roundToPlaces(i.quality*100, 1)}%)`).join(', ')
            : ''
        const reputationText = officer.reputation.total !== 0 
            ? `<br/><b>Reputation:</b> ${officer.reputation.total} (${coloredName(officer.reputation.keys[0])})`
            : ''
        const raceText = officer.race ? `${officer.race.symbol} ${colorSpan(officer.race.name, officer.race.color)}` : 'Human'
        
        showModal(
            `Hire ${officer.name}?`,
            `Hire ${officer.name} for ${hirePrice} credits?<br/><br/><b>Race:</b> ${raceText}<br/><b>Level:</b> ${officer.level}<br/><b>Skills:</b> ${SKILLS_ALL.map(sk => `${sk}: ${officer.skills.getAmount(sk)}`).join(', ')}${implantsText}${reputationText}`,
            [
                ['Hire', () => hireOfficer(officer)],
                ['Cancel', () => reloadMenu(false)],
            ],
        )
    }

    function onSelectOfficer(officer) {
        if (!(tavern instanceof Tavern)) return; // Type guard
        const hirePrice = tavern.calcHirePrice(officer)
        const canHire = isDocked && gs.credits >= hirePrice && gs.fleet.officers.length < gs.captain.maxSubordinates
        const canHireReason = !canHire ? (
            !isDocked ? 'Must be docked to hire' :
            gs.credits < hirePrice ? 'Not enough credits' :
            gs.fleet.officers.length >= gs.captain.maxSubordinates ? 'Officer capacity reached' :
            'Cannot hire'
        ) : null
        
        /** @type {ButtonData[]} */
        const buttons = [
            ['Hire', ()=>showHireOfficerModal(officer), !canHire, canHireReason],
            ['Hear Gossip', () => reloadMenu(true)],
            ['Back', () => showPlanetMenu(planet)],
        ]
        refreshPanelButtons('tavern_panel', buttons)
    }

    let content
    
    if (showGossip) {
        // Gossip tab
        const gossipText = tavern.gossip()
        content = ce({children: [
            ce({tag: 'p', innerHTML: 'You lean in close as the bartender shares the latest rumors and news...'}),
            ce({tag: 'div', innerHTML: gossipText, style: {padding: '10px', marginTop: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '5px'}}),
        ]})
    } else {
        // Hiring tab
        const officersTable = createHireOfficerMenu(tavern.officers, tavern, onSelectOfficer)
        
        content = ce({children: [
            officersTable,
        ]})
    }

    /** @type {ButtonData[]} */
    const buttons = [
        [showGossip ? 'Hire Mercenaries' : 'Hear Gossip', () => reloadMenu(!showGossip)],
        ['Back', () => showPlanetMenu(planet)],
    ]

    showPlanetModal(
        planet,
        `${coloredName(planet)} - Tavern`,
        content,
        [],
        'tavern_panel',
        (nextPlanet) => {
            const nextTavern = nextPlanet.settlement?.tavern
            return nextTavern ? showTavernMenu(nextTavern, showGossip) : showPlanetMenu(nextPlanet)
        }
    )
    
    refreshPanelButtons('tavern_panel', buttons)
}
