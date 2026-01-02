

/**
 * Represents a combat encounter between fleets.
 * @class Encounter
 */
class Encounter {
    /**
     * @param {EncounterType} encounterType - The type of encounter.
     * @param {Planet} planet - The planet where the encounter occurs.
     * @param {Fleet} fleet - The enemy fleet.
     * @param {Effect[]} effects - Environmental effects active in the encounter.
     */
    constructor(encounterType = ENCOUNTER_TYPES_ALL[0], planet = new Planet(), fleet = new Fleet(), effects = []) {
        console.log('Encounter.constructor', { encounterType, planet, fleet });
        /** @type {EncounterType} */
        this.encounterType = encounterType;
        /** @type {Planet} */
        this.planet = planet;
        /** @type {Fleet} */
        this.fleet = fleet;
        /** @type {boolean} */
        this.combatEnabled = false;
        /** @type {number} */
        this.mapRadius = encounterType.mapRadius;
        /** @type {Fleet} */
        this.playerFleet = gs.fleet
        /** @type {Ship[]} */
        this.playerShips = this.playerFleet.ships
        /** @type {Ship} */
        this.playerFlagship = this.playerFleet.flagship
        /** @type {Fleet} */
        this.enemyFleet = this.fleet
        /** @type {Ship[]} */
        this.enemyShips = this.enemyFleet.ships
        /** @type {Ship} */
        this.enemyFlagship = this.enemyFleet.flagship
        /** @type {Ship[]} */
        this.ships = [...this.playerShips, ...this.enemyShips]
        /** @type {EncounterAI} */
        this.ai = new EncounterAI(this)
        /** @type {ENCOUNTER_RESULTS|null} */
        this.result = null //playerVictory, playerDefeat, playerSurrendered,
        /** @type {Fleet} */
        this.activeTurnFleet = this.playerFleet
        /** @type {Effect[]} */
        this.effects = effects

        /** @type {Map<Ship, number>} */
        this.playerShipHullsAtStart = new Map()
        for (const ship of this.playerShips) {
            this.playerShipHullsAtStart.set(ship, ship.hull[0])
        }
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
        this.onEndTurn?.()
        for (const ship of this.activeTurnFleet.ships) {
            ship.actionsRemaining = 0
            // Decrement module cooldowns
            for (const moduleType of Object.values(SHIP_MODULE_TYPES)) {
                const currentCooldown = ship.moduleCooldowns.getAmount(moduleType)
                if (currentCooldown > 0) {
                    ship.moduleCooldowns.setAmount(moduleType, currentCooldown - 1)
                }
            }
        }
        
        // Handle effect expiration and decay
        for (const effect of this.effects) {
            effect.onTurnEnd()
        }
        // Remove expired effects
        this.effects = this.effects.filter(effect => (effect.remainingTurns > 0 || effect.remainingTurns === null))
        
        if (this.activeTurnFleet === this.playerFleet) {
            this.activeTurnFleet = this.enemyFleet
        }
        else if (this.activeTurnFleet === this.enemyFleet) {
            this.activeTurnFleet = this.playerFleet
        }
        for (const ship of this.activeTurnFleet.activeShips) {
            ship.resetActions()
        }
        this.updateEncounterResult()
    }

    handleShipActionComplete(ship = new Ship()) {
        const pseudoActions = ship.spendAction()
        // Apply effects that the ship is starting its turn inside
        for (const key of ship.statusEffects.keys) {
            if (ship.statusEffects.has(key)) {
                ship.statusEffects.increment(key, -1)
            }
        }
        for (const effect of this.effects) {
            if (effect.containsPoint(ship.x, ship.y)) {
                pseudoActions.push(...effect.hitShip(this, ship))
            }
        }
        return pseudoActions
    }

