function startEncounter(encounter = gs.encounter) {
    console.log('startEncounter');
    gs.encounter = encounter

    const {playerShips, enemyShips, ships, encounterType} = encounter
    const {formationType} = encounterType
    //randomize ship locations
    const maxSpawnDistance = encounter.mapRadius*ENCOUNTER_SHIP_MAX_SPAWN_DISTANCE_RATIO
    const minSpawnDistance = maxSpawnDistance/5

    let stormAngles = [rng(Math.PI/2, -Math.PI/2, false)]//, rng(Math.PI + Math.PI/2, Math.PI - Math.PI/2, false)]

    for (const ship of ships) {
        ship.resetCombatVars()
    }

    for (const ship of playerShips) {
        const [x,y] = rotatePoint(rng(maxSpawnDistance, minSpawnDistance/2, false), 0, 0, 0, rng(Math.PI + Math.PI/2, Math.PI -Math.PI/2, false))
        Object.assign(ship, {x, y})
    }
    for (const ship of enemyShips) {
        Object.assign(ship, {color: encounter.encounterType.enemyColor})
        if (formationType == FORMATION_TYPES.FaceOff) {
            const [x,y] = rotatePoint(rng(maxSpawnDistance, minSpawnDistance, false), 0, 0, 0, rng(Math.PI/2, -Math.PI/2, false))
            Object.assign(ship, {x, y})
        }
        else if (formationType == FORMATION_TYPES.Storm) {
            const stormAngle = rndMember(stormAngles)
            const angle = stormAngle + rng(Math.PI/2, -Math.PI/2, false)
            const [x,y] = rotatePoint(rng(encounter.mapRadius, maxSpawnDistance, false), 0, 0, 0, angle + Math.PI*rng(1.25,0.75,false))
            Object.assign(ship, {x, y, angle})
        }
    }
    for (const ship of playerShips) {
        const randomTarget = rndMember(enemyShips)
        if (randomTarget) {
            const angle = new Path(ship.x, ship.y, randomTarget.x, randomTarget.y).angle
            Object.assign(ship, {angle})
        }
    }
    for (const ship of enemyShips) {
        if (formationType == FORMATION_TYPES.FaceOff) {
            const randomTarget = rndMember(playerShips)
            if (randomTarget) {
                const angle = new Path(ship.x, ship.y, randomTarget.x, randomTarget.y).angle
                Object.assign(ship, {angle})
            }
        }
        else if (formationType == FORMATION_TYPES.Storm) {
            //const angle = rng(stormAngle + Math.PI/8, stormAngle - Math.PI/8, false)
            //Object.assign(ship, {angle})
        }
    }

    showModal(encounter.fleetName, encounter.encounterType.description, [['Ok', ()=>{
        showEncounterMap()
        if (encounter.encounterType.aiType == AI_TYPES.Asteroid) encounter.encounterType.onStart()
    }]])
}

function endEncounter() {
    console.log('endEncounter');
    gs.encounter = undefined
    showStarMap(gs.fleet)
    //restore all shields
    for (const s of gs.fleet.ships) s.restoreShields()
    //pause and show modal if player has no working ships, cant move
    if (gs.fleet.stranded) {
        handlePlayerStranded()
        return
    }
}

function startCombat(playerHasInitiative = false) {
    console.log('startCombat', { playerHasInitiative });
    gs.encounter.combatEnabled = true;
    gs.encounter.activeTurnFleet = playerHasInitiative ? gs.fleet : gs.encounter.enemyFleet
    closeModal()
    if (currentMap && currentMap.togglePause) currentMap.togglePause(false)
}

