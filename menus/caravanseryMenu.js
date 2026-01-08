/**
 * Displays the caravansery menu where players can take escort missions.
 * @param {Caravansery} caravansery - The caravansery building.
 */
function showCaravanseryMenu(caravansery) {
    const planet = caravansery.planet
    
    let msg = `Welcome to the ${coloredName(planet)} Caravansery.<br/><br/>`
    msg += `This establishment arranges escort missions for traders and travelers.<br/>`
    msg += `<br/>`
    msg += colorSpan(`(Escort missions coming soon!)`, COLORS.Gray)
    
    /** @type {ButtonData[]} */
    const buttons = [
        ['Back', () => showPlanetMenu(planet)]
    ]
    
    showModal('Caravansery', msg, buttons)
}
