function startEncounter() {
    const encounter = generateEncounter()
    gs.encounter = encounter

    const {playerShips, enemyShips, ships} = encounter
    //randomize ship locations
    const maxSpawnDistance = encounter.mapDimensions*ENCOUNTER_SHIP_MAX_SPAWN_DISTANCE_RATIO
    const minSpawnDistance = maxSpawnDistance/5

    for (const ship of ships) {
        ship.resetCombatVars()
    }

    for (const ship of playerShips) {
        const [x,y] = rotatePoint(-rng(maxSpawnDistance, minSpawnDistance/2, false), 0, 0, 0, rng(Math.PI/2, -Math.PI/2, false))
        Object.assign(ship, {x, y})
    }
    for (const ship of enemyShips) {
        const [x,y] = rotatePoint(rng(maxSpawnDistance, minSpawnDistance, false), 0, 0, 0, rng(Math.PI/2, -Math.PI/2, false))
        Object.assign(ship, {x, y})
    }
    for (const ship of playerShips) {
        const randomTarget = rndMember(enemyShips)
        const angle = new Path(ship.x, ship.y, randomTarget.x, randomTarget.y).angle
        console.log('angle:',angle)
        Object.assign(ship, {angle})
    }
    for (const ship of enemyShips) {
        const randomTarget = rndMember(playerShips)
        const angle = new Path(ship.x, ship.y, randomTarget.x, randomTarget.y).angle
        console.log('angle:',angle)
        Object.assign(ship, {color: hexToRgba('#dd4400'), angle})
    }

    showModal(encounter.fleetName, encounter.encounterType.description, [['Ok', ()=>{
        showEncounterMap()
        encounter.encounterType.onStart()
    }]])
}

function endEncounter() {
    gs.encounter = undefined
    showStarMap(gs.fleet)
    //restore all shields
    for (const s of gs.fleet.ships) s.restoreShields()
    //pause and show modal if player has no working ships, cant move
    if (gs.fleet.isStranded()) {
        handlePlayerStranded()
        return
    }
}

function startCombat(playerHasInitiative = false) {
    gs.encounter.combatEnabled = true;
    gs.encounter.activeTurnFleet = playerHasInitiative ? gs.fleet : gs.encounter.enemyFleet
    closeModal()
    currentMap.togglePause(false)
}

function endCombat() {
    const {encounter} = gs
    const {result} = encounter
    if (result == ENCOUNTER_RESULTS.Defeat) {
        showModal(`Defeat`, `All your ships have been disabled!`, [['Continue', ()=>encounter.encounterType.onDefeat()]])
    }
    else if (result == ENCOUNTER_RESULTS.Victory) {
        showModal(`Victory`, `All enemy ships have fled or been disabled! You win!`, [['Continue', ()=>encounter.encounterType.onVictory()]])
    }
    else if (result == ENCOUNTER_RESULTS.Escaped) {
        showModal(`Escape`, `You fled from the battlefield!`, [['Continue', ()=>encounter.encounterType.onEscape()]])
    }
}

function handlePlayerStranded() {
    const [nearestPlanet, nearestDistance] = gs.system.calcNearestPlanet(gs.fleet)
    const creditCost = 10 + rng(200*nearestDistance, 100*nearestDistance)
    const canAfford = gs.credits >= creditCost
    const noCredits = gs.credits <= 0
    const dayCost = 0.25 + rng(1.5*nearestDistance, 0.75*nearestDistance, false)
    gs.credits = Math.max(0, gs.credits - creditCost)
    gs.days += dayCost

    console.log('player is stranded:',nearestPlanet,nearestDistance,creditCost,dayCost)
    gs.fleet.dock(nearestPlanet)

    let msg = `You have no working ships remaining, so you have to call a tow ship.<br/>`
    if (canAfford) msg += `The operator charges you a fee of ${creditCost}CR.<br/>`
    else if (noCredits) msg += `The operator complains bitterly after realizing you have no credits, but tows you anyway.<br/>`
    else msg += `The fee is ${creditCost}CR, but you only have ${gs.credits}CR.<br/>Grumbling, the operator confiscates your few remaining credits and tows you anyway.<br/>`
    msg += `You spend ${describeTimespan(dayCost/365)} being dragged through space.<br/>`
    currentMap.refresh()

    showModal(`Stranded`, msg, [['Continue', ()=>showPlanetMenu(nearestPlanet)]])
}

