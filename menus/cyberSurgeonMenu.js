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
        
        const canBuy = canAfford && hasOfficer && isDocked
        const buttons = [
            [`Buy & Install`, ()=>showCyberSurgeonInstallImplantMenu(cyberSurgeon, implant), !canBuy],
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
            `Your credits: ${gs.credits} | Your Crew: Captain + ${fleet.officers.length} Officers`,
            `Buy Fee: ${statColorSpan(roundToPlaces(100*planet.civilization.corruption, 2), 2/(1+planet.civilization.corruption))}%`,
            (gs.fleet.totalSkills.getAmount(SKILLS.Barter) > 0) ? `Fee After Barter | ${statColorSpan(roundToPlaces(100*(1+cyberSurgeon.rake) - 100, 2), 2/(1+cyberSurgeon.rake))}% Buy` : '',
        ]}),
        [
            ["Back", () => leave()],
        ],
        `cyber_surgeon_panel`,
        (nextPlanet) => nextPlanet.settlement?.cyberSurgeon ? showCyberSurgeonBuyMenu(nextPlanet.settlement.cyberSurgeon) : showPlanetMenu(nextPlanet)
    );
}

function showCyberSurgeonInstallImplantMenu(cyberSurgeon = new CyberSurgeon(), implant = new CyberImplant(), selectedOfficer = null) {
    const {fleet} = gs
    const buyPrice = cyberSurgeon.calcBuyImplantPrice(implant)

    function buyImplant(implant = new CyberImplant(), officer = new Officer()) {
        const buyPrice = cyberSurgeon.calcBuyImplantPrice(implant)
        gs.credits -= buyPrice;
        cyberSurgeon.credits += buyPrice;
        officer.implants.push(implant)
        safeRemove(cyberSurgeon.implants, implant)
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

    function onSelectOfficer(officer = new Officer()) {
        const alreadyHasImplant = officer.implants.some(i => i.implantType === implant.implantType)
        const canInstall = !alreadyHasImplant && gs.credits >= buyPrice
        
        const buttons = [
            ['Buy & Install', () => buyImplant(implant, officer), !canInstall],
            ['Cancel', () => showCyberSurgeonBuyMenu(cyberSurgeon)],
        ]
        refreshPanelButtons('cyber_surgeon_install_panel', buttons)
    }
    
    showModal(
        `Install ${coloredName(implant.implantType)}`,
        ce({children:[
            `Select a crew member to install this implant:`,
            createOfficerSelectionTable(),
            `Implant: ${coloredName(implant.implantType)} | Quality: ${roundToPlaces(implant.quality*100, 1)}% | Price: ${buyPrice} credits`,
            `Your Credits: ${gs.credits} | CR After Purchase: ${gs.credits - buyPrice}`,
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