    addEffect(effect = new Effect()) {
        console.log('Encounter.addEffect', { effect });
        const pseudoActions = []
        this.effects.push(effect)
        // Trigger hitShip for all ships currently within the effect's area
        for (const ship of this.ships) {
            if (effect.containsPoint(ship.x, ship.y)) {
                /** @ts-ignore */
                pseudoActions.push(...effect.hitShip(this, ship))
            }
        }
        return pseudoActions
    }

    updateEncounterResult() {
        console.log('Encounter.updateEncounterResult:',this.activeEnemyShips,this.activePlayerShips,this.playerFlagship);
        const {activeEnemyShips, playerFlagship} = this
        if (activeEnemyShips.length == 0) {
            this.result = ENCOUNTER_RESULTS.Victory
            return
        }
        else if (playerFlagship.escaped) {
            this.result = ENCOUNTER_RESULTS.Escaped
            return
        }
        else if (playerFlagship.disabled) {
            this.result = ENCOUNTER_RESULTS.Defeat
        }
        console.log('Encounter result:',this.result);
    }

    calcOpposingFleet(fleet = new Fleet()) {
        console.log('EncounterAI.calcOpposingFleet', { fleet });
        if (fleet == gs.fleet) return this.fleet
        else return gs.fleet
    }

    calcHarmableTargets(attacker = new Ship()) {
        console.log('Encounter.calcHarmableTargets', { attacker });

        //asteroids can target each other
        //const ships = (attacker.aiType == AI_TYPES.Asteroid) ? this.ships : this.calcOpposingFleet(attacker.fleet).ships;
        const ships = this.calcOpposingFleet(attacker.fleet).ships;

        return ships.filter(target => {
            if (target.statusEffects.has(STATUS_EFFECTS.CLOAKED)) return false
            if (target.disabled || target.escaped) return false
            return true
        })
    }

    calcLaserTargets(attacker = new Ship()) {
        console.log('Encounter.calcLaserTargets', { attacker });
        const validTargets = []
        const [t1, t2] = attacker.calcLaserAreas()
        for (const target of this.calcHarmableTargets(attacker)) {
            if (target.statusEffects.has(STATUS_EFFECTS.DUSTY)) continue
            if (!t1.containsPoint(target.x, target.y) && !t2.containsPoint(target.x, target.y)) continue
            validTargets.push(target)
        }
        return validTargets
    }

    calcRamTargets(attacker = new Ship()) {
        console.log('Encounter.calcRamTargets', { attacker });
        const validTargets = []
        const a1 = attacker.calcMoveArea()
        for (const target of this.calcHarmableTargets(attacker)) {
            if (a1.containsPoint(target.x, target.y)) validTargets.push(target)
        }
        return validTargets
    }

    calcBeamTargets(attacker = new Ship()) {
        console.log('Encounter.calcBeamTargets', { attacker });
        const validTargets = []
        const targetingArea = attacker.calcBeamArea()
        for (const target of this.calcHarmableTargets(attacker)) {
            if (targetingArea.containsPoint(target.x, target.y)) validTargets.push(target)
        }
        return validTargets
    }

    calcPulseTargets(attacker = new Ship()) {
        console.log('Encounter.calcPulseTargets', { attacker });
        const validTargets = []
        const targetingArea = attacker.calcPulseArea()
        for (const target of this.calcHarmableTargets(attacker)) {
            if (targetingArea.containsPoint(target.x, target.y)) validTargets.push(target)
        }
        return validTargets
    }

    checkShipMovementEffects(ship = new Ship()) {
        const pseudoActions = []
        console.log('Encounter.checkShipMovementEffects', { ship, effects:this.effects });
        // Check if ship entered any effects
        for (const effect of this.effects) {
            if (effect.containsPoint(ship.x, ship.y)) {
                pseudoActions.push(...effect.hitShip(this, ship))
            }
        }
        
        // Check if ship escaped map
        const distanceFromCenter = calcDistance(0, 0, ship.x, ship.y)

        //fooroids only escape if they reached the left side of the screen
        if (distanceFromCenter > this.mapRadius) {
            if (ship.aiType != AI_TYPES.Asteroid || ship.x < 0) {
                pseudoActions.push(ShipAction.getDamageAction(this, ship, 0, 0, false, true))
                ship.escaped = true
            }
        }
        return pseudoActions
    }

