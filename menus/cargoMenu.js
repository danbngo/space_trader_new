function createCargoTable(cargo = new CountsMap(), onSelectCargoType = (ct = CARGO_TYPES_ALL[0])=>{}) {
    const rows = [
        ['Cargo Type', 'Amount']
    ]
    for (const ct of CARGO_TYPES_ALL) {
        rows.push([
            ct.name,
            cargo.getAmount(ct),
        ])
    }
    return createTable(rows, (rowIndex = 0)=>onSelectCargoType(CARGO_TYPES_ALL[rowIndex]))
}


function showCargoMenu(cargo = gameState.fleet.cargo) {
    const reloadMenu = ()=>showCargoMenu(cargo)

    function dumpCargo(ct = CARGO_TYPES_ALL[0], amount = 0) {
        cargo.increment(ct, -amount)
        reloadMenu()
    }

    function showDumpCargoSlider(ct = CARGO_TYPES_ALL[0], dumpableAmount = 0) {
        showSliderModal(
            1, dumpableAmount, `Buy ${ct.name}`, 
            `How many ${ct.name} would you like to dump?`,
            null,
            'Dump', 'Cancel', (amount = 0)=>dumpCargo(ct, amount), ()=>reloadMenu(),
        )
    }

    function onSelectCargoType(ct = CARGO_TYPES_ALL[0]) {
        console.log(`Selected ct: ${ct}`)
        const dumpableAmount = cargo.getAmount(ct)
        const buttons = [
            ['Dump', ()=>showDumpCargoSlider(ct, dumpableAmount), dumpableAmount == 0],
            ['Back', ()=>showPlanetMenu(planet)],
        ]
        refreshPanelButtons('cargo_panel', buttons)
    }

    showModal(
        `Cargo Manifest`,
        createElement({children:[
            createCargoTable(cargo, onSelectCargoType),
            `Your Cargo Space: ${gameState.fleet.cargo.total}/${gameState.fleet.calcTotalCargoSpace()}`,
        ]}),
        [
            ["Close", () => closeModal()],
        ],
        'cargo_panel'
    );
}
