/**
 * Creates an HTML table displaying the player's officers.
 * @param {Officer[]} officers - Array of officers to display.
 * @param {(officer: Officer) => void} onSelectOfficer - Callback when officer is selected.
 * @returns {HTMLTableElement|string} The officers table or "(None)" if no officers.
 */
function createOfficersTable(officers = [], onSelectOfficer = (officer)=>{}) {
    if (officers.length == 0) return colorSpan('(No officers hired yet)', COLORS.Gray)
    /** @type {(HTMLElement|string|number|SkillType)[][]} */
    const rows = [
        ['Name', 'Age', 'Race', 'Religion', 'Piloting', 'Level', 'CR Share', ...SKILLS_ALL]
    ]
    for (const officer of officers) {
        const assignedShip = gs.fleet.getAssignedShip(officer)
        const shipName = assignedShip ? assignedShip.name : colorSpan('(None)', COLORS.Gray)
        const raceDisplay = officer.race ? `${officer.race.symbol} ${officer.race.name}` : 'Human'
        const religionDisplay = officer.religion ? `${officer.religion.symbol} ${officer.religion.name}` : ''
        const nameDisplay = officer === gs.captain ? `★ ${officer.name}` : officer.name
        rows.push([
            nameDisplay,
            ''+officer.age,
            raceDisplay,
            religionDisplay,
            shipName,
            ''+statColorSpan(officer.level, officer.level/5),
            ''+statColorSpan(officer.crShare*100+'%', 5/officer.level),
            ...SKILLS_ALL.map(sk => {
                const baseSkill = officer.skills.getAmount(sk);
                const bonusSkill = officer.bonusSkills.getAmount(sk);
                const displayLevel = bonusSkill > 0 
                    ? `${baseSkill}\u00A0${colorSpan('(+' + bonusSkill + ')', COLORS.White)}`
                    : baseSkill;
                return ''+statColorSpan(displayLevel, baseSkill*SKILLS_ALL.length/5/SKILL_POINTS_PER_LEVEL);
            }),
        ])
    }
    return createTable(rows, (rowIndex = 0)=>onSelectOfficer(officers[rowIndex]))
}

/**
 * Displays the officers roster menu for managing hired officers.
 * @param {Officer[]} officers - Array of officers to display.
 */
function showOfficersMenu(officers = gs.fleet.officers.filter(o => o !== gs.captain)) {
    const reloadMenu = ()=>showOfficersMenu(gs.fleet.officers.filter(o => o !== gs.captain))

    function fireOfficer(officer) {
        safeRemove(gs.fleet.officers, officer)
        showOfficersMenu(gs.fleet.officers.filter(o => o !== gs.captain)) //DONT use reloadMenu here, wont reflect changes to ship list
    }

    function showFireOfficerModal(officer) {
        showModal(`Fire ${officer.name}`, 
            `Fire ${officer.name}?`,
            [
                ["Fire", () => fireOfficer(officer)],
                ["Cancel", () => reloadMenu()],
            ]
        )
    }

    let selectedOfficer = null

    function onSelectOfficer(officer) {
        selectedOfficer = officer
        const isCaptain = officer === gs.captain
        const notEnoughPilots = gs.fleet.numPilots <= gs.fleet.ships.length
        /** @type {ButtonData[]} */
        const buttons = [
            ['Fire', ()=>showFireOfficerModal(officer), isCaptain || notEnoughPilots],
            ["Close", () => closeModal()],
        ]
        refreshPanelButtons('officers_panel', buttons)
    }

    const content = ce({children:[
        createOfficersTable(officers, onSelectOfficer),
        ce({id: 'officers_panel_content'}),
    ]})

    showModal(
        `Officer Roster`,
        content,
        [
            ["Close", () => closeModal()],
        ],
        'officers_panel'
    );
}