function endCombat() {
    console.log('endCombat');
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
    console.log('handlePlayerStranded');
    const [nearestPlanet, nearestDistance] = gs.system.calcNearestPlanet(gs.fleet)
    const creditCost = 100 + rng(500*Math.sqrt(nearestDistance), 250*Math.sqrt(nearestDistance), false)
    const canAfford = gs.credits >= creditCost
    const noCredits = gs.credits <= 0
    const dayCost = 1 + rng(1.5*nearestDistance, 0.75*nearestDistance, false)
    gs.credits = Math.max(0, gs.credits - creditCost)
    gs.year += dayCost/365

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
    console.log('loseCargoFromDisabledShips', { disabledShips });
    const disabledShipsCargoCapacity = disabledShips.reduce( (total, ship) => {
        return total + ship.cargoSpace
    }, 0)
    const cargoRatio = disabledShipsCargoCapacity / gs.fleet.totalCargoSpace
    const lostCargoAmt = Math.floor(gs.fleet.cargo.total * cargoRatio)
    if (lostCargoAmt <= 0) return ''
    let totalLostCargo = gs.fleet.cargo.randomSubset(lostCargoAmt)
    gs.fleet.cargo.subtract(totalLostCargo)
    const msg = `${lostCargoAmt} units of cargo drift into space from your disabled ships.<br/>`
    return msg
}

function showPlayerRefuseSurrenderModal(fameMultiplier = 0, bountyMultiplier = 0) {
    console.log('showPlayerRefuseSurrenderModal', { fameMultiplier, bountyMultiplier });
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
    console.log('showPlayerDidSurrenderModal', { fameLossMultiplier });
    const fleetName = gs.encounter.fleetName
    const fameLoss = fameLossMultiplier < 0 ? 5 * fameLossMultiplier : 0
    const infamyLoss = fameLossMultiplier < 0 ? 5 * fameLossMultiplier : 0

    gs.captain.fame -= fameLoss
    gs.captain.infamy -= infamyLoss

    let msg = `There's no other choice. You power your ships down and broadcast the universal signal for surrender.<br/>`
    if (fameLoss) msg += `Submitting meekly to the ravages of the ${fleetName} causes you to lose ${fameLoss} fame.<br/>`
    if (infamyLoss) msg += `Throwing yourself upon the mercy of the ${fleetName} causes you to lose ${fameLoss} infamy.<br/>`

    showModal(fleetName, msg, [['Continue', ()=>gs.encounter.encounterType.onDefeat()]])
}


function showPlayerAttackFleetModal(fameMultiplier = 0, bountyMultiplier = 0, sneakAttack = false, allowBribe = false) {
    console.log('showPlayerAttackFleetModal', { fameMultiplier, bountyMultiplier });
    const fleetName = gs.encounter.fleetName
    const fame = fameMultiplier > 0 ? 1 * fameMultiplier : 0
    const infamy = fameMultiplier < 0 ? 1 * Math.abs(fameMultiplier) : 0
    const bounty = 1000 * bountyMultiplier
    gs.captain.fame += fame
    gs.captain.infamy += infamy
    gs.captain.bounty += bounty

    if (sneakAttack) {
        for (const ship of gs.encounter.ships) ship.shields[0] = 0
    }

    let msg = `You ${sneakAttack ? 'sneakily ' : ''}attack the ${fleetName}!<br/>`
    if (sneakAttack) msg += `The ${fleetName} are caught with their shields down!<br/>`
    if (infamy > 0) msg += `This dastardly act causes you to gain ${infamy} infamy.<br/>`
    if (fame > 0) msg += `This brave act causes you to gain ${fame} fame.<br/>`
    if (bounty > 0) msg += `You bounty has risen by ${bounty}CR.<br/>`


    showModal(fleetName, msg, [['Continue', ()=>{
        if (allowBribe) {
            const combatAdvantage = gs.fleet.combatRating / gs.encounter.fleet.combatRating
            if (combatAdvantage * Math.random() > 1.5) {
                showNeutralsBribePlayerModal()
                return
            }
        }
        startCombat(true)
    }]])
}

function showTradeOfferModal(allowSell = true) {
    console.log('showTradeOfferModal');
    if (allowSell && Math.random() > .5) showTradeOfferPlayerSellModal() 
    else showTradeOfferPlayerBuyModal()
}

