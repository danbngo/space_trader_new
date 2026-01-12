

/**
 * Represents a combat encounter between fleets.
 * @class Encounter
 */
class Encounter {
    /**
     * @param {EncounterType} encounterType - The type of encounter.
     * @param {Planet} planet - The planet where the encounter occurs.
     * @param {Fleet} fleet - The enemy fleet.
     * @param {Fleet|null} undetectedFleet
     */
    constructor(encounterType = ENCOUNTER_TYPES_ALL[0], planet, fleet, undetectedFleet) {
        console.log('Encounter.constructor', { encounterType, planet, fleet, undetectedFleet });
        /** @type {string} */
        this.uuid = generateUUID('encounter_')
        /** @type {EncounterType} */
        this.encounterType = encounterType;
        /** @type {Planet} */
        this.planet = planet;
        /** @type {Fleet} */
        this.fleet = fleet;
        /** @type {Fleet|null} */
        this.undetectedFleet = undetectedFleet;
        /** @type {boolean} */
        this.combatEnabled = false;
        /** @type {boolean} */
        this.playerUndetected = undetectedFleet !== gs.fleet
        /** @type {Map<Ship, number>} */
        this.playerShipHullsAtStart = new Map()
        for (const ship of gs.fleet.ships) {
            this.playerShipHullsAtStart.set(ship, ship.hull[0])
        }
    }

    calcPlayerHullDamages() {
        let totalDamage = 0
        for (const ship of gs.fleet.ships) {
            const hullAtStart = this.playerShipHullsAtStart.get(ship) || ship.hull[1]
            const damage = hullAtStart - ship.hull[0]
            if (damage > 0) totalDamage += damage
        }
        return totalDamage
    }

    calcPlayerRepairableHull() {
        let totalRepairable = 0
        for (const ship of gs.fleet.ships) {
            if (ship.disabled) continue
            const hullAtStart = this.playerShipHullsAtStart.get(ship) || ship.hull[1]
            const repairable = hullAtStart - ship.hull[0]
            if (repairable > 0) totalRepairable += repairable
        }
        return totalRepairable
    }

    calcPlayerDamagedShips() {
        const damagedShips = []
        for (const ship of gs.fleet.ships) {
            const hullAtStart = this.playerShipHullsAtStart.get(ship) || ship.hull[1]
            if (ship.hull[0] < hullAtStart && !ship.disabled) {
                damagedShips.push(ship)
            }
        }
        return damagedShips
    }

    // Getters for accessing combat ships
    get playerShips() {
        return gs.combat ? gs.combat.playerShips : []
    }

    get enemyShips() {
        return gs.combat ? gs.combat.enemyShips : []
    }


    /**
     * Starts active combat.
     * @param {boolean} playerHasInitiative - Whether the player acts first.
     */
    startCombat(playerHasInitiative = true) {
        console.log('Encounter.startCombat', { playerHasInitiative })
        
        if (!gs.combat) {
            gs.combat = new Combat(gs.fleet, this.fleet)
        }
        
        gs.combat.start(playerHasInitiative)
        this.combatEnabled = true
        
        closeModal()
        if (currentMap && currentMap.togglePause) currentMap.togglePause(false)
        if (currentMap && currentMap.refresh) currentMap.refresh()
        if (currentMap && currentMap.refreshLogic) currentMap.refreshLogic()
    }

    /**
     * Ends combat and triggers appropriate outcome.
     */
    endCombat() {
        console.log('Encounter.endCombat')
        const result = gs.combat ? gs.combat.result : null
        if (result == ENCOUNTER_RESULTS.Defeat) {
            showModal(`Defeat`, `All your ships have been disabled!`, [['Continue', ()=>this.onDefeat()]])
        }
        else if (result == ENCOUNTER_RESULTS.Victory) {
            showModal(`Victory`, `All enemy ships have fled or been disabled! You win!`, [['Continue', ()=>this.onVictory()]])
        }
        else if (result == ENCOUNTER_RESULTS.Escaped) {
            showModal(`Escape`, `You fled from the battlefield!`, [['Continue', ()=>this.onEscape()]])
        }
        else if (result == ENCOUNTER_RESULTS.Surrendered) {
            showModal(`Surrender`, `You surrendered to the enemy fleet.`, [['Continue', ()=>this.onSurrender()]])
        }
        else {
            throw new Error('Encounter.endCombat called with unknown result: '+result)
        }
    }

