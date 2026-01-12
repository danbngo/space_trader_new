

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
        /** @type {Combat|null} */
        this.combat = null
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
        return this.combat ? this.combat.playerShips : []
    }

    get enemyShips() {
        return this.combat ? this.combat.enemyShips : []
    }

    /**
     * Called when the encounter starts. Override in subclasses.
     */
    onStart() {
    }

    /**
     * Called when the player wins the encounter. Override in subclasses.
     */
    onVictory() {
        // Override in subclass
    }

    /**
     * Called when the player loses the encounter. Override in subclasses.
     */
    onDefeat() {
        // Override in subclass
    }

    /**
     * Called when the player escapes the encounter. Override in subclasses.
     */
    onEscape() {
        // Override in subclass
    }

    /**
     * Called when the player surrenders. Override in subclasses.
     */
    onSurrender() {
        // Override in subclass
    }

    /**
     * Starts active combat.
     * @param {boolean} playerHasInitiative - Whether the player acts first.
     */
    startCombat(playerHasInitiative = true) {
        console.log('Encounter.startCombat', { playerHasInitiative })
        
        if (!this.combat) {
            this.combat = new Combat(gs.fleet, this.fleet)
        }
        
        this.combat.start(playerHasInitiative)
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
    startEncounter() {
        console.log('startEncounter:',this)
        if (currentMap && currentMap.togglePause) currentMap.togglePause(true)
        gs.encounter = this
        
        // Create combat if this encounter has combat
        if (this.fleet && this.fleet.ships && this.fleet.ships.length > 0) {
            this.combat = new Combat(gs.fleet, this.fleet)
            this.combat.start(true) // Player has initiative by default
            this.combatEnabled = true
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
        }
        
        this.combat = null
        
        // Trigger fade-out animation if travel map exists
        const travelMap = currentMap && (currentMap instanceof TravelMap) ? currentMap : null
        if (travelMap && typeof travelMap.fadeOutEnemyShips === 'function') {
            travelMap.fadeOutEnemyShips(() => {
                // After fade-out completes, fully end encounter
                gs.encounter = undefined
                closeModal()
                checkPlayerStranded()
            })
        } else {
            // No fade-out available, end immediately
            gs.encounter = undefined
            closeModal()
            checkPlayerStranded()
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

    /*showPlayerDidSurrenderModal() {
        console.log('showPlayerDidSurrenderModal');
        const fleetName = coloredName(this.fleet)
        let msg = `There's no other choice. You power your ships down and broadcast the universal signal for surrender.<br/>`
        // No reputation change on surrender
        showModal(fleetName, msg, [['Continue', ()=>this.onSurrender()]])
    }*/


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

    showPlayerAttackFleetModal(onContinue = ()=>this.startCombat(true)) {
        const {playerUndetected} = this
        console.log('showPlayerAttackFleetModal', { playerUndetected });
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
            this.startCombat()
        }]])
    }


    showPlayerDefeatedByNeutralsModal( infamyLossMultiplier = 1) {
        console.log('showPlayerDefeatedByNeutralsModal', { infamyLossMultiplier });
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



}