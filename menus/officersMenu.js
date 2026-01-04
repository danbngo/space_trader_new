/**
 * Creates an HTML table displaying the player's officers.
 * @param {Officer[]} officers - Array of officers to display.
 * @param {(officer: Officer) => void} onSelectOfficer - Callback when officer is selected.
 * @returns {HTMLTableElement|string} The officers table or "(None)" if no officers.
 */
function createOfficersTable(officers = [new Officer()], onSelectOfficer = (officer = new Officer())=>{}) {
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
 * Shows equipment management menu for a specific officer.
 * @param {Officer} officer - The officer to manage equipment for.
 */
function showEquipmentMenu(officer = new Officer()) {
    const reloadMenu = () => showEquipmentMenu(officer)

    function equipItem(equipment) {
        const slot = equipment.equipmentType.slot
        // Unequip existing item in that slot
        if (officer.equipment.has(slot)) {
            const oldEquipment = officer.equipment.get(slot)
            gs.fleet.equipment.push(oldEquipment)
        }
        // Equip new item
        officer.equipment.set(slot, equipment)
        safeRemove(gs.fleet.equipment, equipment)
        reloadMenu()
    }

    function unequipItem(slot = EQUIPMENT_SLOTS.HEAD) {
        if (officer.equipment.has(slot)) {
            const equipment = officer.equipment.get(slot)
            gs.fleet.equipment.push(equipment)
            officer.equipment.delete(slot)
        }
        reloadMenu()
    }

    function showEquipModal(slot = EQUIPMENT_SLOTS.HEAD) {
        const availableEquipment = gs.fleet.equipment.filter(e => e.equipmentType.slot === slot)
        
        if (availableEquipment.length === 0) {
            showModal(`Equip ${slot.name}`, 
                `No ${slot.name.toLowerCase()} equipment available.`,
                [["Close", () => reloadMenu()]]
            )
            return
        }

        const rows = [['Name', 'Quality', 'Value']]
        for (const equipment of availableEquipment) {
            rows.push([
                equipment.name,
                statColorSpan(roundToPlaces(equipment.quality * 100, 1) + '%', equipment.quality),
                equipment.value + 'CR',
            ])
        }

        showModal(
            `Equip ${slot.name} for ${officer.name}`,
            createTable(rows, (rowIndex) => equipItem(availableEquipment[rowIndex])),
            [["Cancel", () => reloadMenu()]]
        )
    }

    const equipmentRows = []
    
    for (const slot of EQUIPMENT_SLOTS_ALL) {
        const equipped = officer.equipment.get(slot)
        const equippedText = equipped 
            ? `${equipped.name} (${statColorSpan(roundToPlaces(equipped.quality * 100, 1) + '%', equipped.quality)})`
            : colorSpan('(Empty)', COLORS.Gray)
        
        equipmentRows.push(ce({children: [
            `<b>${slot.name}:</b> ${equippedText} `,
            ce({
                tag: 'button',
                innerHTML: equipped ? 'Unequip' : 'Equip',
                onClick: equipped ? () => unequipItem(slot) : () => showEquipModal(slot)
            }),
            '<br/>'
        ]}))
    }

    // Create cyber implants section
    const implantsRows = []
    if (officer.implants && officer.implants.length > 0) {
        for (const implant of officer.implants) {
            implantsRows.push(ce({children: [
                `${colorSpan(implant.implantType.name, implant.implantType.color)} (${roundToPlaces(implant.quality*100, 1)}%)`,
                '<br/>'
            ]}))
        }
    } else {
        implantsRows.push(colorSpan('(None)', COLORS.Gray))
    }

    const equipmentColumn = ce({children: [
        `<b>Equipment</b><br/>`,
        `Available: ${gs.fleet.equipment.length} items<br/><br/>`,
        ...equipmentRows,
    ]})

    const implantsColumn = ce({children: [
        `<b>Cyber Implants</b><br/><br/>`,
        ...implantsRows,
    ]})

    const content = ce({children: [
        `<b>${officer.name}</b> (Level ${officer.level})<br/><br/>`,
        createColumnLayout([equipmentColumn, implantsColumn]),
    ]})

    showModal(
        `Equipment - ${officer.name}`,
        content,
        [
            ["Back", () => showOfficersMenu()],
            ["Close", () => closeModal()],
        ]
    );
}

/**
 * Displays the officers roster menu for managing hired officers.
 * @param {Officer[]} officers - Array of officers to display.
 */
function showOfficersMenu(officers = gs.fleet.officers.filter(o => o !== gs.captain)) {
    const reloadMenu = ()=>showOfficersMenu(gs.fleet.officers.filter(o => o !== gs.captain))

    function fireOfficer(officer = new Officer()) {
        safeRemove(gs.fleet.officers, officer)
        showOfficersMenu(gs.fleet.officers.filter(o => o !== gs.captain)) //DONT use reloadMenu here, wont reflect changes to ship list
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

    let selectedOfficer = null

    function onSelectOfficer(officer = new Officer()) {
        selectedOfficer = officer
        const isCaptain = officer === gs.captain
        const notEnoughPilots = gs.fleet.numPilots <= gs.fleet.ships.length
        /** @type {ButtonData[]} */
        const buttons = [
            ['Equipment', () => showEquipmentMenu(officer)],
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