    /**
     * Calculates cargo lost from disabled ships.
     * @param {Ship[]} disabledShips
     * @returns {string} Message describing lost cargo
     */
    loseCargoFromDisabledShips(disabledShips = []) {
        console.log('Encounter.loseCargoFromDisabledShips', { disabledShips })
        const disabledShipsCargoCapacity = disabledShips.reduce((total, ship) => {
            return total + ship.cargoSpace
        }, 0)
        const cargoRatio = disabledShipsCargoCapacity / gs.fleet.totalCargoSpace
        const lostCargoAmt = Math.floor(gs.fleet.cargo.total * cargoRatio)
        if (lostCargoAmt <= 0) return ''
        let totalLostCargo = gs.fleet.cargo.randomSubset(lostCargoAmt)
        gs.fleet.cargo.subtractAmounts(totalLostCargo)
        const msg = `${lostCargoAmt} units of cargo drift into space from your disabled ships.<br/>`
        return msg
    }

    /**
     * Conducts repairs on damaged player ships.
     * @returns {string} Message describing repairs
     */
    conductRepairs() {
        let msg = ''
        const hullDamage = this.calcPlayerHullDamages()
        if (hullDamage <= 0) return ''

        const repairRatio = weightedAvg([0, 1], [25*Math.random(), gs.fleet.totalSkills.getAmount(SKILLS.Engineer)])
        const repairableShips = this.calcPlayerDamagedShips()
        const nonRepairableShips = gs.fleet.ships.filter(s=>s.disabled)
        const repairableHullDamage = this.calcPlayerRepairableHull()
        const repairedAmt = Math.floor(repairRatio * repairableHullDamage)
        msg += `Your ships suffered ${hullDamage} total hull damage.<br/>`
        if (repairedAmt <= 0) return msg
        if (nonRepairableShips.length > 0) msg += `Because ${nonRepairableShips.length} ships were disabled, only ${repairableHullDamage} is repairable.<br/>`
        msg += `Your engineering skill lets you repair ${repairedAmt} points of hull damage across your fleet.<br/>`
        this.repairRandomly(repairableShips, repairedAmt)
        console.log('conductRepairs', { hullDamage, repairRatio, repairableHullDamage, repairedAmt, repairableShips, nonRepairableShips, msg })
        return msg
    }

    /**
     * Repairs random ships.
     * @param {Ship[]} ships
     * @param {number} repairedAmt
     */
    repairRandomly(ships = [], repairedAmt = 0) {
        if (ships.length <= 0 || repairedAmt <= 0) return
        for (let i=0; i<repairedAmt; i++) {
            const damagedShips = ships.filter(s=>s.hull[0] < s.hull[1])
            if (damagedShips.length <= 0) break
            const ship = rndMember(damagedShips)
            ship.repairHull(1)
        }
    }

    /**
     * Damages random ships.
     * @param {Ship[]} ships
     * @param {number} dmg
     */
    damageRandomly(ships = [], dmg = 0) {
        if (ships.length <= 0 || dmg <= 0) return
        for (let i=0; i<dmg; i++) {
            const harmableShips = ships.filter(s=>s.hull[0] > 0)
            if (harmableShips.length <= 0) break
            const ship = rndMember(harmableShips)
            ship.takeDamage(1, true)
        }
    }

    /**
     * Initializes and starts a space encounter, positioning ships and setting up combat.
     */
    onStart() {
        console.log('onStart:',this)
        if (currentMap && currentMap.togglePause) currentMap.togglePause(true)
        gs.encounter = this
    }

    /**
     * Called when the player wins the encounter. Override in subclasses.
     */
    onVictory() {
        this.showPlayerDefeatedEnemyModal()
    }

    /**
     * Called when the player loses the encounter. Override in subclasses.
     */
    onDefeat() {
        this.showPlayerDefeatedByNeutralsModal()
    }

    /**
     * Called when the player escapes the encounter. Override in subclasses.
     */
    onEscape() {
        this.showPlayerEscapedFromEnemyModal()
    }

