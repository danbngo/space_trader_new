/**
 * Opens the assistant menu with various navigation options
 */
function showAssistantMenu() {
    if (currentMap && currentMap.togglePause) currentMap.togglePause(true)
    const hasSkillPoints = gs.captain.skillPoints > 0
    const hasPerkPoints = gs.captain.numPerkPoints > 0
    showModal(`Assistant`, 'How can I help you captain?', [
        ['Trade', ()=>showTradeInfoSellMenu()],
        ['Ships', ()=>showShipsMenu()],
        ['Cargo', ()=>showCargoMenu()],
        ['Officers', ()=>showOfficersMenu()],
        ['Contracts', ()=>showContractsMenu(), false],
        ['Captain', ()=>showCaptainSkillsMenu(), false, hasSkillPoints || hasPerkPoints ? 'highlighted' : null],
        ['News', ()=>showNewsTimelineMenu(null, ()=>showAssistantMenu())],
        ['Religions', ()=>showReligionsMenu(()=>showAssistantMenu())],
        ['Politics', ()=>showPoliticsMenu(()=>showAssistantMenu())],
        ['Cancel', ()=>{
            closeModal()
        }],
    ])
}