function showTradeOfferPlayerSellModal() {
    console.log('showTradeOfferPlayerSellModal');
    let msg = ''
    const fleetName = gs.encounter.fleetName
    const ct = gs.fleet.cargo.randomItem(false)
    if (!(ct instanceof CargoType)) throw new Error('wrong cargo type!')
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
        const officersShare = gs.fleet.calcTotalCRShare(totalPrice, true)
        const finalSale = totalPrice - officersShare
        onSell = () => {
            gs.fleet.cargo.increment(ct, -sellAmount)
            gs.credits += finalSale
            showModal(fleetName, 
                `You sold ${sellAmount} units of ${ct.name} for ${totalPrice}CR${officersShare ? ` (-${officersShare}CR for officers)` : ''}.<br/>
                The merchants thank you and tell you to come again!<br/>`, [['Continue', ()=>endEncounter()]])
        }

        msg += `They offer to buy ${sellAmount} ${ct.name} for ${pricePerUnit}CR each (total: ${totalPrice}CR).<br/>`
        msg += `Price vs. Market: ${roundToPlaces(100*pricePerUnit/ct.value,2)}%<br/>`
        msg += `Your amount after sale: ${gs.fleet.cargo.getAmount(ct) - sellAmount}<br/>`
        msg += `Sale Price: ${finalSale}CR ${officersShare ? `(-${officersShare}CR for officers)` : ''}<br/>`
        msg += `Your CR after sale: ${gs.credits + finalSale}CR.<br/>`
    }

    showModal(fleetName, msg, onSell ? [
        ['Sell', ()=>onSell()],
        ['Decline', ()=>endEncounter()]
    ] :
    [['Continue', ()=>endEncounter()]])
}