function loseCargoFromDisabledShips(disabledShips = []) {
    const disabledShipsCargoCapacity = disabledShips.reduce( (total, ship) => {
        return total + ship.cargoSpace
    }, 0)
    const cargoRatio = disabledShipsCargoCapacity / gs.fleet.calcTotalCargoSpace()
    const lostCargoAmt = Math.floor(gs.fleet.cargo.total * cargoRatio)
    if (lostCargoAmt <= 0) return ''
    let totalLostCargo = gs.fleet.cargo.randomSubset(lostCargoAmt)
    gs.fleet.cargo.subtract(totalLostCargo)
    const msg = `${lostCargoAmt} units of cargo drift into space from your disabled ships.<br/>`
    return msg
}

function showPlayerRefuseSurrenderModal(fameMultiplier = 0, bountyMultiplier = 0) {
    const fleetName = gs.encounter.fleetName
    const bounty = 100 * bountyMultiplier
    const fame = fameMultiplier > 0 ? 1 * fameMultiplier : 0
    const infamy = fameMultiplier < 0 ? 1 * Math.abs(fameMultiplier) : 0
    let msg = `You refuse to submit to the ${fleetName} demands, and the battle is joined!<br/>`
    if (infamy > 0) msg += `Your defiance of the authorities causes you to gain ${infamy} infamy.<br/>`
    if (fame > 0) msg += `Your fearlessness causes you to gain ${fame} fame.<br/>`
    if (bounty > 0) msg += `You bounty has risen by ${bounty}CR.<br/>`
    showModal(gs.encounter.fleetName, msg, [['Continue', ()=>startCombat(false)]])
}

function showPlayerDidSurrenderModal( fameLossMultiplier = 1) {
    const fleetName = gs.encounter.fleetName
    const fameLoss = fameLossMultiplier < 0 ? 5 * fameLossMultiplier : 0
    const infamyLoss = fameLossMultiplier < 0 ? 5 * fameLossMultiplier : 0

    gs.captain.fame -= fameLoss
    gs.captain.infamy -= infamyLoss

    let msg = `There's no other choice. You power your ships down and broadcast the universal signal for surrender.<br/>`
    if (fameLoss) msg += `Submitting meekly to the ravages of the ${fleetName} causes you to lose ${famePenalty} fame.<br/>`
    if (infamyLoss) msg += `Throwing yourself upon the mercy of the ${fleetName} causes you to lose ${famePenalty} infamy.<br/>`

    showModal(fleetName, msg, [['Continue', ()=>gs.encounter.encounterType.onDefeat()]])
}


function showPlayerAttackFleetModal(fameMultiplier = 0, bountyMultiplier = 0) {
    const fleetName = gs.encounter.fleetName
    const fame = fameMultiplier > 0 ? 1 * fameMultiplier : 0
    const infamy = fameMultiplier < 0 ? 1 * Math.abs(fameMultiplier) : 0
    const bounty = 1000 * bountyMultiplier
    gs.captain.fame += fame
    gs.captain.infamy += infamy
    gs.captain.bounty += bounty
    let msg = `You attack the ${fleetName}!<br/>`
    if (infamy > 0) msg += `This dastardly act causes you to gain ${infamy} infamy.<br/>`
    if (fame > 0) msg += `This brave act causes you to gain ${fame} fame.<br/>`
    if (bounty > 0) msg += `You bounty has risen by ${bounty}CR.<br/>`
    showModal(fleetName, msg, [['Continue', ()=>startCombat(true)]])
}

