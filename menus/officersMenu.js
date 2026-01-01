/**
 * Creates an HTML table displaying the player's officers.
 * @param {Officer[]} officers - Array of officers to display.
 * @param {(officer: Officer) => void} onSelectOfficer - Callback when officer is selected.
 * @returns {HTMLTableElement|string} The officers table or "(None)" if no officers.
 */
function createOfficersTable(officers = [new Officer()], onSelectOfficer = (officer = new Officer())=>{}) {
    if (officers.length == 0) return `(None)`
    const rows = [
        ['Name', 'Race', 'Religion', 'Piloting', 'Age', 'Level', 'CR Share', ...SKILLS_ALL]
    ]
    for (const officer of officers) {
        const assignedShip = gs.fleet.getAssignedShip(officer)
        const shipName = assignedShip ? assignedShip.name : colorSpan('(None)', COLORS.Gray)
        const raceDisplay = officer.race ? `${officer.race.icon} ${officer.race.name}` : 'Human'
        const religionDisplay = officer.religion ? `${officer.religion.icon} ${officer.religion.name}` : ''
        rows.push([
            officer.name,
            raceDisplay,
            religionDisplay,
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
 * @param {string} tab - Which tab to show ('roster' or 'equipment')
 */
function showOfficersMenu(officers = gs.fleet.officers, tab = 'roster') {
    const reloadMenu = (newTab = tab)=>showOfficersMenu(officers, newTab)

    function fireOfficer(officer = new Officer()) {
        safeRemove(gs.fleet.officers, officer)
        showOfficersMenu(officers, tab) //DONT use reloadMenu here, wont reflect changes to ship list
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
        
        const raceText = officer.race ? `${officer.race.icon} ${colorSpan(officer.race.name, officer.race.color)}` : 'Human'
        const religionText = officer.religion ? `✦ ${colorSpan(officer.religion.name, officer.religion.color)}` : colorSpan('(None)', COLORS.Gray)
        
        const buttons = [
            ['Fire', ()=>showFireOfficerModal(officer), gs.fleet.numPilots <= gs.fleet.ships.length],
            ["Close", () => closeModal()],
        ]
        
        const infoPanel = ce({children: [
            `<b>${officer.name}</b> (Level ${officer.level})<br/>`,
            `<b>Race:</b> ${raceText}<br/>`,
            `<b>Religion:</b> ${religionText}<br/>`,
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

    // Equipment management functions
    function equipItem(officer = new Officer(), equipment) {
        const slot = equipment.equipmentType.slot
        // Unequip existing item in that slot
        if (officer.equipment.has(slot)) {
            const oldEquipment = officer.equipment.get(slot)
            gs.fleet.equipment.push(oldEquipment)
        }
        // Equip new item
        officer.equipment.set(slot, equipment)
        safeRemove(gs.fleet.equipment, equipment)
        reloadMenu('equipment')
    }

    function unequipItem(officer = new Officer(), slot = EQUIPMENT_SLOTS.HEAD) {
        if (officer.equipment.has(slot)) {
            const equipment = officer.equipment.get(slot)
            gs.fleet.equipment.push(equipment)
            officer.equipment.delete(slot)
        }
        reloadMenu('equipment')
    }

    function showEquipModal(officer = new Officer(), slot = EQUIPMENT_SLOTS.HEAD) {
        const availableEquipment = gs.fleet.equipment.filter(e => e.equipmentType.slot === slot)
        
        if (availableEquipment.length === 0) {
            showModal(`Equip ${slot.name}`, 
                `No ${slot.name.toLowerCase()} equipment available.`,
                [["Close", () => reloadMenu('equipment')]]
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
            createTable(rows, (rowIndex) => equipItem(officer, availableEquipment[rowIndex])),
            [["Cancel", () => reloadMenu('equipment')]]
        )
    }

    function createEquipmentManagementPanel() {
        const panels = []
        
        for (const officer of officers) {
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
                        onClick: equipped ? () => unequipItem(officer, slot) : () => showEquipModal(officer, slot)
                    }),
                    '<br/>'
                ]}))
            }

            panels.push(ce({children: [
                `<br/><b>${officer.name}</b> (Level ${officer.level})<br/>`,
                ...equipmentRows,
            ]}))
        }

        return ce({children: [
            `<b>Available Equipment:</b> ${gs.fleet.equipment.length} items<br/>`,
            ...panels,
        ]})
    }

    const content = tab === 'roster' 
        ? ce({children:[
            createOfficersTable(officers, onSelectOfficer),
            ce({id: 'officers_panel_content'}),
        ]})
        : createEquipmentManagementPanel()

    showModal(
        `Officer ${tab === 'roster' ? 'Roster' : 'Equipment'}`,
        content,
        [
            [tab === 'roster' ? 'Equipment' : 'Roster', () => reloadMenu(tab === 'roster' ? 'equipment' : 'roster')],
            ["Close", () => closeModal()],
        ],
        'officers_panel'
    );
}