function showTradeOfferPlayerBuyModal() {
    console.log('showTradeOfferPlayerBuyModal');
    let msg = ''
    const fleetName = gs.encounter.fleetName
    const ct = gs.encounter.fleet.cargo.randomItem(false)
    const availableCargoSpace = gs.fleet.availableCargoSpace
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
                The merchants thank you and tell you to come again!<br/>`, [['Continue', ()=>endEncounter()]])
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
    console.log('showPlayerDefeatedEnemyModal', { fameMultiplier });
    const {enemyFleet, fleetName, disabledEnemyShips} = gs.encounter
    const fame = fameMultiplier > 0 ? 5 * fameMultiplier : 0
    const infamy = fameMultiplier < 0 ? 5 * Math.abs(fameMultiplier) : 0
    const abandonedCargoCapacity = disabledEnemyShips.reduce( (total, ship) => {
        return total + ship.cargoSpace
    }, 0)
    let creditsAmt = Math.floor(Math.random() * enemyFleet.credits * (abandonedCargoCapacity / enemyFleet.totalCargoSpace))
    if (!isNaN(creditsAmt)) throw new Error('creditsAmt was NaN!')
    const officersShare = gs.fleet.calcTotalCRShare(creditsAmt, true)
    const finalCredits = creditsAmt - officersShare
    gs.credits += finalCredits
    creditsAmt = finalCredits
    const cargoRatio = abandonedCargoCapacity / enemyFleet.totalCargoSpace
    const maxLootAmt = Math.floor(enemyFleet.cargo.total * cargoRatio)
    const baseLootAmt = Math.floor(Math.random() * maxLootAmt)
    const lootAmt = weightedAvg([baseLootAmt, enemyFleet.cargo.total], [25, gs.fleet.totalSkills.getAmount(SKILLS.Salvage)])
    const loot = enemyFleet.cargo.randomSubset(lootAmt)
    const disabledPlayerShips = gs.encounter.playerShips.filter(s=>s.disabled)

    gs.captain.infamy += infamy
    gs.captain.fame += fame

    // Award experience points based on enemy fleet strength
    const expGained = Math.round(AVERAGE_EXP_FROM_COMBAT * (enemyFleet.combatRating / 10))
    gs.captain.expPoints += expGained

    let msg = `You defeated the ${fleetName}!<br/>`
    if (infamy > 0) msg += `Your nefarious victory gains you ${infamy} infamy.<br/>`
    if (fame > 0) msg += `Your glorious victory gains you ${fame} fame.<br/>`
    msg += `You gained ${expGained} experience points.<br/>`

    if (disabledPlayerShips.length > 0) {
        msg += `${disabledPlayerShips.length} of your ships were disabled in the fighting.<br/>`
        msg += loseCargoFromDisabledShips(disabledPlayerShips)
    }

    msg += conductRepairs()

    if (disabledEnemyShips.length > 0) {
        msg += `The ${fleetName} left behind ${disabledEnemyShips.length} disabled ships!<br/>`
        msg += `Your scanners reveal ${baseLootAmt} units of cargo amid the wreckage.<br/>`
        if (lootAmt > baseLootAmt) msg += `Your salvaging skills allow you to recover an additional ${lootAmt - baseLootAmt} units of cargo.<br/>`
        if (!isNaN(creditsAmt) && creditsAmt > 0) msg += `You also salvage ${finalCredits}CR from the wreckage${officersShare ? ` (-${officersShare}CR for officers)` : ''}.<br/>`
    }
    showModal(gs.encounter.encounterType.name, msg, [
        lootAmt > 0 ? ['Loot', ()=>showLootMenu(loot)] : ['Continue', ()=>endEncounter()]
    ])
}

function showPlayerDefeatedHazardsModal() {
    console.log('showPlayerDefeatedHazardsModal');
    const {enemyFleet, fleetName, disabledEnemyShips, playerFlagship} = gs.encounter
    // Only count ships disabled by the player flagship
    const playerKilledShips = disabledEnemyShips.filter(ship => ship.disabledByShip === playerFlagship)
    const abandonedCargoCapacity = playerKilledShips.reduce( (total, ship) => {
        return total + ship.cargoSpace
    }, 0)
    const cargoRatio = abandonedCargoCapacity / enemyFleet.totalCargoSpace
    const maxLootAmt = Math.floor(enemyFleet.cargo.total * cargoRatio)
    const baseLootAmt = Math.floor(Math.random() * maxLootAmt)
    const lootAmt = weightedAvg([baseLootAmt, enemyFleet.cargo.total], [25, gs.fleet.totalSkills.getAmount(SKILLS.Salvage)])
    const loot = enemyFleet.cargo.randomSubset(lootAmt)
    const disabledPlayerShips = gs.encounter.playerShips.filter(s=>s.disabled)
    
    // Award experience points based on mining success
    const expGained = playerKilledShips.length > 0 ? Math.round(AVERAGE_EXP_FROM_MINING * (playerKilledShips.length / disabledEnemyShips.length)) : 0
    gs.captain.expPoints += expGained
    
    let msg = ''
    msg += `You survived the ${fleetName}!<br/>`
    if (expGained > 0) msg += `You gained ${expGained} experience points from mining.<br/>`

    if (disabledPlayerShips.length > 0) {
        msg += `${disabledPlayerShips.length} of your ships were disabled.<br/>`
        msg += loseCargoFromDisabledShips(disabledPlayerShips)
    }

    msg += conductRepairs()


    if (playerKilledShips.length > 0) {
        msg += `You personally destroyed ${playerKilledShips.length} ${fleetName}!<br/>`
        msg += `Your scanners reveal ${baseLootAmt} units of usable material amid the wreckage.<br/>`
        if (lootAmt > baseLootAmt) msg += `Your salvaging skills allow you to recover an additional ${lootAmt - baseLootAmt} units of usable material.<br/>`
    }
    showModal(gs.encounter.encounterType.name, msg, [
        lootAmt > 0 ? ['Loot', ()=>showLootMenu(loot)] : ['Continue', ()=>endEncounter()]
    ])
}

function showNeutralsBribePlayerModal(maxCredits = 1000) {
    const baseCredits = Math.ceil(maxCredits*Math.random()/2)
    const credits = Math.round(weightedAvg([baseCredits, maxCredits], [25, gs.fleet.totalSkills.getAmount(SKILLS.Barter)]))
    const officersShare = gs.fleet.calcTotalCRShare(credits, true)
    const finalCredits = credits - officersShare
    let msg = `The ${gs.encounter.fleetName} frantically offers you ${baseCredits}CR to let them go unharmed!<br/>`
    if (credits > baseCredits) msg += `You employ your haggling skills and make them an offer they can't refuse.<br/>Their offer increases to ${credits}CR.<br/>`
    showModal(gs.encounter.fleetName, msg, [
        ['Accept Bribe', ()=>{
            gs.credits += finalCredits
            showModal(gs.encounter.fleetName, `You accept the tribute of ${finalCredits}CR${officersShare ? ` (-${officersShare}CR for officers)` : ''}.<br/>The ${gs.encounter.fleetName} anxiously departs before you can change your mind.<br/>`, [['Continue', ()=>endEncounter()]])
        }],
        ['Refuse', ()=>{
            showModal(gs.encounter.fleetName, `You scornfully refuse the tribute!<br/>The ${gs.encounter.fleetName} readies for combat!<br/>`, [['Continue', ()=>startCombat(false)]])
        }]
    ])
}

