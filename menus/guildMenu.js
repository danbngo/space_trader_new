/**
 * Creates an HTML table displaying available officers for hire.
 * @param {Officer[]} officers - Array of officers available for hire.
 * @param {Guild} guild - The guild building.
 * @param {(officer: Officer) => void} onSelectOfficer - Callback when an officer is selected.
 * @returns {HTMLTableElement|string} The table element or "(None)" if no officers.
 */
function createHireOfficerMenu(officers = [new Officer()], guild = new Guild(), onSelectOfficer = (officer = new Officer())=>{}) {
    console.log('creating hire officer menu:',officers)
    if (officers.length == 0) return `(None)`
    /** @type {any[]} */
    const rows = [
        ['Name', 'Age', 'Level', 'CR Share', ...SKILLS_ALL, 'Hire Price']
    ]
    for (const officer of officers) {
        const hirePrice = guild.calcHirePrice(officer)
        rows.push([
            officer.name,
            officer.age,
            statColorSpan(officer.level, officer.level/5),
            statColorSpan(officer.crShare*100+'%', 5/officer.level),
            ...SKILLS_ALL.map(sk=>statColorSpan(officer.skills.getAmount(sk), officer.skills.getAmount(sk)*SKILLS_ALL.length/5/SKILL_POINTS_PER_LEVEL)),
            statColorSpan(hirePrice, officer.value/hirePrice)
        ])
    }
    console.log('creating hire officer table')
    return createTable(rows, (rowIndex = 0)=>onSelectOfficer(officers[rowIndex]))
}
/**
 * Displays the guild menu for hiring officers.
 * @param {Guild} guild - The guild building to interact with.
 */
function showGuildMenu(guild = new Guild()) {
    const {planet} = guild
    const {fleet, captain} = gs
    const isDocked = fleet.location == planet
    const rebuildMenu = ()=>showGuildMenu(guild)

    function hireOfficer(officer = new Officer()) {
        const hirePrice = guild.calcHirePrice(officer)
        gs.credits -= hirePrice;
        //guild.credits += hirePrice;
        fleet.addOfficer(officer)
        safeRemove(guild.officers, officer)
        rebuildMenu()
    }

    function showHireOfficerModal(officer = new Officer()) {
        const hirePrice = guild.calcHirePrice(officer)
        const reputationText = officer.reputation.total !== 0 
            ? `<br/><b>Reputation:</b> ${officer.reputation.total} (${coloredName(officer.reputation.keys[0])})`
            : ''
        
        showModal(
            `Hire ${officer.name}?`,
            `Hire ${officer.name} for ${hirePrice} credits?<br/><br/><b>Level:</b> ${officer.level}<br/><b>Skills:</b> ${SKILLS_ALL.map(sk => `${sk}: ${officer.skills.getAmount(sk)}`).join(', ')}${reputationText}`,
            [
                ['Hire', () => hireOfficer(officer)],
                ['Cancel', () => rebuildMenu()],
            ],
        )
    }
    
    function onSelectGuildOfficer(officer = new Officer()) {
        console.log('selected guild officer:',officer)
        const hirePrice = guild.calcHirePrice(officer)
        const canHire = isDocked && gs.credits >= hirePrice && fleet.officers.length < captain.maxSubordinates
        const buttons = [
            ...(canHire ? [[`Hire`, ()=>showHireOfficerModal(officer)]] : []),
            ["Back", () => showPlanetMenu(planet)],
        ]
        refreshPanelButtons('guild_hire_panel', buttons)
    }

    showPlanetModal(
        planet,
        `${coloredName(planet)} - Guild`,
        ce({children:[
            isDocked ? 'Welcome to the guild.<br/>' : colorSpan('You must dock to use the guild.', COLORS.Yellow) + '<br/>',
            createHireOfficerMenu(guild.officers, guild, (officer)=>onSelectGuildOfficer(officer)),
            `Your # officers: ${fleet.officers.length}/${captain.maxSubordinates} | Your credits: ${gs.credits}`,
            //`Guild credits: ${guild.credits}`,
            `Local Officer Level: ${roundToPlaces(100*guild.planet.c.education, 2)}%`,
            `Hire Fee: ${statColorSpan(roundToPlaces(100*planet.c.corruption, 2), 2/(1+planet.c.corruption))}%`,
            (gs.fleet.totalSkills.getAmount(SKILLS.Barter) > 0) ? `Fee After Barter | ${statColorSpan(roundToPlaces(100*(1+guild.rake) - 100, 2), 2/(1+guild.rake))}% Hire` : '',
        ]}),
        [
            ["Back", () => showPlanetMenu(planet)],
        ],
        `guild_hire_panel`,
        (nextPlanet) => nextPlanet.settlement?.guild ? showGuildMenu(nextPlanet.settlement.guild) : showPlanetMenu(nextPlanet)
    );
    
    // Auto-select first officer
    if (guild.officers.length > 0) {
        onSelectGuildOfficer(guild.officers[0])
    }
}
