/**
 * Creates an HTML table displaying available missions.
 * @param {Mission[]} missions - Array of missions available.
 * @param {Guild} guild - The guild building.
 * @param {(mission: Mission) => void} onSelectMission - Callback when a mission is selected.
 * @returns {HTMLTableElement|string} The missions table or message if no missions.
 */
function createMissionsMenu(missions = [], guild = new Guild(), onSelectMission = (mission)=>{}) {
    if (missions.length == 0) return colorSpan('(No missions available)', COLORS.Yellow)
    /** @type {any[]} */
    const rows = [
        ['Mission Type', 'Target', 'Amount', 'Duration', 'Reward']
    ]
    for (const mission of missions) {
        const durationDays = Math.round((mission.expirationDate - gs.year) * 365)
        rows.push([
            colorSpan(mission.missionType.name, mission.missionType.color),
            mission.targetPlanet ? mission.targetPlanet.name : '—',
            mission.amount,
            `${durationDays} days`,
            statColorSpan(mission.reward, mission.reward / mission.missionType.baseReward)
        ])
    }
    return createTable(rows, (rowIndex = 0)=>onSelectMission(missions[rowIndex]))
}

/**
 * Creates an HTML table displaying available officers for hire.
 * @param {Officer[]} officers - Array of officers available for hire.
 * @param {Guild} guild - The guild building.
 * @param {(officer: Officer) => void} onSelectOfficer - Callback when an officer is selected.
 * @returns {HTMLTableElement|string} The table element or "(None)" if no officers.
 */
function createHireOfficerMenu(officers = [], guild = new Guild(), onSelectOfficer = (officer)=>{}) {
    console.log('creating hire officer menu:',officers)
    if (officers.length == 0) return colorSpan('(No officers available)', COLORS.Yellow)
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
            ...SKILLS_ALL.map(sk => {
                const baseSkill = officer.skills.getAmount(sk);
                const bonusSkill = officer.bonusSkills.getAmount(sk);
                const displayLevel = bonusSkill > 0 
                    ? `${baseSkill}\u00A0${colorSpan('(+' + bonusSkill + ')', COLORS.White)}`
                    : baseSkill;
                return statColorSpan(displayLevel, baseSkill*SKILLS_ALL.length/5/SKILL_POINTS_PER_LEVEL);
            }),
            statColorSpan(hirePrice, hirePrice/officer.value)
        ])
    }
    console.log('creating hire officer table')
    return createTable(rows, (rowIndex = 0)=>onSelectOfficer(officers[rowIndex]))
}
/**
 * Displays the guild menu for hiring officers and accepting missions.
 * @param {Guild} guild - The guild building to interact with.
 */
function showGuildMenu(guild = new Guild()) {
    const {planet} = guild
    const {fleet, captain} = gs
    const isDocked = fleet.location == planet
    const rebuildMenu = ()=>showGuildMenu(guild)

    function acceptMission(mission) {
        mission.onAcceptMission()
        safeRemove(guild.missions, mission)
        rebuildMenu()
    }

    function showAcceptMissionModal(mission) {
        const durationDays = Math.round((mission.expirationDate - gs.year) * 365)
        showModal(
            `Accept ${mission.missionType.name}?`,
            ce({children:[
                colorSpan(mission.missionType.description, mission.missionType.color),
                ce({tag: 'br'}),
                ce({tag: 'br'}),
                `Target: ${mission.targetPlanet ? coloredName(mission.targetPlanet) : 'N/A'}`,
                ce({tag: 'br'}),
                `Amount: ${mission.amount}`,
                ce({tag: 'br'}),
                `Duration: ${durationDays} days`,
                ce({tag: 'br'}),
                `Reward: ${mission.reward} CR`,
            ]}),
            [
                ['Accept', () => acceptMission(mission)],
                ['Cancel', () => rebuildMenu()],
            ],
        )
    }
    
    function onSelectMission(mission) {
        /** @type {ButtonData[]} */
        const buttons = []
        if (isDocked) buttons.push([`Accept Mission`, ()=>showAcceptMissionModal(mission)])
        buttons.push(["Back", () => showPlanetMenu(planet)])
        refreshPanelButtons('guild_panel', buttons)
    }

    function hireOfficer(officer) {
        const hirePrice = guild.calcHirePrice(officer)
        gs.credits -= hirePrice;
        //guild.credits += hirePrice;
        fleet.addOfficer(officer)
        safeRemove(guild.officers, officer)
        rebuildMenu()
    }

    function showHireOfficerModal(officer) {
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
    
    function onSelectGuildOfficer(officer) {
        console.log('selected guild officer:',officer)
        const hirePrice = guild.calcHirePrice(officer)
        const canHire = isDocked && gs.credits >= hirePrice && fleet.officers.length < captain.maxSubordinates
        /** @type {ButtonData[]} */
        const buttons = []
        if (canHire) buttons.push([`Hire (${hirePrice} CR)`, ()=>showHireOfficerModal(officer)])
        buttons.push(["Back", () => showPlanetMenu(planet)])
        refreshPanelButtons('guild_hire_panel', buttons)
    }

    showPlanetModal(
        planet,
        `${coloredName(planet)} - Guild`,
        ce({children:[
            createMissionsMenu(guild.missions, guild, (mission)=>onSelectMission(mission)),
            `Your # officers: ${fleet.officers.length}/${captain.maxSubordinates} | Your credits: ${gs.credits}`,
            createBuildingPriceInfo(guild, 'Guild', {showBuyPrice: true, showSellPrice: false}),
        ]}),
        [
            ["Back", () => showPlanetMenu(planet)],
        ],
        `guild_panel`,
        (nextPlanet) => nextPlanet.settlement?.guild ? showGuildMenu(nextPlanet.settlement.guild) : showPlanetMenu(nextPlanet)
    );
    
    // Auto-select first mission
    if (guild.missions.length > 0) {
        onSelectMission(guild.missions[0])
    }
}