function showPlayerDefeatedByNeutralsModal( infamyLossMultiplier = 1) {
    console.log('showPlayerDefeatedByNeutralsModal', { infamyLossMultiplier });
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

    msg += conductRepairs()

    showModal(gs.encounter.encounterType.name, msg, [['Continue', ()=>endEncounter()]])
}

function showPlayerDefeatedByHazardsModal() {
    console.log('showPlayerDefeatedByHazardsModal');
    const {fleetName, disabledPlayerShips} = gs.encounter
    
    let msg = ''
    msg += `Your ships were scattered by the ${fleetName}.<br/>`

    if (disabledPlayerShips.length > 0) {
        msg += `${disabledPlayerShips.length} of your ships were disabled in the fighting.<br/>`
        msg += loseCargoFromDisabledShips(disabledPlayerShips)
    }

    msg += conductRepairs()

    showModal(gs.encounter.encounterType.name, msg, [['Continue', ()=>endEncounter()]])
}

function showPlayerDefeatedByPiratesModal() {
    console.log('showPlayerDefeatedByPiratesModal');
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
        const canLootAmount = fleet.availableCargoSpace
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
    msg += `The ${fleetName} sadronically thank you for your time and depart.<br/>`

    msg += conductRepairs()

    showModal(gs.encounter.encounterType.name, msg, [['Continue', ()=>endEncounter()]])
}

function showPlayerDefeatedByPoliceModal() {
    console.log('showPlayerDefeatedByPoliceModal');
    const {fleetName} = gs.encounter
    let fine = 5000
    let msg = `The ${fleetName} are taking you in! You are fined ${fine} for resisting arrest!<br/>`
    msg += `Your ships are roughly searched for illegal goods.<br/>`
    const [smugglingFine, seized] = seizePlayerContraband()
    msg += smugglingFine > 0 ? `They confiscate ${seized.total} units of contraband, and add a fine of ${smugglingFine} to your existing bounty.<br/>`
    : `They find no contraband aboard your ships, but that hardly excuses your other crimes.<br/>`
    showModal(fleetName, msg, [['Continue', ()=> showFineOrJailModal(fine+smugglingFine)]])
}

function showPlayerEscapedFromEnemyModal() {
    console.log('showPlayerEscapedFromEnemyModal');
    const {fleetName, disabledPlayerShips, escapedPlayerShips, enemyFleet} = gs.encounter
    
    // Award experience points for successfully escaping
    const expGained = Math.round(AVERAGE_EXP_FROM_ESCAPING * (enemyFleet.combatRating / 10))
    gs.captain.expPoints += expGained
    
    let msg = `You escaped from the ${fleetName}.<br/>`
    msg += `You gained ${expGained} experience points for surviving the encounter.<br/>`
    if (escapedPlayerShips.length > 0) msg += `${escapedPlayerShips.length} of your ships exited the battlefield intact.<br/>`
    if (disabledPlayerShips.length > 0) {
        msg += `However, ${disabledPlayerShips.length} were disabled in the fighting.<br/>`
        msg += loseCargoFromDisabledShips(disabledPlayerShips)
    }

    msg += conductRepairs()

    showModal(gs.encounter.encounterType.name, msg, [['Continue', ()=>endEncounter()]])
}