    onSurrender() {
        this.showPlayerSurrenderedToNeutralsModal()
    }

    showPlayerSurrenderedToNeutralsModal() {
        console.log('showPlayerSurrenderedToNeutralsModal');
        const enemyFleet = this.fleet
        const planet = this.planet
        
        let msg = `You power down your ships and signal surrender to the ${coloredName(enemyFleet)}.<br/>`
        msg += `The ${coloredName(enemyFleet)} conduct a citizen's arrest and transmit your location to local authorities.<br/>`
        msg += `Within hours, police vessels arrive to take you into custody.<br/>`
        
        showModal('Surrender', msg, [['Continue', ()=>this.showPlayerSurrenderedToAuthoritiesModal()]])
    }

    showPlayerSurrenderedToAuthoritiesModal() {
        console.log('showPlayerSurrenderedToAuthoritiesModal');
        const planet = this.planet
        const disabledPlayerShips = this.playerShips.filter(s=>s.disabled)
        
        if (!planet) {
            // Fallback if no planet context
            showModal('Authorities', 'The authorities take you to the nearest station for processing.', [['Continue', ()=>this.endEncounter()]])
            return
        }
        
        // Calculate total bounty/fine
        const totalBounty = gs.captain.bounty.getAmount(planet)
        
        // Confiscate all cargo
        const totalCargo = gs.fleet.cargo.total
        const confiscatedCargo = gs.fleet.cargo.clone()
        gs.fleet.cargo.clear()
        
        // Separate out illegal cargo
        const illegalCargo = new CountsMap()
        for (const cargoType of confiscatedCargo.keys) {
            if (cargoType.illegal) {
                illegalCargo.increment(cargoType, confiscatedCargo.getAmount(cargoType))
            }
        }
        const hasIllegalCargo = illegalCargo.total > 0
        
        // Calculate jail time
        const jailDays = Math.ceil((totalBounty / 1000) * JAIL_DAYS_PER_1000CR_FINE)
        const jailYears = jailDays / 365
        
        let msg = `The authorities board your vessels and conduct a thorough inspection.<br/>`
        
        if (totalCargo > 0) {
            msg += `All ${totalCargo} units of cargo are confiscated as evidence.<br/>`
        }
        
        if (hasIllegalCargo) {
            msg += `<span style="color: rgb(${COLORS.Red.join(',')})">They discover ${illegalCargo.total} units of illegal contraband!</span><br/>`
            let illegalList = []
            for (const cargoType of illegalCargo.keys) {
                illegalList.push(`${cargoType.symbol} ${coloredName(cargoType)} (${illegalCargo.getAmount(cargoType)})`)
            }
            msg += `Illegal items: ${illegalList.join(', ')}<br/>`
        }
        
        if (disabledPlayerShips.length > 0) {
            msg += `${disabledPlayerShips.length} of your ships were disabled and require repairs.<br/>`
        }
        
        msg += `<br/>You are transported to ${coloredName(planet)} to face justice.<br/>`
        
        if (totalBounty > 0) {
            msg += `<br/>Your outstanding fine: <span style="color: rgb(${COLORS.Red.join(',')})">${totalBounty}CR</span><br/>`
            msg += `Prison sentence: ${jailDays} days (${roundToPlaces(jailYears, 2)} years)<br/>`
            msg += `<br/>How do you wish to resolve this?<br/>`
            
            /** @type {ButtonData[]} */
            const buttons = []
            
            // Option to pay fine
            if (gs.credits >= totalBounty) {
                buttons.push(['Pay Fine', ()=>{
                    gs.credits -= totalBounty
                    gs.captain.bounty.increment(planet, -totalBounty)
                    
                    let payMsg = `You pay the ${totalBounty}CR fine in full.<br/>`
                    payMsg += `Your record on ${coloredName(planet)} is cleared.<br/>`
                    payMsg += this.conductRepairs()
                    gs.fleet.dock(planet)
                    
                    showModal('Fine Paid', payMsg, [['Continue', ()=>this.endEncounter()]])
                }])
            } else {
                msg += `<span style="color: rgb(${COLORS.Red.join(',')})">You don't have enough credits to pay the fine.</span><br/>`
            }
            
            // Option to serve time
            buttons.push(['Serve Time', ()=>{
                gs.captain.bounty.increment(planet, -totalBounty)
                gs.year += jailYears
                
                let jailMsg = `You serve ${jailDays} days in prison on ${coloredName(planet)}.<br/>`
                jailMsg += `Time passes slowly behind bars...<br/>`
                jailMsg += `<br/>${roundToPlaces(jailYears, 2)} years later, you are released.<br/>`
                jailMsg += `Your record is cleared, but you've lost valuable time.<br/>`
                jailMsg += this.conductRepairs()
                
                gs.fleet.dock(planet)
                
                showModal('Released', jailMsg, [['Continue', ()=>this.endEncounter()]])
            }])
            
            showModal('Authorities', msg, buttons)
        } else {
            msg += `<br/>Surprisingly, you have no outstanding fines.<br/>`
            msg += `After confiscating your cargo, they release you with a stern warning.<br/>`
            msg += this.conductRepairs()
            
            // Transport to planet
            gs.fleet.dock(planet)
            
            showModal('Released', msg, [['Continue', ()=>this.endEncounter()]])
        }
    }


