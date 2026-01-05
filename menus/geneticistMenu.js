/**
 * Creates an HTML table displaying genetic modifications available for purchase.
 * @param {GeneticModification[]} modifications - Array of modifications for sale.
 * @param {Geneticist} geneticist - The geneticist building.
 * @param {(modification: GeneticModification) => void} onSelectModification - Callback when a modification is selected.
 * @returns {HTMLTableElement|string} The modifications table or "(None)" if no modifications.
 */
function createBuyModificationMenu(modifications = [new GeneticModification()], geneticist = new Geneticist(), onSelectModification = (modification = new GeneticModification())=>{}) {
    if (modifications.length == 0) return `(None)`
    /** @type {any[]} */
    const rows = [
        ['Modification Name', 'Quality', 'Buy Price', 'Description']
    ]
    for (const modification of modifications) {
        const buyPrice = geneticist.calcBuyModificationPrice(modification)
        rows.push([
            modification.modificationType.name,
            statColorSpan(roundToPlaces(modification.quality*100, 1)+'%', modification.quality),
            statColorSpan(buyPrice, modification.modificationType.value/buyPrice),
            modification.modificationType.description
        ])
    }
    return createTable(rows, (rowIndex = 0)=>onSelectModification(modifications[rowIndex]))
}

function leaveGeneticist(geneticist = new Geneticist()) {
    const {planet} = geneticist
    showPlanetMenu(planet)
}

function showGeneticistBuyMenu(geneticist = new Geneticist()) {
    const {planet} = geneticist
    const {fleet} = gs
    const isDocked = fleet.location == planet
    const rebuildMenu = ()=>showGeneticistBuyMenu(geneticist)
    const leave = ()=>leaveGeneticist(geneticist)

    function onSelectModification(modification = new GeneticModification()) {
        const buyPrice = geneticist.calcBuyModificationPrice(modification)
        const canAfford = gs.credits >= buyPrice
        
        // Check if player has officers/captain to apply to
        const hasOfficer = fleet.officers.length > 0 || gs.captain
        
        const canBuy = canAfford && hasOfficer && isDocked
        /** @type {ButtonData[]} */
        const buttons = [
            [`Buy & Apply`, ()=>showGeneticistApplyModificationMenu(geneticist, modification), !canBuy],
            ["Back", () => leave()],
        ]
        refreshPanelButtons('geneticist_panel', buttons)
    }

    showPlanetModal(
        planet,
        `${coloredName(planet)} - Geneticist`,
        ce({children:[
            isDocked ? 'Welcome to the genetic engineering clinic.<br/>' : colorSpan('You must dock to use the geneticist.', COLORS.Yellow) + '<br/>',
            `<b>Available Modifications</b>`,
            createBuyModificationMenu(geneticist.modifications, geneticist, (modification)=>onSelectModification(modification)),
            `Your credits: ${gs.credits} | Your Crew: Captain + ${fleet.officers.length} Officers`,
            `Buy Fee: ${statColorSpan(roundToPlaces(100*planet.c.corruption, 2), 2/(1+planet.c.corruption))}%`,
            (gs.fleet.totalSkills.getAmount(SKILLS.Barter) > 0) ? `Fee After Barter | ${statColorSpan(roundToPlaces(100*(1+geneticist.rake) - 100, 2), 2/(1+geneticist.rake))}% Buy` : '',
            planet.civilization ? `Inflation: ${statColorSpan(roundToPlaces(100*planet.c.inflation, 2), 2/(1+planet.c.inflation))}%`
            +` | Tax Rate: ${statColorSpan(roundToPlaces(100*planet.c.taxes, 2), 2/(1+planet.c.taxes))}%` : '',
        ]}),
        [
            ["Back", () => leave()],
        ],
        `geneticist_panel`,
        (nextPlanet) => nextPlanet.settlement?.geneticist ? showGeneticistBuyMenu(nextPlanet.s.geneticist) : showPlanetMenu(nextPlanet)
    );
    
    // Auto-select first modification
    if (geneticist.modifications.length > 0) {
        onSelectModification(geneticist.modifications[0])
    }
}

function showGeneticistApplyModificationMenu(geneticist = new Geneticist(), modification = new GeneticModification(), selectedOfficer = null) {
    const {fleet} = gs
    const buyPrice = geneticist.calcBuyModificationPrice(modification)

    function buyModification(modification = new GeneticModification(), officer) {
        const buyPrice = geneticist.calcBuyModificationPrice(modification)
        gs.credits -= buyPrice;
        geneticist.credits += buyPrice;
        officer.geneticModifications.push(modification)
        safeRemove(geneticist.modifications, modification)
        showGeneticistBuyMenu(geneticist)
    }

    function createOfficerSelectionTable() {
        const allCrew = [gs.captain, ...fleet.officers]
        const rows = [
            ['Name', 'Level', 'Applied Modifications']
        ]
        
        for (const officer of allCrew) {
            const appliedModNames = officer.geneticModifications.map(m => m.modificationType.name).join(', ') || '(None)'
            
            rows.push([
                officer.name + (officer === gs.captain ? ' (Captain)' : ''),
                ''+statColorSpan(officer.level, officer.level/5),
                appliedModNames,
            ])
        }
        
        return createTable(rows, (rowIndex) => onSelectOfficer(allCrew[rowIndex]), selectedOfficer ? allCrew.indexOf(selectedOfficer) + 1 : null)
    }

    function onSelectOfficer(officer) {
        const alreadyHasModification = officer.geneticModifications.some(m => m.modificationType === modification.modificationType)
        const canApply = !alreadyHasModification && gs.credits >= buyPrice
        
        /** @type {ButtonData[]} */
        const buttons = [
            ['Buy & Apply', () => buyModification(modification, officer), !canApply],
            ['Cancel', () => showGeneticistBuyMenu(geneticist)],
        ]
        refreshPanelButtons('geneticist_apply_panel', buttons)
    }
    
    showModal(
        `Apply ${coloredName(modification.modificationType)}`,
        ce({children:[
            `Select a crew member to receive this genetic modification:`,
            createOfficerSelectionTable(),
            `Modification: ${coloredName(modification.modificationType)} | Quality: ${roundToPlaces(modification.quality*100, 1)}% | Price: ${buyPrice} credits`,
            `Your Credits: ${gs.credits} | CR After Purchase: ${gs.credits - buyPrice}`,
        ]}),
        [
            ['Cancel', () => showGeneticistBuyMenu(geneticist)],
        ],
        'geneticist_apply_panel'
    )
    
    if (selectedOfficer) {
        onSelectOfficer(selectedOfficer)
    }
}