    /**
     * Called when the encounter starts. Override in subclasses.
     */
    onStart() {
        // Override in subclass
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
     * Called at the end of each turn. Override in subclasses if needed.
     */
    onEndTurn() {
        // Override in subclass if needed
    }

    /**
     * Initializes and positions ships for the encounter based on formation type.
     */
    positionShips() {
        console.log('Encounter.positionShips')
        const {playerShips, enemyShips, ships, encounterType} = this
        const {formationType} = encounterType
        const maxSpawnDistance = this.mapRadius * ENCOUNTER_SHIP_MAX_SPAWN_DISTANCE_RATIO
        const minSpawnDistance = maxSpawnDistance / 5

        for (const ship of ships) {
            ship.resetCombatVars()
        }

        // Position player ships based on formation
        if (formationType == FORMATION_TYPES.PlayerEncircle) {
            const angleStep = (Math.PI * 2) / playerShips.length
            playerShips.forEach((ship, i) => {
                const angle = angleStep * i
                const [x, y] = rotatePoint(maxSpawnDistance, 0, 0, 0, angle)
                Object.assign(ship, {x, y})
            })
        }
        else if (formationType == FORMATION_TYPES.PlayerEncircled) {
            for (const ship of playerShips) {
                const [x, y] = rotatePoint(rng(minSpawnDistance/2, 0, false), 0, 0, 0, rng(Math.PI * 2, 0, false))
                Object.assign(ship, {x, y})
            }
        }
        else {
            for (const ship of playerShips) {
                const [x,y] = rotatePoint(rng(maxSpawnDistance, minSpawnDistance/2, false), 0, 0, 0, rng(Math.PI + Math.PI/4, Math.PI - Math.PI/4, false))
                Object.assign(ship, {x, y})
            }
        }

        // Position enemy ships
        for (const ship of enemyShips) {
            Object.assign(ship, {color: this.encounterType.enemyColor})
        }

        if (formationType == FORMATION_TYPES.PlayerEncircle) {
            for (const ship of enemyShips) {
                const [x, y] = rotatePoint(rng(minSpawnDistance/2, 0, false), 0, 0, 0, rng(Math.PI * 2, 0, false))
                Object.assign(ship, {x, y})
            }
        }
        else if (formationType == FORMATION_TYPES.PlayerEncircled) {
            const angleStep = (Math.PI * 2) / enemyShips.length
            enemyShips.forEach((ship, i) => {
                const angle = angleStep * i
                const [x, y] = rotatePoint(maxSpawnDistance, 0, 0, 0, angle)
                Object.assign(ship, {x, y})
            })
        }
        else if (formationType == FORMATION_TYPES.FaceOff) {
            for (const ship of enemyShips) {
                const [x,y] = rotatePoint(rng(maxSpawnDistance, minSpawnDistance, false), 0, 0, 0, rng(0 + Math.PI/4, 0 - Math.PI/4, false))
                Object.assign(ship, {x, y})
            }
        }
        else if (formationType == FORMATION_TYPES.Storm) {
            for (const ship of enemyShips) {
                let [x,y] = rotatePoint(rng(this.mapRadius*0.9, minSpawnDistance, false), 0, 0, 0, rng(0 + Math.PI*3/4, 0 - Math.PI*3/4, false))
                x += rng(this.mapRadius*2, 0, false)
                Object.assign(ship, {x, y})
            }
        }

        // Set ship angles to face targets
        for (const ship of playerShips) {
            const randomTarget = rndMember(enemyShips)
            if (randomTarget) {
                const angle = new Path(ship.x, ship.y, randomTarget.x, randomTarget.y).angle
                Object.assign(ship, {angle})
            }
        }
        for (const ship of enemyShips) {
            if (formationType == FORMATION_TYPES.Storm) {
                const angle = rng(Math.PI + Math.PI/4, Math.PI - Math.PI/4, false)
                Object.assign(ship, {angle})
            }
            else {
                const randomTarget = rndMember(playerShips)
                if (randomTarget) {
                    const angle = new Path(ship.x, ship.y, randomTarget.x, randomTarget.y).angle
                    Object.assign(ship, {angle})
                }
            }
        }
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
        if (currentMap && currentMap.togglePause) currentMap.togglePause(false)
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
        // Set encounter immunity for after this encounter ends
        gs.encounterImmunityUntilYear = gs.year + (ENCOUNTER_IMMUNITY_DAYS / 365)
        this.positionShips()

        showModal(coloredName(this.fleet), this.encounterType.description, [['Ok', ()=>{
            showEncounterMap()
            if (this.encounterType.aiType == AI_TYPES.Asteroid) this.onStart()
        }]])
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
        if (gs.fleet.stranded) {
            this.handlePlayerStranded()
            return
        }
    }

    handlePlayerStranded() {
        console.log('handlePlayerStranded');
        const [nearestPlanet, nearestDistance] = gs.system.calcNearestPlanet(gs.fleet)
        const creditCost = 100 + rng(500*Math.sqrt(nearestDistance), 250*Math.sqrt(nearestDistance), true)
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

    showPlayerRefuseSurrenderModal() {
        console.log('showPlayerRefuseSurrenderModal');
        const fleetName = coloredName(this.fleet)
        const planet = this.planet
        const faction = this.fleet.factionType
        const reputationMultiplier = faction.reputationMultiplier
        const reputation = ENCOUNTER_BASE_REPUTATION_EFFECT_ON_NO_SURRENDER * reputationMultiplier
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
        const reputationShrink = ENCOUNTER_BASE_REPUTATION_SHRINK_ON_SURRENDER / Math.abs(reputationMultiplier || 1)

        let msg = `There's no other choice. You power your ships down and broadcast the universal signal for surrender.<br/>`
        if (reputationShrink) {
            if (planet) msg += gs.captain.grantReputation(planet, gs.captain.reputation.getAmount(planet) > 0 ? -reputationShrink : reputationShrink)
            if (faction) msg += gs.captain.grantReputation(faction, gs.captain.reputation.getAmount(faction) > 0 ? -reputationShrink : reputationShrink)
        }

        showModal(fleetName, msg, [['Continue', ()=>this.onSurrender()]])
    }


    showPlayerAttackFleetModal(sneakAttack = false, onContinue = ()=>this.startCombat(true)) {
        console.log('showPlayerAttackFleetModal', { sneakAttack });
        const fleetName = coloredName(this.fleet)
        const planet = this.planet
        const faction = this.fleet.factionType
        const reputationMultiplier = faction.reputationMultiplier
        const reputation = ENCOUNTER_BASE_REPUTATION_EFFECT_ON_ATTACK * reputationMultiplier
        const bounty = reputationMultiplier > 0 ? ENCOUNTER_BASE_FINE_ON_ATTACK * reputationMultiplier : 0

        if (sneakAttack) {
            // Change formation to player encircling enemy
            this.encounterType.formationType = FORMATION_TYPES.PlayerEncircle
            // Reposition ships for the new formation
            this.positionShips()
            // Drop shields after repositioning
            for (const ship of this.ships) ship.shields[0] = 0
        }

        let msg = `You ${sneakAttack ? 'sneakily ' : ''}attack the ${fleetName}!<br/>`
        if (sneakAttack) msg += `The ${fleetName} are caught with their shields down!<br/>`
        if (reputation) {
            if (planet) msg += gs.captain.grantReputation(planet, reputation)
            if (faction) msg += gs.captain.grantReputation(faction, reputation)
        }
        if (bounty > 0 && planet) {
            msg += gs.captain.grantBounty(planet, bounty)
        }

        showModal(fleetName, msg, [['Continue', ()=>{
            onContinue()
        }]])
    }


}