    /**
     * Ends the current encounter and returns to the star map.
     */
    endEncounter() {
        console.log('endEncounter');
        
        // End combat if active
        if (gs.combat) {
            gs.combat.end()
            gs.combat = null
        }

        if (currentModal) closeModal()
        if (!gs.location) checkPlayerStranded() //dont check this if player already docked (likely involuntarily)
        
        // Trigger fade-out animation if travel map exists
        const travelMap = currentMap && (currentMap instanceof TravelMap) ? currentMap : null
        if (travelMap && typeof travelMap.fadeOutEnemyShips === 'function') {
            travelMap.fadeOutEnemyShips(() => {
                // After fade-out completes, fully end encounter and reset ship configs
                gs.encounter = undefined
                if (travelMap && typeof travelMap.resetNPCShipsConfig === 'function') {
                    travelMap.resetNPCShipsConfig()
                }
            })
        } else {
            // No fade-out available, end immediately
            gs.encounter = undefined
            if (travelMap && typeof travelMap.resetNPCShipsConfig === 'function') {
                travelMap.resetNPCShipsConfig()
            }
        }
    }

    showPlayerRefuseSurrenderModal() {
        console.log('showPlayerRefuseSurrenderModal');
        const fleetName = coloredName(this.fleet)
        const planet = this.planet
        const reputationMultiplier = this.encounterType.reputationMultiplier
        const reputation = Math.ceil(ENCOUNTER_BASE_REPUTATION_EFFECT_ON_NO_SURRENDER * reputationMultiplier)
        const bounty = reputationMultiplier > 0 ? ENCOUNTER_BASE_FINE_ON_ATTACK * reputationMultiplier : 0
        
        let msg = `You refuse to submit to the ${fleetName} demands, and the battle is joined!<br/>`
        if (reputation) {
            if (planet) msg += gs.captain.grantReputation(planet, reputation)
        }
        if (bounty > 0 && planet) {
            msg += gs.captain.grantBounty(planet, bounty)
        }
        showModal(coloredName(this.fleet), msg, [['Continue', ()=>this.startCombat(false)]])
    }

