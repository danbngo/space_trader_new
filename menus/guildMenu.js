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