function showTradeOfferModal() {
    if (Math.random() > .5) showTradeOfferPlayerBuyModal()
    else showTradeOfferPlayerSellModal()
}

function showTradeOfferPlayerSellModal() {
    let msg = ''
    const fleetName = gs.encounter.fleetName
    const ct = gs.fleet.cargo.randomItem(false)
    let onSell = null;

    msg += `The merchants look through your wares.<br/>`

    if (!ct || gs.fleet.cargo.getAmount(ct) <= 0) {
        msg += `Finding no cargo aboard, they chide you for your lack of industry in the mercantile arena.<br/>`
    }
    else {
        const maxSellAmount = gs.fleet.cargo.getAmount(ct)
        const sellAmount = rng(maxSellAmount, 1)
        //no rake but value may vary
        const pricePerUnit = Math.ceil(ct.value * rng(2, 0.5, false))
        const totalPrice = pricePerUnit * sellAmount
        onSell = () => {
            gs.fleet.cargo.increment(ct, -sellAmount)
            gs.credits += totalPrice
            showModal(fleetName, 
                `You sold ${sellAmount} units of ${ct.name} for ${totalPrice}CR.<br/>
                The merchants thank you and depart.<br/>`, [['Continue', ()=>endEncounter()]])
        }

        msg += `They offer to buy ${sellAmount} ${ct.name} for ${pricePerUnit}CR each (total: ${totalPrice}CR).<br/>`
        msg += `Price vs. Market: ${roundToPlaces(100*pricePerUnit/ct.value,2)}%<br/>`
        msg += `Your amount after sale: ${gs.fleet.cargo.getAmount(ct) - sellAmount}<br/>`
        msg += `Your CR after sale: ${gs.credits + totalPrice}CR.<br/>`
    }

    showModal(fleetName, msg, onSell ? [
        ['Sell', ()=>onSell()],
        ['Decline', ()=>endEncounter()]
    ] :
    [['Continue', ()=>endEncounter()]])
}

function showTradeOfferPlayerBuyModal() {
    let msg = ''
    const fleetName = gs.encounter.fleetName
    const ct = gs.encounter.fleet.cargo.randomItem(false)
    const availableCargoSpace = gs.fleet.calcAvailableCargoSpace()
    let onBuy = null;

    msg += `The merchants proudly display their wares.<br/>`
    if (!ct || gs.encounter.fleet.cargo.getAmount(ct) <= 0) {
        msg += `Unfortunately, they have nothing of interest to sell you.<br/>`
    }
    else if (availableCargoSpace <= 0) {
        msg += `However, your cargo bays are full and you have no room to take any more goods.<br/>`
    }
    else {
        const maxBuyAmount = Math.min(gs.encounter.fleet.cargo.getAmount(ct), availableCargoSpace)
        const buyAmount = rng(maxBuyAmount, 1)
        const pricePerUnit = Math.ceil(ct.value * rng(1.5, 0.75, false))
        const totalPrice = pricePerUnit * buyAmount
        onBuy = () => {
            gs.encounter.fleet.cargo.increment(ct, -buyAmount)
            gs.fleet.cargo.increment(ct, buyAmount)
            gs.credits -= totalPrice
            showModal(fleetName, 
                `You bought ${buyAmount} units of ${ct.name} for ${totalPrice}CR.<br/>
                The merchants thank you and depart.<br/>`, [['Continue', ()=>endEncounter()]])
        }
        msg += `They offer to sell you ${buyAmount} ${ct.name} for ${pricePerUnit}CR each (total: ${totalPrice}CR).<br/>`
        msg += `Price vs. Market: ${roundToPlaces(100*pricePerUnit/ct.value,2)}%<br/>`
        msg += `Your amount after purchase: ${gs.fleet.cargo.getAmount(ct) + buyAmount}<br/>`
        msg += `Your CR after purchase: ${gs.credits - totalPrice}CR.<br/>`
    }
    showModal(fleetName, msg, onBuy ? [
        ['Buy', ()=>onBuy()],
        ['Decline', ()=>endEncounter()]
    ] :
    [['Continue', ()=>endEncounter()]])
}