    /**
     * Unified attack modal that handles both militant and non-militant factions.
     * Militant factions go straight to combat, non-militant may attempt to bribe.
     */
    showPlayerAttackModal() {
        const {playerUndetected} = this
        
        console.log('showPlayerAttackModal', { playerUndetected });
        const fleetName = coloredName(this.fleet)
        const planet = this.planet
        const reputationMultiplier = this.encounterType.reputationMultiplier
        const reputation = Math.ceil(ENCOUNTER_BASE_REPUTATION_EFFECT_ON_ATTACK * reputationMultiplier)
        const bounty = reputationMultiplier > 0 ? ENCOUNTER_BASE_FINE_ON_ATTACK * reputationMultiplier : 0

        if (playerUndetected) {
            // Drop shields after repositioning
            for (const ship of this.fleet.ships) ship.shields[0] = 0
        }

        let msg = `You ${playerUndetected ? 'sneakily ' : ''}attack the ${fleetName}!<br/>`
        if (playerUndetected) msg += `The ${fleetName} are caught with their shields down!<br/>`
        if (reputation) {
            if (planet) msg += gs.captain.grantReputation(planet, reputation)
        }
        if (bounty > 0 && planet) {
            msg += gs.captain.grantBounty(planet, bounty)
        }

        showModal(fleetName, msg, [['Continue', ()=>{
            // Militant factions fight to the death
            if (this.encounterType.canBribe) {
                this.startCombat(true)
            } else {
                // Non-militant factions may try to bribe if outmatched
                let combatAdvantage = gs.fleet.combatRating / this.fleet.combatRating
                // Combat advantage varies from 0.5x to 2x based on player's infamy
                combatAdvantage *= 2 - (75/(50 + Math.abs(Math.min(0, gs.captain.calcReputationForTarget(this.fleet.planet)))))
                
                if (combatAdvantage * Math.random() > 1.5) {
                    // Try to show bribe modal if this encounter type supports it
                    // Note: showNeutralsBribePlayerModal exists on NeutralsEncounter subclasses
                    if (typeof this['showNeutralsBribePlayerModal'] === 'function') {
                        this['showNeutralsBribePlayerModal'](this.fleet.captain.credits)
                    } else {
                        // No bribe modal available, just start combat
                        this.startCombat(true)
                    }
                } else {
                    this.startCombat(true)
                }
            }
        }]])
    }

    showPlayerDefeatedByNeutralsModal() {
        console.log('showPlayerDefeatedByNeutralsModal',);
        const enemyFleet = this.fleet
        const disabledPlayerShips = gs.combat.disabledPlayerShips

        let msg = ''
        msg += `The ${coloredName(enemyFleet)} seem shocked to have defeated you.<br/>`
        msg += `They quickly depart the scene in case there are other attackers nearby.<br/>`

        // No reputation change on defeat by neutrals
        
        if (disabledPlayerShips.length > 0) {
            msg += `${disabledPlayerShips.length} of your ships were disabled in the fighting.<br/>`
            msg += this.loseCargoFromDisabledShips(disabledPlayerShips)
        }

        msg += this.conductRepairs()

        showModal(this.encounterType.name, msg, [['Continue', ()=>this.endEncounter()]])
    }

    showNeutralsBribePlayerModal(maxCredits = 1000, infamyModifier = 0) {
        const baseCredits = Math.ceil(maxCredits*Math.random()/2)
        const credits = Math.round(weightedAvg([baseCredits, maxCredits], [25, gs.fleet.totalSkills.getAmount(SKILLS.Barter)]))
        const officersShare = gs.fleet.calcTotalCRShare(credits, true)
        const finalCredits = credits - officersShare
        const isInfamous = infamyModifier > Math.random()

        let msg = ''
        if (isInfamous) {
            msg = `The ${coloredName(this.fleet)} recognize your notorious reputation and hastily offer you ${credits}CR, desperately hoping to avoid your wrath!<br/>`
        } else {
            msg = `The ${coloredName(this.fleet)} frantically offers you ${credits}CR to let them go unharmed!<br/>`
        }
        if (credits > baseCredits) msg += `You employ your haggling skills and make them an offer they can't refuse.<br/>Their offer increases to ${credits}CR.<br/>`
        
        showModal(coloredName(this.fleet), msg, [
            ['Accept Bribe', ()=>{
                gs.credits += finalCredits
                const acceptMsg = isInfamous
                    ? `You accept the tribute of ${finalCredits}CR${officersShare ? ` (-${officersShare}CR for officers)` : ''}.<br/>The ${coloredName(this.fleet)} flee in terror, grateful to have escaped with their lives.<br/>`
                    : `You accept the tribute of ${finalCredits}CR${officersShare ? ` (-${officersShare}CR for officers)` : ''}.<br/>The ${coloredName(this.fleet)} anxiously departs before you can change your mind.<br/>`
                showModal(coloredName(this.fleet), acceptMsg, [['Continue', ()=>this.endEncounter()]])
            }],
            ['Refuse', ()=>{
                showModal(coloredName(this.fleet), `You scornfully refuse the tribute!<br/>The ${coloredName(this.fleet)} readies for combat!<br/>`, [['Continue', ()=>this.startCombat(false)]])
            }]
        ])
    }
    showPlayerEscapedFromEnemyModal() {
        console.log('showPlayerEscapedFromEnemyModal');
        const {enemyFleet, disabledPlayerShips, escapedPlayerShips, playerShips} = gs.combat
        
        // Award experience points for successfully escaping
        const expGained = Math.round(AVERAGE_EXP_FROM_ESCAPING * (enemyFleet.combatRating / gs.fleet.combatRating))
        
        let msg = `You escaped from the ${coloredName(enemyFleet)}!<br/>`
        msg += gs.captain.grantExperience(expGained)
        if (escapedPlayerShips.length > 0) msg += `${escapedPlayerShips.length == playerShips.length ? 'All' : escapedPlayerShips.length} of your ships exited the battlefield intact.<br/>`
        if (disabledPlayerShips.length > 0) {
            msg += `However, ${disabledPlayerShips.length} were disabled in the fighting.<br/>`
            msg += this.loseCargoFromDisabledShips(disabledPlayerShips)
        }

        msg += this.conductRepairs()

        showModal(this.encounterType.name, msg, [['Continue', ()=>this.endEncounter()]])
    }

