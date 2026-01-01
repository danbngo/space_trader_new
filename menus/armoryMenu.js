/**
 * Creates an HTML table displaying armory equipment with prices.
 * @param {Equipment[]} inventory - The armory's inventory.
 * @param {(equipment: Equipment) => void} onSelectEquipment - Callback when equipment is selected.
 * @returns {HTMLTableElement|string} The equipment table or "(None)" if empty.
 */
function createArmoryTable(inventory = [], onSelectEquipment = (equipment)=>{}) {
    if (inventory.length == 0) return `(None)`
    const rows = [
        ['Name', 'Slot', 'Quality', 'Value', 'Origin']
    ]
    for (const equipment of inventory) {
        rows.push([
            equipment.name,
            equipment.equipmentType.slot.name,
            statColorSpan(roundToPlaces(equipment.quality * 100, 1) + '%', equipment.quality),
            equipment.value + 'CR',
            coloredName(equipment.planet),
        ])
    }
    return createTable(rows, (rowIndex = 0)=>onSelectEquipment(inventory[rowIndex]))
}

/**
 * Displays the armory menu for buying and selling equipment.
 * @param {Armory} armory - The armory building to interact with.
 */
function showArmoryMenu(armory = new Armory()) {
    const {planet} = armory
    const {fleet} = gs;
    const isDocked = fleet.location == planet
    const reloadMenu = ()=>showArmoryMenu(armory)

    function buyEquipment(equipment) {
        gs.credits -= equipment.value;
        gs.fleet.equipment.push(equipment);
        safeRemove(armory.inventory, equipment)
        reloadMenu()
    }

    function sellEquipment(equipment) {
        const salePrice = Math.round(equipment.value * 0.5) // Sell for 50% of value
        gs.credits += salePrice;
        armory.inventory.push(equipment)
        safeRemove(gs.fleet.equipment, equipment)
        reloadMenu()
    }

    function showBuyEquipmentModal(equipment) {
        showModal(
            `Buy ${equipment.name}`,
            ce({children: [
                `<b>${equipment.name}</b><br/>`,
                `<b>Type:</b> ${equipment.equipmentType.name}<br/>`,
                `<b>Slot:</b> ${equipment.equipmentType.slot.name}<br/>`,
                `<b>Quality:</b> ${statColorSpan(roundToPlaces(equipment.quality * 100, 1) + '%', equipment.quality)}<br/>`,
                `<b>Origin:</b> ${coloredName(equipment.planet)}<br/>`,
                `<b>Description:</b> ${equipment.equipmentType.description}<br/><br/>`,
                `<b>Price:</b> ${equipment.value}CR<br/>`,
                `<b>Your Credits:</b> ${gs.credits}CR<br/>`,
                `<b>After Purchase:</b> ${gs.credits - equipment.value}CR`,
            ]}),
            [
                ['Buy', () => buyEquipment(equipment), gs.credits < equipment.value],
                ['Cancel', () => reloadMenu()],
            ]
        )
    }

    function showSellEquipmentModal(equipment) {
        const salePrice = Math.round(equipment.value * 0.5)
        showModal(
            `Sell ${equipment.name}`,
            ce({children: [
                `<b>${equipment.name}</b><br/>`,
                `<b>Type:</b> ${equipment.equipmentType.name}<br/>`,
                `<b>Slot:</b> ${equipment.equipmentType.slot.name}<br/>`,
                `<b>Quality:</b> ${statColorSpan(roundToPlaces(equipment.quality * 100, 1) + '%', equipment.quality)}<br/><br/>`,
                `<b>Sale Price:</b> ${salePrice}CR (50% of value)<br/>`,
                `<b>Your Credits:</b> ${gs.credits}CR<br/>`,
                `<b>After Sale:</b> ${gs.credits + salePrice}CR`,
            ]}),
            [
                ['Sell', () => sellEquipment(equipment)],
                ['Cancel', () => reloadMenu()],
            ]
        )
    }

    function onSelectEquipment(equipment) {
        const buttons = [
            ...(isDocked ? [['Buy', ()=>showBuyEquipmentModal(equipment), gs.credits < equipment.value]] : []),
            ['Back', ()=>showPlanetMenu(planet)],
        ]
        refreshPanelButtons('armory_panel', buttons)
    }

    // Player's equipment that can be sold (weapons and armor)
    const playerSellableEquipment = gs.fleet.equipment.filter(e => 
        e.equipmentType.slot === EQUIPMENT_SLOTS.WEAPON || e.equipmentType.slot === EQUIPMENT_SLOTS.ARMOR
    )

    function createPlayerEquipmentTable() {
        if (playerSellableEquipment.length == 0) return `(None)`
        const rows = [
            ['Name', 'Slot', 'Quality', 'Value', 'Sale Price']
        ]
        for (const equipment of playerSellableEquipment) {
            rows.push([
                equipment.name,
                equipment.equipmentType.slot.name,
                statColorSpan(roundToPlaces(equipment.quality * 100, 1) + '%', equipment.quality),
                equipment.value + 'CR',
                Math.round(equipment.value * 0.5) + 'CR',
            ])
        }
        return createTable(rows, (rowIndex = 0)=>showSellEquipmentModal(playerSellableEquipment[rowIndex]))
    }

    let infoContainer = ce({
        children: [
            isDocked 
                ? 'Welcome to the Armory. We deal in weapons and armor.<br/>' 
                : colorSpan(`You must dock to use the armory.`, COLORS.Yellow) + '<br/>',
            `<b>Armory Inventory:</b><br/>`,
            createArmoryTable(armory.inventory, onSelectEquipment),
            `<br/><b>Your Equipment (Weapons & Armor):</b><br/>`,
            createPlayerEquipmentTable(),
            `<br/>Your Credits: ${gs.credits}CR`,
            planet.civilization ? `<br/>Inflation: ${statColorSpan(roundToPlaces(100*planet.c.inflation, 2), 2/(1+planet.c.inflation))}%`
            +` | Tax Rate: ${statColorSpan(roundToPlaces(100*planet.c.taxes, 2), 2/(1+planet.c.taxes))}%` : '',
        ]
    })

    showPlanetModal(
        planet,
        `${coloredName(planet)} - Armory`,
        infoContainer,
        [['Back', ()=>showPlanetMenu(planet)]],
        'armory_panel',
        (nextPlanet) => {
            const nextArmory = nextPlanet.settlement?.armory;
            return nextArmory ? showArmoryMenu(nextArmory) : showPlanetMenu(nextPlanet);
        }
    );
    
    // Auto-select first equipment
    if (armory.inventory.length > 0) {
        onSelectEquipment(armory.inventory[0])
    }
}
