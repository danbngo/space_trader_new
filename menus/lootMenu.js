/**
 * Creates an HTML table comparing player cargo and available loot.
 * @param {CountsMap} playerCargo - The player's current cargo.
 * @param {CountsMap} loot - The available loot cargo.
 * @param {(cargoType: CargoType) => void} onSelectCargoType - Callback when cargo type is selected.
 * @returns {HTMLTableElement} The cargo comparison table.
 */
function createLootCargoTable(playerCargo = new CountsMap(), loot = new CountsMap(), onSelectCargoType = (ct = CARGO_TYPES_ALL[0])=>{}) {
    const rows = [
        ['Cargo Type', 'Loot Amt.', 'Your Amt.']
    ]
    for (const ct of CARGO_TYPES_ALL) {
        rows.push([
            `${ct.symbol} ${ct.name}`,
            ''+loot.getAmount(ct),
            ''+playerCargo.getAmount(ct),
        ])
    }
    return createTable(rows, (rowIndex = 0)=>onSelectCargoType(CARGO_TYPES_ALL[rowIndex]))
}
/**
 * Displays the loot menu for taking or dumping cargo after combat.
 * @param {CountsMap} loot - The available loot to collect.
 */
function showLootMenu(loot = new CountsMap(), overburdenedMode = false) {
    const {fleet} = gs;
    const reloadMenu = ()=>showLootMenu(loot, overburdenedMode)

    function takeCargo(ct = CARGO_TYPES_ALL[0], amt = 0) {
        fleet.cargo.increment(ct, amt)
        loot.increment(ct, -amt)
        reloadMenu()
    }
    function dumpCargo(ct = CARGO_TYPES_ALL[0], amt = 0) {
        fleet.cargo.increment(ct, -amt)
        loot.increment(ct, amt)
        reloadMenu()
    }

    function showTakeCargoSlider(ct = CARGO_TYPES_ALL[0], takeableAmount = 0) {
        showSliderModal(
            1, takeableAmount, `Take ${coloredName(ct)}`, 
            `How many ${coloredName(ct)} would you like to take?`,
            (amt)=>{
                return `
                    Your Amount After Taking: ${fleet.cargo.getAmount(ct)+amt}<br/>
                    Total Cargo After Taking: ${fleet.cargo.total+amt}/${fleet.totalCargoSpace}<br/>
                `
            },
            'Take', 'Cancel', 
            (amt = 0)=>takeCargo(ct, amt), 
            ()=>reloadMenu(),
            'Take All',
            ()=>takeCargo(ct, takeableAmount)
        )
    }

    function showDumpCargoSlider(ct = CARGO_TYPES_ALL[0], dumpableAmount = 0) {
        showSliderModal(
            1, dumpableAmount, `Dump ${coloredName(ct)}`,
            `How many ${coloredName(ct)} would you like to dump?`,
            (amt)=>{
                return `
                    Your Amount After Dumping: ${fleet.cargo.getAmount(ct)-amt}CR <br/>
                    Total Cargo After Dumping: ${fleet.cargo.total}/${fleet.totalCargoSpace}<br/>
                `
            },
            'Dump', 'Cancel', 
            (amt = 0)=>dumpCargo(ct, amt), 
            ()=>reloadMenu(),
            'Dump All',
            ()=>dumpCargo(ct, dumpableAmount)
        )
    }

    function onSelectCargoType(ct = CARGO_TYPES_ALL[0]) {
        const playerAmount = fleet.cargo.getAmount(ct)
        const lootAmount = loot.getAmount(ct)
        const maxLootAmount = Math.min(lootAmount, fleet.availableCargoSpace)

        console.log('selected cargo type, vars:', {ct, playerAmount, lootAmount, maxLootAmount, availableCargoSpace: fleet.availableCargoSpace, loot})
        /** @type {ButtonData[]} */
        const buttons = [
            ['Take', ()=>showTakeCargoSlider(ct, maxLootAmount), maxLootAmount == 0],
            ['Dump', ()=>showDumpCargoSlider(ct, playerAmount), playerAmount == 0],
            ['Finish', ()=>gs.encounter.endEncounter()],
        ]
        refreshPanelButtons('loot_panel', buttons)
    }

    function takeAllLoot() {
        let availableSpace = fleet.availableCargoSpace
        // Sort cargo types by value (highest first) to prioritize valuable cargo
        const sortedCargoTypes = [...CARGO_TYPES_ALL].sort((a, b) => b.value - a.value)
        for (const ct of sortedCargoTypes) {
            const lootAmount = loot.getAmount(ct)
            if (lootAmount > 0 && availableSpace > 0) {
                const amountToTake = Math.min(lootAmount, availableSpace)
                fleet.cargo.increment(ct, amountToTake)
                loot.increment(ct, -amountToTake)
                availableSpace -= amountToTake
            }
        }
        reloadMenu()
    }

    let infoContainer = ce({
        children: [
            createLootCargoTable(fleet.cargo, loot, onSelectCargoType),
            `Your Cargo Space: ${fleet.cargo.total}/${fleet.totalCargoSpace}`,
        ]
    })

    const isOverburdened = fleet.cargo.total > fleet.totalCargoSpace
    const continueDisabledReason = isOverburdened ? `Must dump ${fleet.cargo.total - fleet.totalCargoSpace} more units of cargo` : ''
    const continueHandler = ()=>{
        if (gs.encounter) gs.encounter.endEncounter()
        closeModal()
    }

    showModal(
        overburdenedMode ? `Overburdened - Dump Cargo` : `Loot Cargo`,
        infoContainer,
        [
            ['Take All', ()=>takeAllLoot(), fleet.availableCargoSpace == 0 || loot.total == 0],
            ['Continue', continueHandler, isOverburdened, continueDisabledReason]
        ],
        'loot_panel'
    );
}