function showPlayerDefeatedEnemyModal(fameMultiplier = 0) {
    const {enemyFleet, fleetName, disabledEnemyShips} = gs.encounter
    const fame = fameMultiplier > 0 ? 5 * fameMultiplier : 0
    const infamy = fameMultiplier < 0 ? 5 * Math.abs(fameMultiplier) : 0
    const abandonedCargoCapacity = disabledEnemyShips.reduce( (total, ship) => {
        return total + ship.cargoSpace
    }, 0)
    const cargoRatio = abandonedCargoCapacity / enemyFleet.calcTotalCargoSpace()
    const lootAmt = Math.floor(enemyFleet.cargo.total * cargoRatio)
    const loot = enemyFleet.cargo.randomSubset(lootAmt)
    const disabledPlayerShips = gs.encounter.playerShips.filter(s=>s.isDisabled())

    gs.captain.infamy += infamy
    gs.captain.fame += fame

    let msg = `You defeated the ${fleetName}!<br/>`
    if (infamy > 0) msg += `Your nefarious victory gains you ${infamy} infamy.<br/>`
    if (fame > 0) msg += `Your glorious victory gains you ${fame} fame.<br/>`

    if (disabledPlayerShips.length > 0) {
        msg += `${disabledPlayerShips.length} of your ships were disabled in the fighting.<br/>`
        msg += loseCargoFromDisabledShips(disabledPlayerShips)
    }

    if (disabledEnemyShips.length > 0) {
        msg += `The ${fleetName} left behind ${disabledEnemyShips.length} disabled ships!<br/>`
        if (lootAmt > 0) msg += `Your scanners reveal ${lootAmt} units of cargo amid the wreckage.<br/>`
    }
    showModal(gs.encounter.encounterType.name, msg, [
        lootAmt > 0 ? ['Loot', ()=>showLootMenu(loot)] : ['Continue', ()=>endEncounter()]
    ])
}

function showPlayerDefeatedByNeutralsModal( infamyLossMultiplier = 1) {
    const {fleetName, disabledPlayerShips} = gs.encounter
    
    const infamyLoss = 5 * infamyLossMultiplier
    gs.captain.infamy -= infamyLoss

    let msg = ''
    msg += `The ${fleetName} seem shocked to have defeated you.<br/>`
    msg += `They quickly depart the scene in case there are other attackers nearby.<br/>`

    if (infamyLoss) msg += `You lose ${infamyLoss} infamy from having suffered such an ignoble loss.<br/>`
    if (disabledPlayerShips.length > 0) {
        msg += `${disabledPlayerShips.length} of your ships were disabled in the fighting.<br/>`
        msg += loseCargoFromDisabledShips(disabledPlayerShips)
    }

    showModal(gs.encounter.encounterType.name, msg, [['Continue', ()=>endEncounter()]])
}

