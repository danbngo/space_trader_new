/**
 * Displays the temple menu where the player can tithe to the state religion.
 * @param {Temple} temple - The temple building to interact with.
 */
function showTempleMenu(temple = new Temple()) {
    const {planet} = temple;
    const reloadMenu = () => showTempleMenu(temple);
    const isDocked = gs.location == planet;
    const stateReligion = planet.c.stateReligion;
    
    if (!stateReligion) {
        showModal("Temple", "This temple has no state religion to tithe to.", [["Close", () => showPlanetMenu(planet)]]);
        return;
    }
    
    const titheCost = temple.calcTitheCost(gs.captain);
    const currentReputation = gs.captain.reputation.getAmount(stateReligion);
    const canTithe = isDocked && gs.credits >= titheCost && gs.year >= gs.nextTitheYear;
    
    function tithe() {
        gs.credits -= titheCost;
        gs.captain.reputation.increment(stateReligion, 10);
        gs.nextTitheYear = gs.year + 1; // Can tithe again next year
        
        showModal(
            "Tithe Accepted",
            `You donate ${titheCost} CR to the ${coloredName(stateReligion)}.<br/><br/>` +
            `Your devotion has been recognized. Reputation with ${coloredName(stateReligion)}: ${currentReputation} → ${currentReputation + 10}`,
            [["Continue", () => reloadMenu()]]
        );
    }
    
    function showTitheConfirmation() {
        showModal(
            `Tithe to ${coloredName(stateReligion)}?`,
            `Donate ${titheCost} CR to the ${coloredName(stateReligion)} to increase your reputation?<br/><br/>` +
            `Current Reputation: ${currentReputation}<br/>` +
            `After Tithe: ${currentReputation + 10}<br/><br/>` +
            `Your Credits: ${gs.credits} CR<br/>` +
            `After Tithe: ${gs.credits - titheCost} CR`,
            [
                ["Tithe", () => tithe()],
                ["Cancel", () => reloadMenu()]
            ]
        );
    }
    
    // Get disabled reason
    let titheDisabledReason = null;
    if (!isDocked) {
        titheDisabledReason = "Must be docked to tithe";
    } else if (gs.credits < titheCost) {
        titheDisabledReason = `Insufficient credits (need ${titheCost} CR)`;
    } else if (gs.year < gs.nextTitheYear) {
        titheDisabledReason = `You may tithe again in ${describeTimespan(gs.nextTitheYear - gs.year)}`;
    }
    
    /** @type {ButtonData[]} */
    const buttons = [
        [`Tithe (${titheCost} CR)`, () => showTitheConfirmation(), !canTithe, titheDisabledReason],
        ["Back", () => showPlanetMenu(planet)]
    ];
    
    showPlanetModal(
        planet,
        `${coloredName(planet)} - Temple of ${coloredName(stateReligion)}`,
        ce({children: [
            `The temple serves the ${coloredName(stateReligion)}, the state religion of this settlement.<br/><br/>`,
            `Your Reputation with ${coloredName(stateReligion)}: ${currentReputation}<br/>`,
            `Your Credits: ${gs.credits} CR<br/><br/>`,
            `A tithe of ${titheCost} CR will increase your reputation by 10 points.`,
        ]}),
        buttons,
        'temple_panel',
        (nextPlanet) => nextPlanet.settlement?.temple ? showTempleMenu(nextPlanet.settlement.temple) : showPlanetMenu(nextPlanet)
    );
}
