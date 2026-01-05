/**
 * Creates an HTML table displaying cybernetic implants available for purchase.
 * @param {CyberImplant[]} implants - Array of implants for sale.
 * @param {CyberSurgeon} cyberSurgeon - The cyber surgeon building.
 * @param {(implant: CyberImplant) => void} onSelectImplant - Callback when an implant is selected.
 * @returns {HTMLTableElement|string} The implants table or "(None)" if no implants.
 */
function createBuyImplantMenu(implants = [new CyberImplant()], cyberSurgeon = new CyberSurgeon(), onSelectImplant = (implant = new CyberImplant())=>{}) {
    if (implants.length == 0) return `(None)`
    /** @type {any[]} */
    const rows = [
        ['Implant Name', 'Quality', 'Buy Price', 'Description']
    ]
    for (const implant of implants) {
        const buyPrice = cyberSurgeon.calcBuyImplantPrice(implant)
        rows.push([
            implant.implantType.name,
            statColorSpan(roundToPlaces(implant.quality*100, 1)+'%', implant.quality),
            statColorSpan(buyPrice, implant.implantType.value/buyPrice),
            implant.implantType.description
        ])
    }
    return createTable(rows, (rowIndex = 0)=>onSelectImplant(implants[rowIndex]))
}

function leaveCyberSurgeon(cyberSurgeon = new CyberSurgeon()) {
    const {planet} = cyberSurgeon
    showPlanetMenu(planet)
}

function showCyberSurgeonBuyMenu(cyberSurgeon = new CyberSurgeon()) {
    const {planet} = cyberSurgeon
    const {fleet} = gs
    const isDocked = fleet.location == planet
    const rebuildMenu = ()=>showCyberSurgeonBuyMenu(cyberSurgeon)
    const leave = ()=>leaveCyberSurgeon(cyberSurgeon)

    function onSelectImplant(implant = new CyberImplant()) {
        const buyPrice = cyberSurgeon.calcBuyImplantPrice(implant)
        const canAfford = gs.credits >= buyPrice
        
        // Check if player has officers/captain to install on
        const hasOfficer = fleet.officers.length > 0 || gs.captain
        
        const canBuyAndInstall = canAfford && hasOfficer && isDocked
        const canTake = canAfford && isDocked
        /** @type {ButtonData[]} */
        const buttons = [
            [`Buy & Install`, ()=>showCyberSurgeonInstallImplantMenu(cyberSurgeon, implant), !canBuyAndInstall],
            [`Take With Me`, ()=>{
                gs.credits -= buyPrice
                cyberSurgeon.credits += buyPrice
                fleet.cyberModules.push(implant)
                safeRemove(cyberSurgeon.implants, implant)
                showCyberSurgeonBuyMenu(cyberSurgeon)
            }, !canTake],
            ["Back", () => leave()],
        ]
        refreshPanelButtons('cyber_surgeon_panel', buttons)
    }

    showPlanetModal(
        planet,
        `${coloredName(planet)} - Cyber Surgeon`,
        ce({children:[
            isDocked ? 'Welcome to the cyber surgeon clinic.<br/>' : colorSpan('You must dock to use the cyber surgeon.', COLORS.Yellow) + '<br/>',
            `<b>Available Implants</b>`,
            createBuyImplantMenu(cyberSurgeon.implants, cyberSurgeon, (implant)=>onSelectImplant(implant)),
            `<br/><b>Your Fleet's Implants:</b> ${fleet.cyberModules.length > 0 ? fleet.cyberModules.map(i => i.implantType.name).join(', ') : '(None)'}<br/>`,
            `Your credits: ${gs.credits} | Your Crew: Captain + ${fleet.officers.length} Officers`,
            `Buy Fee: ${statColorSpan(roundToPlaces(100*planet.c.corruption, 2), 2/(1+planet.c.corruption))}%`,
            (gs.fleet.totalSkills.getAmount(SKILLS.Barter) > 0) ? `Fee After Barter | ${statColorSpan(roundToPlaces(100*(1+cyberSurgeon.rake) - 100, 2), 2/(1+cyberSurgeon.rake))}% Buy` : '',
            planet.civilization ? `Inflation: ${statColorSpan(roundToPlaces(100*planet.c.inflation, 2), 2/(1+planet.c.inflation))}%`
            +` | Tax Rate: ${statColorSpan(roundToPlaces(100*planet.c.taxes, 2), 2/(1+planet.c.taxes))}%` : '',
        ]}),
        [
            ["Install Fleet Implant", () => showFleetImplantsMenu(cyberSurgeon), fleet.cyberModules.length === 0],
            ["Back", () => leave()],
        ],
        `cyber_surgeon_panel`,
        (nextPlanet) => nextPlanet.settlement?.cyberSurgeon ? showCyberSurgeonBuyMenu(nextPlanet.s.cyberSurgeon) : showPlanetMenu(nextPlanet)
    );
    
    // Auto-select first implant
    if (cyberSurgeon.implants.length > 0) {
        onSelectImplant(cyberSurgeon.implants[0])
    }
}

