function createOfficersTable(officers = [new Officer()], onSelectOfficer = (officer = new Officer())=>{}) {
    if (officers.length == 0) return `(None)`
    const rows = [
        ['Name', 'Level', 'CR Share', ...SKILLS_ALL]
    ]
    for (const officer of officers) {
        rows.push([
            officer.name,
            ''+statColorSpan(officer.level, officer.level/5),
            ''+statColorSpan(officer.crShare*100+'%', 5/officer.level),
            ...SKILLS_ALL.map(sk=>''+statColorSpan(officer.skills.getAmount(sk), officer.skills.getAmount(sk)*SKILLS_ALL.length/5/SKILL_POINTS_PER_LEVEL)),
        ])
    }
    return createTable(rows, (rowIndex = 0)=>onSelectOfficer(officers[rowIndex]))
}

function showOfficersMenu(officers = gs.fleet.officers) {
    const reloadMenu = ()=>showOfficersMenu(officers)

    function fireOfficer(officer = new Officer()) {
        safeRemove(gs.fleet.officers, officer)
        showOfficersMenu(officers) //DONT use reloadMenu here, wont reflect changes to ship list
    }

    function showFireOfficerModal(officer = new Officer()) {
        showModal(`Fire ${officer.name}`, 
            `Are you sure you want to fire ${officer.name}?`,
            [
                ["Fire", () => fireOfficer(officer)],
                ["Cancel", () => reloadMenu()],
            ]
        )
    }

    function onSelectOfficer(officer = new Officer()) {
        const buttons = [
            ['Fire', ()=>showFireOfficerModal(officer), gs.fleet.numPilots <= gs.fleet.ships.length],
            ["Close", () => closeModal()],
        ]
        refreshPanelButtons('officers_panel', buttons)
    }

    showModal(
        `Officer Roster`,
        ce({children:[
            createOfficersTable(officers, onSelectOfficer),
        ]}),
        [
            ["Close", () => closeModal()],
        ],
        'officers_panel'
    );
}
