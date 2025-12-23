//TODO: start implementing officer skills
//TODO: limit how many officers (and hence ships) player can have

function createHireOfficerMenu(officers = [new Officer()], guild = new Guild(), onSelectOfficer = (officer = new Officer())=>{}) {
    console.log('creating hire officer menu:',officers)
    if (officers.length == 0) return `(None)`
    /** @type {any[]} */
    const rows = [
        ['Name', 'Level', 'CR Share', ...SKILLS_ALL, 'Hire Price']
    ]
    for (const officer of officers) {
        const hirePrice = guild.calcHirePrice(officer)
        rows.push([
            officer.name,
            statColorSpan(officer.level, officer.level/5),
            statColorSpan(officer.crShare*100+'%', 5/officer.level),
            ...SKILLS_ALL.map(sk=>statColorSpan(officer.skills.getAmount(sk), officer.skills.getAmount(sk)*SKILLS_ALL.length/5/SKILL_POINTS_PER_LEVEL)),
            statColorSpan(hirePrice, officer.value/hirePrice)
        ])
    }
    console.log('creating hire officer table')
    return createTable(rows, (rowIndex = 0)=>onSelectOfficer(officers[rowIndex]))
}

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
        showModal(
            `Hire ${officer.name}?`,
            `Are you sure you want to hire ${officer.name} for ${hirePrice} credits?`,
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

    showModal(
        `${coloredName(planet)} - Guild`,
        ce({children:[
            `Guild officers`,
            createHireOfficerMenu(guild.officers, guild, (officer)=>onSelectGuildOfficer(officer)),
            `Your # officers: ${fleet.officers.length}/${captain.maxSubordinates} | Your credits: ${gs.credits}`,
            //`Guild credits: ${guild.credits}`,
            `Local Officer Level: ${roundToPlaces(100*guild.planet.culture.officerQuality, 2)}%`,
            `Hire Tax: ${statColorSpan(roundToPlaces(100*guild.baseRake, 2), 2/(1+guild.baseRake),true)}%`,
            (gs.fleet.totalSkills.getAmount(SKILLS.Barter) > 0) ? `Taxes After Barter | ${statColorSpan(roundToPlaces(100*(1+guild.rake) - 100, 2), 2/(1+guild.rake),true)}% Hire` : '',
        ]}),
        [
            ["Back", () => showPlanetMenu(planet)],
        ],
        `guild_hire_panel`,
    );
}