function showFleetImplantsMenu(cyberSurgeon = new CyberSurgeon()) {
    const {fleet} = gs
    const {planet} = cyberSurgeon
    
    function onSelectFleetImplant(implant = new CyberImplant()) {
        /** @type {ButtonData[]} */
        const buttons = [
            ['Install', () => showCyberSurgeonInstallImplantMenu(cyberSurgeon, implant, null, true)],
            ['Back', () => showCyberSurgeonBuyMenu(cyberSurgeon)],
        ]
        refreshPanelButtons('fleet_implants_panel', buttons)
    }
    
    // Create table of fleet implants
    const implantRows = [
        ['Implant Name', 'Quality', 'Value', 'Description']
    ]
    for (const implant of fleet.cyberModules) {
        implantRows.push([
            implant.implantType.name,
            statColorSpan(roundToPlaces(implant.quality*100, 1)+'%', implant.quality),
            ''+implant.value,
            implant.implantType.description
        ])
    }
    
    const implantTable = createTable(implantRows, (rowIndex) => onSelectFleetImplant(fleet.cyberModules[rowIndex]))
    
    showModal(
        'Fleet Implants',
        ce({children:[
            `Select an implant from your fleet's inventory to install:<br/>`,
            implantTable,
        ]}),
        [
            ['Back', () => showCyberSurgeonBuyMenu(cyberSurgeon)],
        ],
        'fleet_implants_panel'
    )
    
    if (fleet.cyberModules.length > 0) {
        onSelectFleetImplant(fleet.cyberModules[0])
    }
}

function showCyberSurgeonInstallImplantMenu(cyberSurgeon = new CyberSurgeon(), implant = new CyberImplant(), selectedOfficer = null, isFromFleet = false) {
    const {fleet} = gs
    const buyPrice = isFromFleet ? 0 : cyberSurgeon.calcBuyImplantPrice(implant)

    function buyImplant(implant = new CyberImplant(), officer) {
        const buyPrice = isFromFleet ? 0 : cyberSurgeon.calcBuyImplantPrice(implant)
        gs.credits -= buyPrice;
        if (!isFromFleet) {
            cyberSurgeon.credits += buyPrice;
            safeRemove(cyberSurgeon.implants, implant)
        } else {
            safeRemove(fleet.cyberModules, implant)
        }
        officer.implants.push(implant)
        showCyberSurgeonBuyMenu(cyberSurgeon)
    }

    function createOfficerSelectionTable() {
        const allCrew = [gs.captain, ...fleet.officers]
        const rows = [
            ['Name', 'Level', 'Installed Implants']
        ]
        
        for (const officer of allCrew) {
            const installedImplantNames = officer.implants.map(i => i.implantType.name).join(', ') || '(None)'
            
            rows.push([
                officer.name + (officer === gs.captain ? ' (Captain)' : ''),
                ''+statColorSpan(officer.level, officer.level/5),
                installedImplantNames,
            ])
        }
        
        return createTable(rows, (rowIndex) => onSelectOfficer(allCrew[rowIndex]), selectedOfficer ? allCrew.indexOf(selectedOfficer) + 1 : null)
    }

    function onSelectOfficer(officer) {
        const alreadyHasImplant = officer.implants.some(i => i.implantType === implant.implantType)
        const canInstall = !alreadyHasImplant && (isFromFleet || gs.credits >= buyPrice)
        /** @type {ButtonData[]} */
        const buttons = [
            [isFromFleet ? 'Install' : 'Buy & Install', () => buyImplant(implant, officer), !canInstall],
            ['Cancel', () => showCyberSurgeonBuyMenu(cyberSurgeon)],
        ]
        refreshPanelButtons('cyber_surgeon_install_panel', buttons)
    }
    
    showModal(
        `Install ${coloredName(implant.implantType)}`,
        ce({children:[
            `Select a crew member to install this implant:`,
            createOfficerSelectionTable(),
            `Implant: ${coloredName(implant.implantType)} | Quality: ${roundToPlaces(implant.quality*100, 1)}%${isFromFleet ? ' (From Fleet)' : ' | Price: ' + buyPrice + ' credits'}`,
            isFromFleet ? '' : `Your Credits: ${gs.credits} | CR After Purchase: ${gs.credits - buyPrice}`,
        ]}),
        [
            ['Cancel', () => showCyberSurgeonBuyMenu(cyberSurgeon)],
        ],
        'cyber_surgeon_install_panel'
    )
    
    if (selectedOfficer) {
        onSelectOfficer(selectedOfficer)
    }
}
