function  checkPlayerStranded() {
    if (!gs.fleet.stranded) return
    console.log('checkPlayerStranded');
    const [nearestPlanet, nearestDistance] = gs.system.calcNearestPlanet(gs.fleet)
    const creditCost = 100 + rng(500*Math.sqrt(nearestDistance), 250*Math.sqrt(nearestDistance), true)
    const canAfford = gs.credits >= creditCost
    const noCredits = gs.credits <= 0
    const dayCost = 1 + rng(1.5*nearestDistance, 0.75*nearestDistance, false)
    gs.credits = Math.max(0, gs.credits - creditCost)
    gs.year += dayCost/365

    console.log('player is stranded:',nearestPlanet,nearestDistance,creditCost,dayCost)

    const outOfFuel = gs.fleet.fuel <= 0
    const noWorkingShips = gs.fleet.ships.filter(s=>(!s.disabled)).length <= 0

    let msg = outOfFuel && noWorkingShips ? 
        `You have no working ships and no fuel remaining, so you have to call a tow ship.<br/>` :
        outOfFuel ? `You have run out of fuel, so you have to call a tow ship.<br/>` :
        `You have no working ships remaining, so you have to call a tow ship.<br/>`
    if (canAfford) msg += `The operator charges you a fee of ${creditCost}CR.<br/>`

    else if (noCredits) msg += `The operator complains bitterly after realizing you have no credits, but tows you anyway.<br/>`
    else msg += `The fee is ${creditCost}CR, but you only have ${gs.credits}CR.<br/>Grumbling, the operator confiscates your few remaining credits and tows you anyway.<br/>`
    msg += `You spend ${describeTimespan(dayCost/365)} being dragged through space.<br/>`
    currentMap.refresh()

    showModal(`Stranded`, msg, [['Continue', ()=>showPlanetMenu(nearestPlanet)]])
}