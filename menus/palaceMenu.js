/**
 * Displays the palace menu for viewing and accepting government contracts.
 * @param {Palace} palace - The palace building to interact with.
 */
function showPalaceMenu(palace = new Palace()) {
    const {planet} = palace
    const {fleet} = gs
    const isDocked = fleet.location == planet
    const hasBounty = gs.captain.calcInfamyForPlanet(planet) > 0

    let msg = ''
    if (!isDocked) {
        msg = colorSpan('You must dock to enter the palace.', COLORS.Yellow) + '<br/>'
    } else if (hasBounty) {
        msg = colorSpan('The palace guards refuse you entry due to your criminal record on this planet.', COLORS.Red) + '<br/>'
    } else {
        msg = 'Welcome to the palace. The government has contracts available for loyal citizens.<br/>'
    }

    showPlanetModal(
        planet,
        `${coloredName(planet)} - Palace`,
        ce({children:[
            msg,
            `<br/>`,
            `[Contract system coming soon]`
        ]}),
        [
            ['Contracts', () => showContractsMenu(), !isDocked || hasBounty],
            ['Back', () => showPlanetMenu(planet)]
        ],
        'palace_panel',
        (nextPlanet) => showPalaceMenu(nextPlanet.settlement.palace)
    )
}
