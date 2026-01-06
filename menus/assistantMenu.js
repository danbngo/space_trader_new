/**
 * Opens the assistant menu with various navigation options
 */
function showAssistantMenu() {
    const hasSkillPoints = gs.captain.skillPoints > 0
    const hasPerkPoints = gs.captain.numPerkPoints > 0
    
    // Check if player has visited any major bodies (planets, dwarfs, or stations)
    const hasVisitedMajorBodies = [...gs.lastVisitedDates.keys()].some(obj => 
        obj instanceof Planet || obj instanceof SpaceStation
    )
    
    // Check if player has seen various body types
    const hasSeenPlanets = gs.system.planets.some(p => gs.lastSeenDates.has(p))
    const hasSeenDwarfs = gs.system.dwarfPlanets.some(p => gs.lastSeenDates.has(p))
    const hasSeenStations = gs.system.spaceStations.some(s => gs.lastSeenDates.has(s))
    const hasSeenAnomalies = gs.system.anomalies.some(a => gs.lastSeenDates.has(a))
    const hasSeenRuins = gs.system.ruins.some(r => gs.lastSeenDates.has(r))
    
    const menuItems = [
        ['Ships', ()=>showShipsMenu()],
        ['Cargo', ()=>showCargoMenu(), gs.fleet.cargo.totalQuantity === 0],
        ['Officers', ()=>showOfficersMenu(), gs.fleet.subordinates.length === 0],
        ['Contracts', ()=>showContractsMenu(), gs.fleet.contracts.length === 0],
        ['Captain', ()=>showCaptainSkillsMenu(), false, hasSkillPoints || hasPerkPoints ? 'highlighted' : null],
        ['Cyberware', ()=>showCyberwareMenu(), gs.captain.implants.length === 0],
        ce({tag:'br'}),
        ['Planets', ()=>showPlanetsMenu(()=>showAssistantMenu()), !hasSeenPlanets],
        ['Dwarf Planets', ()=>showDwarfPlanetsMenu(()=>showAssistantMenu()), !hasSeenDwarfs],
        ['Space Stations', ()=>showSpaceStationsMenu(()=>showAssistantMenu()), !hasSeenStations],
    ]
    
    // Only show Fleets and Abandoned Fleets in debug mode
    if (DEBUG_MODE) {
        menuItems.push(
            ['Fleets', ()=>showFleetsMenu(()=>showAssistantMenu())],
            ['Abandoned Fleets', ()=>showAbandonedFleetsMenu(()=>showAssistantMenu())]
        )
    }
    
    menuItems.push(
        ['Anomalies', ()=>showAnomaliesMenu(()=>showAssistantMenu()), !hasSeenAnomalies],
        ['Ruins', ()=>showRuinsDatabaseMenu(()=>showAssistantMenu()), !hasSeenRuins],
        ce({tag:'br'}),
        ['Trade', ()=>showTradeInfoSellMenu()],
        ['News', ()=>showNewsTimelineMenu(null, ()=>showAssistantMenu()), !hasVisitedMajorBodies],
        ['Religions', ()=>showReligionsMenu(()=>showAssistantMenu()), !hasVisitedMajorBodies],
        ['Cultures', ()=>showCulturesMenu(()=>showAssistantMenu()), !hasVisitedMajorBodies],
        ['Governments', ()=>showGovernmentsMenu(()=>showAssistantMenu()), !hasVisitedMajorBodies],
        ['Politics', ()=>showPoliticsMenu(()=>showAssistantMenu()), !hasVisitedMajorBodies],
        ce({tag:'br'}),
        ['Cancel', ()=>{
            closeModal()
        }],
    )
    
    showModal(`Assistant`, 'How can I help you captain?', menuItems)
}
