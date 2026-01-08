

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
        /** @type {Fleet} */
        this.playerFleet = gs.fleet
        /** @type {Ship[]} */
        this.playerShips = this.playerFleet.ships
        /** @type {Fleet} */
        this.enemyFleet = this.fleet
        /** @type {Ship[]} */
        this.enemyShips = this.enemyFleet.ships
        /** @type {Ship[]} */
        //this.ships = [...this.playerShips, ...this.enemyShips]
        /** @type {ENCOUNTER_RESULTS|null} */
        this.result = null //playerVictory, playerDefeat, playerSurrendered,
        /** @type {Fleet} */
        this.activeTurnFleet = this.playerFleet
        this.playerShipHullsAtStart = new Map()
        for (const ship of this.playerShips) {
            this.playerShipHullsAtStart.set(ship, ship.hull[0])
        }
    }

    get ships() {
        return [...this.playerShips, ...this.enemyShips]
    }

    calcPlayerHullDamages() {
        let totalDamage = 0
        for (const ship of this.playerShips) {
            const hullAtStart = this.playerShipHullsAtStart.get(ship) || ship.hull[1]
            const damage = hullAtStart - ship.hull[0]
            if (damage > 0) totalDamage += damage
        }
        return totalDamage
    }

    calcPlayerRepairableHull() {
        let totalRepairable = 0
        for (const ship of this.playerShips) {
            if (ship.disabled) continue
            const hullAtStart = this.playerShipHullsAtStart.get(ship) || ship.hull[1]
            const repairable = hullAtStart - ship.hull[0]
            if (repairable > 0) totalRepairable += repairable
        }
        return totalRepairable
    }

    calcPlayerDamagedShips() {
        const damagedShips = []
        for (const ship of this.playerShips) {
            const hullAtStart = this.playerShipHullsAtStart.get(ship) || ship.hull[1]
            if (ship.hull[0] < hullAtStart && !ship.disabled) {
                damagedShips.push(ship)
            }
        }
        return damagedShips
    }

    get disabledPlayerShips () { return this.playerShips.filter(s=>(s.disabled)) }
    get escapedPlayerShips () {return this.playerShips.filter(s=>(s.escaped)) }
    get disabledEnemyShips () {return this.enemyShips.filter(s=>(s.disabled)) }
    get activePlayerShips () {return this.playerShips.filter(s=>(!s.disabled && !s.escaped)) }
    get activeEnemyShips () {return this.enemyShips.filter(s=>(!s.disabled && !s.escaped)) }
    get activeShips () {return this.ships.filter(s=>(!s.disabled && !s.escaped)) }
    //get ships() { return [...this.playerShips, ...this.enemyShips] } //dont use. static.

    isTurnComplete() {
        //console.log('Encounter.isTurnComplete', { activeTurnFleet: this.activeTurnFleet });
        const activeFleetShips = this.activeTurnFleet.ships.filter(s=>(!s.disabled && !s.escaped))
        for (const ship of activeFleetShips) {
            if (ship.actionsRemaining > 0) {
                return false
            }
        }
        return true
    }

    handleTurnComplete() {
        console.log('Encounter.handleTurnComplete', { activeTurnFleet: this.activeTurnFleet });
        if (!this.isTurnComplete()) return
        if (this.activeTurnFleet === this.playerFleet) {
            this.activeTurnFleet = this.enemyFleet
        }
        else if (this.activeTurnFleet === this.enemyFleet) {
            this.activeTurnFleet = this.playerFleet
        }
        this.updateEncounterResult()
    }

    updateEncounterResult() {
        console.log('Encounter.updateEncounterResult:',this.activeEnemyShips,this.activePlayerShips);
        const {activeEnemyShips, activePlayerShips, escapedPlayerShips, playerShips} = this
        
        // Track disabled enemy ships for missions (initialize tracking set if needed)
        if (!this._missionTrackedShips) this._missionTrackedShips = new Set()
        
        for (const ship of this.ships) {
            if (ship.disabled && !this._missionTrackedShips.has(ship) && !this.playerShips.includes(ship)) {
                this._missionTrackedShips.add(ship)
                for (const mission of gs.missions) {
                    mission.onPlayerDestroyShip(ship, this.fleet)
                }
            }
        }
        
        // Victory: No active enemy ships remain
        if (activeEnemyShips.length === 0) {
            this.result = ENCOUNTER_RESULTS.Victory
            this.combatEnabled = false
            return
        }
        
        // Escaped: All player ships have escaped
        if (activePlayerShips.length === 0 && escapedPlayerShips.length === playerShips.length) {
            this.result = ENCOUNTER_RESULTS.Escaped
            this.combatEnabled = false
            return
        }
        
        // Defeat: No player ships escaped (all disabled)
        if (activePlayerShips.length === 0 && escapedPlayerShips.length === 0) {
            this.result = ENCOUNTER_RESULTS.Defeat
            this.combatEnabled = false
            return
        }

        throw new Error('partial escapes not implemented yet')
        
        console.log('Encounter result:',this.result);
    }

    calcOpposingFleet(fleet = new Fleet()) {
        console.log('EncounterAI.calcOpposingFleet', { fleet });
        if (fleet == this.playerFleet || fleet == gs.fleet) return this.fleet
        else return this.playerFleet
    }
    /**
     * Shows a message indicating the fleet doesn't want to interact again.
     * Use this to prevent player abuse of resource-granting encounters.
     */
    showAlreadyMetMessage() {
        const greeting = this.getGreetingDialogue?.() || null
        const message = greeting
            ? `"${greeting}" The ${coloredName(this.fleet)} seem to recognize you and politely decline further interaction.`
            : `The ${coloredName(this.fleet)} acknowledge you but seem disinterested in further interaction.`
        
        showModal(coloredName(this.fleet), message, [
            ['Continue', ()=>this.endEncounter()],
            ['Attack', ()=>this.showPlayerAttackModal()],
        ])
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
    startCombat(playerHasInitiative = false) {
        console.log('Encounter.startCombat', { playerHasInitiative })
        this.combatEnabled = true
        this.activeTurnFleet = playerHasInitiative ? gs.fleet : this.enemyFleet
        closeModal()
        if (currentMap && currentMap.togglePause && currentMap.refreshLogic) {
            currentMap.togglePause(false)
            currentMap.refreshLogic()
        } else throw new Error('unexpected map while starting combat!')
    }

    /**
     * Ends combat and triggers appropriate outcome.
     */
    endCombat() {
        console.log('Encounter.endCombat')
        const {result} = this
        if (result == ENCOUNTER_RESULTS.Defeat) {
            showModal(`Defeat`, `All your ships have been disabled!`, [['Continue', ()=>this.onDefeat()]])
        }
        else if (result == ENCOUNTER_RESULTS.Victory) {
            showModal(`Victory`, `All enemy ships have fled or been disabled! You win!`, [['Continue', ()=>this.onVictory()]])
        }
        else if (result == ENCOUNTER_RESULTS.Escaped) {
            showModal(`Escape`, `You fled from the battlefield!`, [['Continue', ()=>this.onEscape()]])
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
    }
    /**
     * Ends the current encounter and returns to the star map.
     */
    endEncounter() {
        console.log('endEncounter');
        gs.encounter = undefined
        showStarMap(gs.fleet)
        //restore all shields
        for (const s of gs.fleet.ships) s.restoreShields()
        //pause and show modal if player has no working ships, cant move
        //checkPlayerStranded()
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
            if (faction) msg += gs.captain.grantReputation(faction, reputation)
        }
        if (bounty > 0 && planet) {
            msg += gs.captain.grantBounty(planet, bounty)
        }
        showModal(coloredName(this.fleet), msg, [['Continue', ()=>this.startCombat(false)]])
    }

    showPlayerDidSurrenderModal() {
        console.log('showPlayerDidSurrenderModal');
        const fleetName = coloredName(this.fleet)
        const planet = this.planet
        const faction = this.fleet.factionType
        const reputationMultiplier = faction.reputationMultiplier
        const reputationShrink = Math.ceil(ENCOUNTER_BASE_REPUTATION_SHRINK_ON_SURRENDER / Math.abs(reputationMultiplier || 1))

        const surrenderDialogue = this.getPlayerDidSurrenderDialogue()

        let msg = `There's no other choice. You power your ships down and broadcast the universal signal for surrender.<br/>`
        if (surrenderDialogue) {
            msg += `"${surrenderDialogue}"<br/>`
        }
        // No reputation change on surrender

        showModal(fleetName, msg, [['Continue', ()=>this.onSurrender()]])
    }


    /**
     * Unified attack modal that handles both militant and non-militant factions.
     * Militant factions go straight to combat, non-militant may attempt to bribe.
     */
    showPlayerAttackModal() {
        const {playerUndetected} = this
        const isMilitant = this.fleet.factionType?.militant || false
        
        console.log('showPlayerAttackModal', { playerUndetected, isMilitant });
        const fleetName = coloredName(this.fleet)
        const planet = this.planet
        const faction = this.fleet.factionType
        const reputationMultiplier = faction.reputationMultiplier
        const reputation = Math.ceil(ENCOUNTER_BASE_REPUTATION_EFFECT_ON_ATTACK * reputationMultiplier)
        const bounty = reputationMultiplier > 0 ? ENCOUNTER_BASE_FINE_ON_ATTACK * reputationMultiplier : 0

        if (playerUndetected) {
            // Drop shields after repositioning
            for (const ship of this.ships) ship.shields[0] = 0
        }

        let msg = `You ${playerUndetected ? 'sneakily ' : ''}attack the ${fleetName}!<br/>`
        if (playerUndetected) msg += `The ${fleetName} are caught with their shields down!<br/>`
        if (reputation) {
            if (planet) msg += gs.captain.grantReputation(planet, reputation)
        }
        // Faction ALWAYS loses respect when you attack them
        if (faction) msg += gs.captain.grantReputation(faction, ATTACK_FACTION_NEGATIVE_REP)
        if (bounty > 0 && planet) {
            msg += gs.captain.grantBounty(planet, bounty)
        }

        showModal(fleetName, msg, [['Continue', ()=>{
            // Militant factions fight to the death
            if (isMilitant) {
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
        const faction = this.fleet.factionType
        const reputationMultiplier = faction.reputationMultiplier
        const reputation = Math.ceil(ENCOUNTER_BASE_REPUTATION_EFFECT_ON_ATTACK * reputationMultiplier)
        const bounty = reputationMultiplier > 0 ? ENCOUNTER_BASE_FINE_ON_ATTACK * reputationMultiplier : 0

        if (playerUndetected) {
            // Drop shields after repositioning
            for (const ship of this.ships) ship.shields[0] = 0
        }

        let msg = `You ${playerUndetected ? 'sneakily ' : ''}attack the ${fleetName}!<br/>`
        if (playerUndetected) msg += `The ${fleetName} are caught with their shields down!<br/>`
        if (reputation) {
            if (planet) msg += gs.captain.grantReputation(planet, reputation)
        }
        // Faction ALWAYS loses respect when you attack them
        if (faction) msg += gs.captain.grantReputation(faction, ATTACK_FACTION_NEGATIVE_REP)
        if (bounty > 0 && planet) {
            msg += gs.captain.grantBounty(planet, bounty)
        }

        showModal(fleetName, msg, [['Continue', ()=>{
            this.startCombat()
        }]])
    }

    /**
     * Get a random dialogue string from an array, evaluating functions if needed
     * @param {(string|Function)[]} dialogueArray - Array of dialogue strings or functions
     * @returns {string} A random dialogue string
     */
    getRandomDialogue(dialogueArray) {
        if (!dialogueArray || dialogueArray.length === 0) return ''
        const dialogue = rndMember(dialogueArray)
        return typeof dialogue === 'function' ? dialogue() : dialogue
    }

    /**
     * Get greeting dialogue based on player's fame/infamy
     * @returns {string} Greeting dialogue
     */
    getGreetingDialogue() {
        const factionName = this.fleet.factionType?.name?.toUpperCase().replace(/\s+/g, '_') || ''
        
        // Check for famous/infamous specific dialogue first
        if (this.planet) {
            if (FameLevel.hasFameLevel(gs.captain, this.planet, FAME_LEVELS.FAMOUS)) {
                const famousArray = window[`DIALOGUE_${factionName}_FAMOUS`]
                if (famousArray && famousArray.length > 0) {
                    return this.getRandomDialogue(famousArray)
                }
            }
            if (FameLevel.hasInfamyLevel(gs.captain, this.planet, INFAMY_LEVELS.INFAMOUS)) {
                const infamousArray = window[`DIALOGUE_${factionName}_INFAMOUS`]
                if (infamousArray && infamousArray.length > 0) {
                    return this.getRandomDialogue(infamousArray)
                }
            }
        }
        
        // Fall back to regular greeting
        const greetingArray = window[`DIALOGUE_${factionName}_GREETING`]
        return this.getRandomDialogue(greetingArray)
    }

    /**
     * Get demand surrender dialogue
     * @returns {string} Surrender demand dialogue
     */
    getDemandSurrenderDialogue() {
        const factionName = this.fleet.factionType?.name?.toUpperCase().replace(/\s+/g, '_') || ''
        const demandArray = window[`DIALOGUE_${factionName}_DEMAND_SURRENDER`]
        return this.getRandomDialogue(demandArray)
    }

    /**
     * Get offer trade dialogue
     * @returns {string} Trade offer dialogue
     */
    getOfferTradeDialogue() {
        const factionName = this.fleet.factionType?.name?.toUpperCase().replace(/\s+/g, '_') || ''
        const offerArray = window[`DIALOGUE_${factionName}_OFFER_TRADE`]
        return this.getRandomDialogue(offerArray)
    }

    /**
     * Get buy transaction dialogue (player selling to NPC)
     * @returns {string} Buy dialogue
     */
    getBuyDialogue() {
        const factionName = this.fleet.factionType?.name?.toUpperCase().replace(/\s+/g, '_') || ''
        const buyArray = window[`DIALOGUE_${factionName}_BUY`]
        return this.getRandomDialogue(buyArray)
    }

    /**
     * Get sell transaction dialogue (NPC selling to player)
     * @returns {string} Sell dialogue
     */
    getSellDialogue() {
        const factionName = this.fleet.factionType?.name?.toUpperCase().replace(/\s+/g, '_') || ''
        const sellArray = window[`DIALOGUE_${factionName}_SELL`]
        return this.getRandomDialogue(sellArray)
    }

    /**
     * Get surrendering dialogue (when enemy surrenders)
     * @returns {string} Surrendering dialogue
     */
    getSurrenderingDialogue() {
        const factionName = this.fleet.factionType?.name?.toUpperCase().replace(/\s+/g, '_') || ''
        const surrenderArray = window[`DIALOGUE_${factionName}_SURRENDERING`]
        return this.getRandomDialogue(surrenderArray)
    }

    /**
     * Get victorious dialogue (when enemy wins)
     * @returns {string} Victorious dialogue
     */
    getVictoriousDialogue() {
        const factionName = this.fleet.factionType?.name?.toUpperCase().replace(/\s+/g, '_') || ''
        const victoriousArray = window[`DIALOGUE_${factionName}_VICTORIOUS`]
        return this.getRandomDialogue(victoriousArray)
    }

    /**
     * Get dialogue when player surrenders
     * @returns {string} Player surrendered dialogue
     */
    getPlayerDidSurrenderDialogue() {
        const factionName = this.fleet.factionType?.name?.toUpperCase().replace(/\s+/g, '_') || ''
        const surrenderedArray = window[`DIALOGUE_${factionName}_PLAYER_DID_SURRENDER`]
        return this.getRandomDialogue(surrenderedArray)
    }

    /**
     * Get dialogue when player can't pay/is broke
     * @returns {string} Player broke dialogue
     */
    getPlayerBrokeDialogue() {
        const factionName = this.fleet.factionType?.name?.toUpperCase().replace(/\s+/g, '_') || ''
        const brokeArray = window[`DIALOGUE_${factionName}_PLAYER_BROKE`]
        return this.getRandomDialogue(brokeArray)
    }
}