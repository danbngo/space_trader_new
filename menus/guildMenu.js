//TODO: start implementing officer skills
//TODO: limit how many officers (and hence ships) player can have

function createHireOfficerMenu(officers = [new Officer()], guild = new Guild(), onSelectOfficer = (officer = new Officer())=>{}) {
    console.log('creating hire officer menu:',officers)
    if (officers.length == 0) return `(None)`
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
        const buttons = [
            [`Hire`, ()=>showHireOfficerModal(officer), (!isDocked || gs.credits < hirePrice || fleet.officers.length >= captain.maxSubordinates)],
            ["Back", () => showPlanetMenu(planet)],
        ]
        refreshPanelButtons('guild_hire_panel', buttons)
    }

    showModal(
        `${coloredName(planet)} - Guild`,
        createElement({children:[
            `Guild officers`,
            createHireOfficerMenu(guild.officers, guild, (officer)=>onSelectGuildOfficer(officer)),
            `Your # officers: ${fleet.officers.length}/${captain.maxSubordinates} | Your credits: ${gs.credits}`,
            //`Guild credits: ${guild.credits}`,
            `Hire Penalty: ${roundToPlaces(100*guild.rake, 2)}% | Local Officer Level: ${roundToPlaces(100*guild.planet.culture.officerQuality, 2)}%`,
        ]}),
        [
            ["Back", () => showPlanetMenu(planet)],
        ],
        `guild_hire_panel`,
    );
}