    showPlayerDefeatedEnemyModal() {
        console.log('showPlayerDefeatedEnemyModal');
        const {enemyFleet, disabledEnemyShips} = gs.combat
        const planet = this.planet
        const reputation = Math.ceil(ENCOUNTER_BASE_REPUTATION_EFFECT_ON_VICTORY * this.encounterType.reputationMultiplier)
        const abandonedCargoCapacity = disabledEnemyShips.reduce( (total, ship) => {
            return total + ship.cargoSpace
        }, 0)
        let creditsAmt = Math.ceil(Math.random() * enemyFleet.captain.credits * (abandonedCargoCapacity / enemyFleet.totalCargoSpace))
        const officersShare = gs.fleet.calcTotalCRShare(creditsAmt, true)
        const finalCredits = creditsAmt - officersShare
        gs.credits += finalCredits
        if (isNaN(gs.credits)) throw new Error('creditsAmt was NaN!')
        creditsAmt = finalCredits
        const cargoRatio = abandonedCargoCapacity / enemyFleet.totalCargoSpace
        const maxLootAmt = Math.ceil(enemyFleet.cargo.total * cargoRatio)
        const baseLootAmt = Math.ceil(Math.random() * maxLootAmt)
        const lootAmt = Math.floor(weightedAvg([baseLootAmt, maxLootAmt], [25, gs.fleet.totalSkills.getAmount(SKILLS.Salvage)]))
        const loot = enemyFleet.cargo.randomSubset(lootAmt)
        const disabledPlayerShips = this.playerShips.filter(s=>s.disabled)

        // Award experience points based on enemy fleet strength
        const expGained = Math.round(AVERAGE_EXP_FROM_COMBAT * (enemyFleet.combatRating / gs.fleet.combatRating))

        let msg = `You defeated the ${coloredName(enemyFleet)}!<br/>`
        msg += gs.captain.grantExperience(expGained)
        if (reputation) {
            if (planet) msg += gs.captain.grantReputation(planet, reputation)
        }

        if (disabledPlayerShips.length > 0) {
            msg += `${disabledPlayerShips.length} of your ships were disabled in the fighting.<br/>`
            msg += this.loseCargoFromDisabledShips(disabledPlayerShips)
        }

        msg += this.conductRepairs()

        if (disabledEnemyShips.length > 0) {
            msg += `The ${coloredName(enemyFleet)} left behind ${disabledEnemyShips.length} disabled ships!<br/>`
            msg += `Your scanners reveal ${baseLootAmt} units of cargo amid the wreckage.<br/>`
            if (lootAmt > baseLootAmt) msg += `Your salvaging skills allow you to recover an additional ${lootAmt - baseLootAmt} units of cargo.<br/>`
            if (!isNaN(creditsAmt) && creditsAmt > 0) msg += `You also salvage ${finalCredits}CR from the wreckage${officersShare ? ` (-${officersShare}CR for officers)` : ''}.<br/>`
        }
        showModal(this.encounterType.name, msg, [
            lootAmt > 0 ? ['Loot', ()=>showLootMenu(loot)] : ['Continue', ()=>this.endEncounter()]
        ])
    }


}