function showPlayerEscapedFromHazardsModal() {
    console.log('showPlayerEscapedFromHazardsModal');
    const {fleetName, disabledPlayerShips, escapedPlayerShips, enemyFleet, disabledEnemyShips} = gs.encounter
    
    // Award experience points for escaping hazards
    const expGained = Math.round(AVERAGE_EXP_FROM_ESCAPING * (escapedPlayerShips.length / (escapedPlayerShips.length + disabledPlayerShips.length)))
    gs.captain.expPoints += expGained
    
    let msg = `You escaped from the ${fleetName}.<br/>`
    if (expGained > 0) msg += `You gained ${expGained} experience points for surviving.<br/>`
    if (escapedPlayerShips.length > 0) msg += `${escapedPlayerShips.length} of your ships made it out intact.<br/>`
    if (disabledPlayerShips.length > 0) {
        msg += `However, ${disabledPlayerShips.length} were disabled.<br/>`
        msg += loseCargoFromDisabledShips(disabledPlayerShips)
    }
    const abandonedCargoCapacity = disabledEnemyShips.reduce( (total, ship) => {
        return total + ship.cargoSpace
    }, 0)
    const cargoRatio = abandonedCargoCapacity / enemyFleet.totalCargoSpace
    const maxLootAmt = Math.floor(enemyFleet.cargo.total * cargoRatio)
    const baseLootAmt = Math.floor(Math.random() * maxLootAmt)
    const lootAmt = weightedAvg([baseLootAmt, enemyFleet.cargo.total], [25, gs.fleet.totalSkills.getAmount(SKILLS.Salvage)])
    const loot = enemyFleet.cargo.randomSubset(lootAmt)

    if (disabledPlayerShips.length > 0) {
        msg += `${disabledPlayerShips.length} of your ships were disabled in the fighting.<br/>`
        msg += loseCargoFromDisabledShips(disabledPlayerShips)
    }

    msg += conductRepairs()

    if (disabledEnemyShips.length > 0) {
        msg += `${disabledEnemyShips.length} of the ${fleetName} were destroyed!<br/>`
        msg += `Your scanners reveal ${baseLootAmt} units of cargo amid the wreckage.<br/>`
        if (lootAmt > baseLootAmt) msg += `Your salvaging skills allow you to recover an additional ${lootAmt - baseLootAmt} units of cargo.<br/>`
    }
    showModal(gs.encounter.encounterType.name, msg, [
        lootAmt > 0 ? ['Loot', ()=>showLootMenu(loot)] : ['Continue', ()=>endEncounter()]
    ])
}

/**
 * 
 * @returns {[number, CountsMap]} - [fine amount, seized cargo]
 */
function seizePlayerContraband() {
    const illegalCargo = gs.fleet.cargo.keys.filter( ct => ct.isIllegal )
    const seized = new CountsMap()
    let fine = 0
    for (const [ct, amt] of gs.fleet.cargo.counts) {
        if (illegalCargo.includes(ct)) {
            const finePerUnit = ct.value*2
            fine += finePerUnit * amt
            seized.increment(ct, amt)
        }
        gs.fleet.cargo.setAmount(ct, 0) //confiscate all illegal cargo
    }
    return [fine, seized]
}

