/**
 * Opens the assistant menu with various navigation options
 */
function showAssistantMenu() {
    const hasSkillPoints = gs.captain.skillPoints > 0
    const hasPerkPoints = gs.captain.numPerkPoints > 0
    showModal(`Assistant`, 'How can I help you captain?', [
        ['Ships', ()=>showShipsMenu()],
        ['Cargo', ()=>showCargoMenu()],
        ['Officers', ()=>showOfficersMenu()],
        ['Contracts', ()=>showContractsMenu(), false],
        ['Captain', ()=>showCaptainSkillsMenu(), false, hasSkillPoints || hasPerkPoints ? 'highlighted' : null],
        ce({tag:'br'}),
        ['Planets', ()=>showPlanetsMenu(()=>showAssistantMenu())],
        ['Dwarf Planets', ()=>showDwarfPlanetsMenu(()=>showAssistantMenu())],
        ['Space Stations', ()=>showSpaceStationsMenu(()=>showAssistantMenu())],
        ['Fleets', ()=>showFleetsMenu(()=>showAssistantMenu())],
        ['Anomalies', ()=>showAnomaliesMenu(()=>showAssistantMenu())],
        ['Ruins', ()=>showRuinsDatabaseMenu(()=>showAssistantMenu())],
        ce({tag:'br'}),
        ['Trade', ()=>showTradeInfoSellMenu()],
        ['News', ()=>showNewsTimelineMenu(null, ()=>showAssistantMenu())],
        ['Religions', ()=>showReligionsMenu(()=>showAssistantMenu())],
        ['Cultures', ()=>showCulturesMenu(()=>showAssistantMenu())],
        ['Governments', ()=>showGovernmentsMenu(()=>showAssistantMenu())],
        ['Politics', ()=>showPoliticsMenu(()=>showAssistantMenu())],
        ce({tag:'br'}),
        ['Cancel', ()=>{
            closeModal()
        }],
    ])
}
