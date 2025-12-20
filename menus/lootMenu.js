function createLootCargoTable(playerCargo = new CountsMap(), loot = new CountsMap(), onSelectCargoType = (ct = CARGO_TYPES_ALL[0])=>{}) {
    const rows = [
        ['Cargo Type', 'Loot Amt.', 'Your Amt.']
    ]
    for (const ct of CARGO_TYPES_ALL) {
        rows.push([
            ct.name,
            loot.getAmount(ct),
            playerCargo.getAmount(ct),
        ])
    }
    return createTable(rows, (rowIndex = 0)=>onSelectCargoType(CARGO_TYPES_ALL[rowIndex]))
}

function showLootMenu(loot = new CountsMap()) {
    const {fleet} = gs;
    const reloadMenu = ()=>showLootMenu(loot)

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
            1, takeableAmount, `Take ${ct.name}`, 
            `How many ${ct.name} would you like to take?`,
            (amt)=>{
                return `
                    Your Amount After Taking: ${fleet.cargo.getAmount(ct)+amt}<br/>
                    Total Cargo After Taking: ${fleet.cargo.total+amt}/${fleet.calcTotalCargoSpace()}<br/>
                `
            },
            'Take', 'Cancel', (amt = 0)=>takeCargo(ct, amt), ()=>reloadMenu(),
        )
    }

    function showDumpCargoSlider(ct = CARGO_TYPES_ALL[0], dumpableAmount = 0) {
        showSliderModal(
            1, dumpableAmount, `Dump ${ct.name}`,
            `How many ${ct.name} would you like to dump?`,
            (amt)=>{
                return `
                    Your Amount After Dumping: ${fleet.cargo.getAmount(ct)-amt}CR <br/>
                    Total Cargo After Dumping: ${fleet.cargo.totalAmt}/${fleet.calcTotalCargoSpace()}<br/>
                `
            },
            'Dump', 'Cancel', (amt = 0)=>dumpCargo(ct, amt), ()=>reloadMenu(),
        )
    }

    function onSelectCargoType(ct = CARGO_TYPES_ALL[0]) {
        const playerAmount = fleet.cargo.getAmount(ct)
        const lootAmount = loot.getAmount(ct)
        const maxLootAmount = Math.min(lootAmount, fleet.calcAvailableCargoSpace())
        const buttons = [
            ['Take', ()=>showTakeCargoSlider(ct, maxLootAmount), maxLootAmount == 0],
            ['Dump', ()=>showDumpCargoSlider(ct, playerAmount), playerAmount == 0],
            ['Finish', ()=>endEncounter()],
        ]
        refreshPanelButtons('loot_panel', buttons)
    }

    let infoContainer = ce({
        children: [
            createLootCargoTable(fleet.cargo, loot, onSelectCargoType),
            `Your Cargo Space: ${fleet.cargo.total}/${fleet.calcTotalCargoSpace()}`,
        ]
    })

    panel = showModal(
        `Loot Cargo`,
        infoContainer,
        [['Continue', ()=>endEncounter()]],
        'loot_panel'
    );
}