function conductRepairs() {
    let msg = ''
    const hullDamage = gs.fleet.ships.reduce( (total, ship) => {
        return total + (ship.hull[1] - ship.hull[0])
    }, 0)
    if (hullDamage <= 0) return msg
    const repairRatio = weightedAvg([0, 1], [25*Math.random(), gs.fleet.totalSkills.getAmount(SKILLS.Engineer)])
    const repairableShips = gs.fleet.ships.filter(s=>!s.isDisabled)
    const nonRepairableShips = gs.fleet.ships.filter(s=>s.isDisabled)
    const repairableHullDamage = repairableShips.reduce( (total, ship) => {
        return total + (ship.hull[1] - ship.hull[0])
    }, 0)
    const repairedAmt = Math.floor(repairRatio * repairableHullDamage)
    msg += `Your ships suffered ${hullDamage} total hull damage.<br/>`
    if (repairedAmt <= 0) return msg
    if (nonRepairableShips.length > 0) msg += `Because ${nonRepairableShips.length} ships were disabled, only ${repairableHullDamage} is repairable.<br/>`
    msg += `Your engineering skill lets you repair ${repairedAmt} points of hull damage across your fleet.<br/>`
    repairRandomly(repairableShips, repairedAmt)
    return msg
}

function repairRandomly(ships = [], repairedAmt = 0) {
    if (ships.length <= 0 || repairedAmt <= 0) return
    for (let i=0; i<repairedAmt; i++) {
        const damagedShips = ships.filter(s=>s.hull[0] < s.hull[1])
        if (damagedShips.length <= 0) break
        const ship = rndMember(damagedShips)
        ship.repairHull(1)
    }
}

function showPlayerPoliceInspectionModal() {
    console.log('showPlayerPoliceInspectionModal');
    let msg = ''
    const {fleetName} = gs.encounter
    const [fine, seized] = seizePlayerContraband()
    if (fine == 0) {
        msg += `The ${fleetName} inspect your cargo and find nothing illegal. They thank you for your cooperation and wish you a safe journey.<br/>`
        showModal(fleetName, msg, [['Continue', ()=>endEncounter()]])
    }
    else {
        msg += `The ${fleetName} inspect your cargo and discover ${seized.total} units of contraband!<br/>`
        msg += `All of your contraband is confiscated.<br/>`
        showModal(fleetName, msg, [['Continue', ()=> showFineOrJailModal(fine)]])
    }
}

function showFineOrJailModal(fine = 0) {
    const {fleetName} = gs.encounter
    const fineFromBounty = Math.ceil(Math.min(Math.max(gs.captain.bounty*Math.random(),100), gs.captain.bounty))
    const jailDays = Math.round(JAIL_DAYS_PER_1000CR_FINE*(fine+fineFromBounty)/1000) //1 day of jail time per 1000CR of fine
    gs.captain.bounty -= fineFromBounty

    let msg = ''
    if (fineFromBounty) msg += `The ${fleetName} are aware of some of the bounties on your head, to the tune of ${fineFromBounty}CR.<br/>`
    if (fine) msg += `The ${fleetName} give you the option to pay a fine of ${fine}CR${fineFromBounty ? `, plus ${fineFromBounty} to clear your bounty` : ''} or serve ${describeTimespan(jailDays/365)} in jail.<br/>`
    else msg += `The ${fleetName} give you the option to pay off your bounty of ${fineFromBounty}CR or serve ${describeTimespan(jailDays/365)} in jail.<br/>`
    showModal(fleetName, msg, [
        ['Pay Fine', ()=>{
            gs.credits -= (fine + fineFromBounty)
            msg += `You pay the fine of ${fine+fineFromBounty}CR.<br/>`
            msg += `Your remaining CR: ${gs.credits}<br/>`
            if (fineFromBounty) msg += `Your bounty has been reduced to: ${gs.captain.bounty}CR.<br/>`
            showModal(fleetName, msg, [['Continue', ()=>endEncounter()]])
        }, gs.credits >= fine + fineFromBounty],
        ['Serve Jail Time', ()=>{
            const [nearestPlanet] = gs.system.calcNearestPlanet(gs.fleet)
            gs.fleet.dock(nearestPlanet)
            gs.year += jailDays / 365.0
            msg += `The ${fleetName} take you to the nearest planet, ${nearestPlanet.name}.<br/>`
            msg += `You serve ${describeTimespan(jailDays/365)} in jail.<br/>`
            if (fineFromBounty) msg += `Your bounty has been reduced to: ${gs.captain.bounty}CR.<br/>`
            showModal(fleetName, msg, [['Continue', ()=>endEncounter()]])
        }],
    ])
}