/**
 * Creates an HTML table displaying the player's officers.
 * @param {Officer[]} officers - Array of officers to display.
 * @param {(officer: Officer) => void} onSelectOfficer - Callback when officer is selected.
 * @returns {HTMLTableElement|string} The officers table or "(None)" if no officers.
 */
function createOfficersTable(officers = [new Officer()], onSelectOfficer = (officer = new Officer())=>{}) {
    if (officers.length == 0) return `(None)`
    const rows = [
        ['Name', 'Piloting', 'Age', 'Level', 'CR Share', ...SKILLS_ALL]
    ]
    for (const officer of officers) {
        const assignedShip = gs.fleet.getAssignedShip(officer)
        const shipName = assignedShip ? assignedShip.name : colorSpan('(None)', COLORS.Gray)
        rows.push([
            officer.name,
            shipName,
            ''+officer.age,
            ''+statColorSpan(officer.level, officer.level/5),
            ''+statColorSpan(officer.crShare*100+'%', 5/officer.level),
            ...SKILLS_ALL.map(sk=>''+statColorSpan(officer.skills.getAmount(sk), officer.skills.getAmount(sk)*SKILLS_ALL.length/5/SKILL_POINTS_PER_LEVEL)),
        ])
    }
    return createTable(rows, (rowIndex = 0)=>onSelectOfficer(officers[rowIndex]))
}
/**
 * Displays the officers roster menu for managing hired officers.
 * @param {Officer[]} officers - Array of officers to display.
 */
function showOfficersMenu(officers = gs.fleet.officers) {
    const reloadMenu = ()=>showOfficersMenu(officers)

    function fireOfficer(officer = new Officer()) {
        safeRemove(gs.fleet.officers, officer)
        showOfficersMenu(officers) //DONT use reloadMenu here, wont reflect changes to ship list
    }

    function showFireOfficerModal(officer = new Officer()) {
        showModal(`Fire ${officer.name}`, 
            `Fire ${officer.name}?`,
            [
                ["Fire", () => fireOfficer(officer)],
                ["Cancel", () => reloadMenu()],
            ]
        )
    }

    function onSelectOfficer(officer = new Officer()) {
        const implantsText = officer.implants.length > 0 
            ? officer.implants.map(i => colorSpan(i.implantType.name, i.implantType.color) + ` (${roundToPlaces(i.quality*100, 1)}%)`).join(', ')
            : colorSpan('(None)', COLORS.Gray)
        
        const assignedShip = gs.fleet.getAssignedShip(officer)
        const pilotingText = assignedShip ? assignedShip.name : colorSpan('(None)', COLORS.Gray)
        
        const buttons = [
            ['Fire', ()=>showFireOfficerModal(officer), gs.fleet.numPilots <= gs.fleet.ships.length],
            ["Close", () => closeModal()],
        ]
        
        const infoPanel = ce({children: [
            `<b>${officer.name}</b> (Level ${officer.level})<br/>`,
            `<b>Piloting:</b> ${pilotingText}<br/>`,
            `<b>Skills:</b> `,
            SKILLS_ALL.map(sk => `${sk}: ${officer.skills.getAmount(sk)}`).join(', '),
            `<br/><br/><b>Cybernetic Implants:</b><br/>`,
            implantsText,
        ]})
        
        const modalContent = document.getElementById('officers_panel_content')
        if (modalContent) {
            modalContent.innerHTML = ''
            modalContent.appendChild(infoPanel)
        }
        
        refreshPanelButtons('officers_panel', buttons)
    }

    showModal(
        `Officer Roster`,
        ce({children:[
            createOfficersTable(officers, onSelectOfficer),
            ce({id: 'officers_panel_content'}),
        ]}),
        [
            ["Close", () => closeModal()],
        ],
        'officers_panel'
    );
}
