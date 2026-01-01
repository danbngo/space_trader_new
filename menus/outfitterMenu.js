/**
 * Creates an HTML table displaying outfitter equipment with prices.
 * @param {Equipment[]} inventory - The outfitter's inventory.
 * @param {(equipment: Equipment) => void} onSelectEquipment - Callback when equipment is selected.
 * @returns {HTMLTableElement|string} The equipment table or "(None)" if empty.
 */
function createOutfitterTable(inventory = [], onSelectEquipment = (equipment)=>{}) {
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
 * Displays the outfitter menu for buying and selling equipment.
 * @param {Outfitter} outfitter - The outfitter building to interact with.
 */
function showOutfitterMenu(outfitter = new Outfitter()) {
    const {planet} = outfitter
    const {fleet} = gs;
    const isDocked = fleet.location == planet
    const reloadMenu = ()=>showOutfitterMenu(outfitter)

    /**
     * Buys equipment from the outfitter.
     * @param {Equipment} equipment - The equipment to purchase.
     */
    function buyEquipment(equipment) {
        gs.credits -= equipment.value;
        gs.fleet.equipment.push(equipment);
        safeRemove(outfitter.inventory, equipment)
        reloadMenu()
    }

    /**
     * Sells equipment to the outfitter for 50% of its value.
     * @param {Equipment} equipment - The equipment to sell.
     */
    function sellEquipment(equipment) {
        const salePrice = Math.round(equipment.value * 0.5) // Sell for 50% of value
        gs.credits += salePrice;
        outfitter.inventory.push(equipment)
        safeRemove(gs.fleet.equipment, equipment)
        reloadMenu()
    }

    /**
     * Shows a confirmation modal for purchasing equipment.
     * @param {Equipment} equipment - The equipment to buy.
     */
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

    /**
     * Shows a confirmation modal for selling equipment.
     * @param {Equipment} equipment - The equipment to sell.
     */
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

    /**
     * Handles equipment selection from the outfitter inventory table.
     * @param {Equipment} equipment - The selected equipment.
     */
    function onSelectEquipment(equipment) {
        const buttons = [
            ...(isDocked ? [['Buy', ()=>showBuyEquipmentModal(equipment), gs.credits < equipment.value]] : []),
            ['Back', ()=>showPlanetMenu(planet)],
        ]
        refreshPanelButtons('outfitter_panel', buttons)
    }

    // Player's equipment that can be sold (tools and headgear)
    const playerSellableEquipment = gs.fleet.equipment.filter(e => 
        e.equipmentType.slot === EQUIPMENT_SLOTS.TOOL || e.equipmentType.slot === EQUIPMENT_SLOTS.HEAD
    )

    /**
     * Creates a table showing the player's sellable equipment (tools and headgear).
     * @returns {HTMLTableElement|string} The equipment table or "(None)" if no sellable equipment.
     */
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
                ? 'Welcome to the Outfitter. We provide tools and protective gear.<br/>' 
                : colorSpan(`You must dock to use the outfitter.`, COLORS.Yellow) + '<br/>',
            `<b>Outfitter Inventory:</b><br/>`,
            createOutfitterTable(outfitter.inventory, onSelectEquipment),
            `<br/><b>Your Equipment (Tools & Headgear):</b><br/>`,
            createPlayerEquipmentTable(),
            `<br/>Your Credits: ${gs.credits}CR`,
            planet.civilization ? `<br/>Inflation: ${statColorSpan(roundToPlaces(100*planet.c.inflation, 2), 2/(1+planet.c.inflation))}%`
            +` | Tax Rate: ${statColorSpan(roundToPlaces(100*planet.c.taxes, 2), 2/(1+planet.c.taxes))}%` : '',
        ]
    })

    showPlanetModal(
        planet,
        `${coloredName(planet)} - Outfitter`,
        infoContainer,
        [['Back', ()=>showPlanetMenu(planet)]],
        'outfitter_panel',
        (nextPlanet) => {
            const nextOutfitter = nextPlanet.settlement?.outfitter;
            return nextOutfitter ? showOutfitterMenu(nextOutfitter) : showPlanetMenu(nextPlanet);
        }
    );
    
    // Auto-select first equipment
    if (outfitter.inventory.length > 0) {
        onSelectEquipment(outfitter.inventory[0])
    }
}
