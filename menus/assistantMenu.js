/**
 * Opens the assistant menu with various navigation options
 */
function showAssistantMenu() {
    const hasSkillPoints = gs.captain.skillPoints > 0
    
    // Check if player has visited any major bodies (planets, dwarfs, or stations)
    const hasVisitedMajorBodies = [...gs.lastVisitedDates.keys()].some(obj => 
        //@ts-ignore
        (obj instanceof Planet) || (obj instanceof SpaceStation)
    )
    
    // Check if player has seen various body types
    const hasSeenPlanets = gs.system.planets.some(p => gs.lastSeenDates.has(p))
    const hasSeenDwarfs = gs.system.dwarfPlanets.some(p => gs.lastSeenDates.has(p))
    const hasSeenStations = gs.system.spaceStations.some(s => gs.lastSeenDates.has(s))
    
    /** @type {(ButtonData|HTMLElement)[]} */
    const menuItems = [
        ['Ships', ()=>showShipsMenu()],
        ['Cargo', ()=>showCargoMenu(), gs.fleet.cargo.total === 0, 'No cargo in hold'],
        ['Missions', ()=>showMissionsMenu(), gs.missions.length === 0, 'No active missions'],
        ['Captain', ()=>showCaptainSkillsMenu(), false, hasSkillPoints ? 'highlighted' : null],
        ce({tag:'br'}),
        ['Planets', ()=>showPlanetsMenu(()=>showAssistantMenu()), !hasSeenPlanets, 'No planets discovered yet'],
        ['Dwarf Planets', ()=>showDwarfPlanetsMenu(()=>showAssistantMenu()), !hasSeenDwarfs, 'No dwarf planets discovered yet'],
        ['Space Stations', ()=>showSpaceStationsMenu(()=>showAssistantMenu()), !hasSeenStations, 'No space stations discovered yet'],
        ['Trade', ()=>showTradeInfoSellMenu()],
        ['News', ()=>showNewsTimelineMenu(null, ()=>showAssistantMenu()), !hasVisitedMajorBodies, 'Visit a planet or station to access news'],
        ['Governments', ()=>showGovernmentsMenu(()=>showAssistantMenu()), !hasVisitedMajorBodies, 'Visit a planet or station to learn about governments'],
        ['Politics', ()=>showPoliticsMenu(()=>showAssistantMenu()), !hasVisitedMajorBodies, 'Visit a planet or station to access political information'],
        ce({tag:'br'}),
        ['Cancel', ()=>{
            closeModal()
        }]
    ]
    
    showModal(`Assistant`, 'How can I help you captain?', menuItems)
}
