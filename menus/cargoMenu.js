/**
 * Creates an HTML table displaying cargo amounts by type.
 * @param {CountsMap} cargo - The cargo inventory to display.
 * @param {(cargoType: CargoType) => void} onSelectCargoType - Callback when a cargo type is selected.
 * @returns {HTMLTableElement} The cargo table element.
 */
function createCargoTable(cargo = new CountsMap(), onSelectCargoType = (ct = CARGO_TYPES_ALL[0])=>{}) {
    const rows = [
        ['Cargo Type', 'Amount']
    ]
    for (const ct of CARGO_TYPES_ALL) {
        rows.push([
            `${ct.symbol} ${ct.name}`,
            ''+cargo.getAmount(ct),
        ])
    }
    return createTable(rows, (rowIndex = 0)=>onSelectCargoType(CARGO_TYPES_ALL[rowIndex]))
}

/**
 * Displays the cargo management menu for viewing and dumping cargo.
 * @param {CountsMap} cargo - The cargo inventory to manage.
 */
function showCargoMenu(cargo = gs.fleet.cargo) {
    const reloadMenu = ()=>showCargoMenu(cargo)

    function dumpCargo(ct = CARGO_TYPES_ALL[0], amt = 0) {
        cargo.increment(ct, -amt)
        reloadMenu()
    }

    function showDumpCargoSlider(ct = CARGO_TYPES_ALL[0], dumpableAmount = 0) {
        showSliderModal(
            1, dumpableAmount, `Buy ${ct.name}`, 
            `How many ${ct.name} would you like to dump?`,
            null,
            'Dump', 'Cancel', (amt = 0)=>dumpCargo(ct, amt), ()=>reloadMenu(),
        )
    }

    function onSelectCargoType(ct = CARGO_TYPES_ALL[0]) {
        console.log(`Selected ct: ${ct}`)
        const dumpableAmount = cargo.getAmount(ct)
        const buttons = [
            ['Dump', ()=>showDumpCargoSlider(ct, dumpableAmount), dumpableAmount == 0],
            ["Close", () => closeModal()],
        ]
        refreshPanelButtons('cargo_panel', buttons)
    }

    showModal(
        `Cargo Manifest`,
        ce({children:[
            createCargoTable(cargo, onSelectCargoType),
            `Your Cargo Space: ${gs.fleet.cargo.total}/${gs.fleet.totalCargoSpace}`,
        ]}),
        [
            ["Close", () => closeModal()],
        ],
        'cargo_panel'
    );
}