function showPlayerDefeatedByPiratesModal() {
    const {fleetName, fleet, encounter, disabledPlayerShips} = gs.encounter
    let msg = `Unfortunately, you were no match for the ${fleetName}.<br/>`

    if (disabledPlayerShips.length > 0) {
        msg += `${disabledPlayerShips.length} of your ships were disabled in the fighting.<br/>`
        msg += loseCargoFromDisabledShips(disabledPlayerShips)
    }

    msg += `Now that the fighting is over, the ${fleetName} eagerly board your ships.<br/>`
    const lootableCargoAmount = fleet.cargo.total
    if (lootableCargoAmount <= 0) {
        msg += 'They are disgusted to find nothing worth looting!<br/>'
    }
    else {
        const canLootAmount = encounter.fleet.calcAvailableCargoSpace()
        if (canLootAmount <= 0) {
            //this should not happen, as generators always leave a little room for cargo
            msg += 'They are embarassed to find their cargo bays are too full to hold any more loot.<br/>'
        }
        else {
            const maxLootAmount = Math.min(canLootAmount, lootableCargoAmount)
            const lootAmount = rng(maxLootAmount, maxLootAmount/2)
            msg += `They take ${lootAmount} units of loot from your cargo bays.<br/>`
            const looted = fleet.cargo.randomSubset(lootAmount)
            fleet.cargo.subtract(looted)
            //encounter.fleet.add(looted) //not really needed
        }
    }
    if (gs.credits <= 10) {
        msg += `They note with contempt that you have ${gs.credits == 0 ? 'no' : 'barely any'} credits to steal!<br/>`
    }
    else {
        const stolenCreditsAmount = rng(gs.credits*0.5, gs.credits*0.1)
        msg += `They help themselves to ${stolenCreditsAmount} of your credits.<br/>`
    }
    msg += `The ${fleetName} thank you for your time and depart.<br/>`
    showModal(gs.encounter.encounterType.name, msg, [['Continue', ()=>endEncounter()]])
}

function showPlayerEscapedFromEnemyModal() {
    const {fleetName, disabledPlayerShips, escapedPlayerShips} = gs.encounter
        let msg = `You escaped from the ${fleetName}.<br/>`
    if (escapedPlayerShips.length > 0) msg += `${escapedPlayerShips.length} of your ships exited the battlefield intact.<br/>`
    if (disabledPlayerShips.length > 0) {
        msg += `However, ${disabledPlayerShips.length} were disabled in the fighting.<br/>`
        msg += loseCargoFromDisabledShips(disabledPlayerShips)
    }

    showModal(gs.encounter.encounterType.name, msg, [['Continue', ()=>endEncounter()]])
}

function showPlayerPoliceInspectionModal() {
    let msg = ''
    const {fleetName} = gs.encounter
    const illegalCargo = gs.fleet.cargo.items().filter( ct => ct.isIllegal )
    if (illegalCargo.length === 0) {
        msg += `The police inspect your cargo and find nothing illegal. They thank you for your cooperation and wish you a safe journey.<br/>`
    }
    else {
        let fine = 0
        for (const [ct, amt] of gs.fleet.cargo.counts) {
            if (illegalCargo.includes(ct)) {
                const finePerUnit = ct.value*2
                fine += finePerUnit * amt
            }
            gs.fleet.cargo.setAmount(ct, 0) //confiscate all illegal cargo
        }
        const jailTime = 1+fine/1000 //1 unit of jail time per 1000CR of fine
        msg += `The police inspect your cargo and discover ${illegalCargo.length} units of contraband!<br/>`
        msg += `All of your contraband is confiscated.<br/>`
        msg += `You are given the option to pay a fine of ${fine}CR or serve ${jailTime} days in jail.<br/>`
        showModal(fleetName, msg, [
            ['Pay Fine', ()=>{
                gs.credits -= fine
                msg += `You pay the fine of ${fine}CR.<br/>`
                showModal(fleetName, msg, [['Continue', ()=>endEncounter()]])
            }, gs.credits >= fine],
            ['Serve Jail Time', ()=>{
                const nearestPlanet = gs.starSystem.calcNearestPlanet(gs.fleet)
                gs.fleet.dock(nearestPlanet)
                gs.year += jailTime / 365.0
                msg += `The police take you to the nearest planet, ${nearestPlanet.name}.<br/>`
                msg += `You serve ${jailTime} days in jail.<br/>`
                showModal(fleetName, msg, [['Continue', ()=>endEncounter()]])
            }],
            ['Resist', ()=>showPlayerRefuseSurrenderModal(-1, 1)],
        ])
    }
}