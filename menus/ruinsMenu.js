/**
 * Displays the ruins exploration menu.
 * @param {Ruins} ruins - The ruins being explored.
 */
function showRuinsMenu(ruins = new Ruins()) {
    console.log('opening ruins menu for:', ruins);
    
    const msg = `You have docked with ${coloredName(ruins)}.<br/>
        ${ruins.ruinsType.description}<br/><br/>
        The structure appears ancient and mysterious. Further exploration will be implemented soon.`;
    
    showModal(
        coloredName(ruins),
        msg,
        [
            ['Close', () => {
                gs.fleet.location = null;
                closeModal();
            }]
        ]
    );
}
