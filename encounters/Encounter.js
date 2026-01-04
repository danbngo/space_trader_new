

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
     * @param {Fleet|null} undetectedFleet
     */
    constructor(encounterType = ENCOUNTER_TYPES_ALL[0], planet = new Planet(), fleet = new Fleet(), effects = [], undetectedFleet) {
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
        //this.ships = [...this.playerShips, ...this.enemyShips]
        /** @type {EncounterAI} */
        this.ai = new EncounterAI(this)
        /** @type {ENCOUNTER_RESULTS|null} */
        this.result = null //playerVictory, playerDefeat, playerSurrendered,
        /** @type {Fleet} */
        this.activeTurnFleet = this.playerFleet
        /** @type {Effect[]} */
        this.effects = effects
        /** @type {Fleet|null} */
        this.undetectedFleet = undetectedFleet
        this.playerUndetected = undetectedFleet == this.playerFleet
        this.enemyUndetected = undetectedFleet == this.fleet
        this.formationType =
            this.encounterType.aiType == AI_TYPES.Asteroid ? FORMATION_TYPES.Storm
            : this.playerUndetected ? FORMATION_TYPES.PlayerEncircle
            : this.enemyUndetected ? FORMATION_TYPES.PlayerEncircled
            : FORMATION_TYPES.Default

        /** @type {Map<Ship, number>} */
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
        this.onEndTurn?.()
        for (const ship of this.activeTurnFleet.ships) {
            ship.actionsRemaining = 0
            // Decrement module cooldowns
            for (const moduleType of Object.values(SHIP_MODULE_TYPES)) {
                const currentCooldown = ship.moduleCooldowns.getAmount(moduleType)
                if (currentCooldown <= 0) continue
                let cooldownToRecover = 1
                while (Math.random()*(1+ship.fleet.totalSkills.getAmount(SKILLS.Engineer)/50) > 0.5 && cooldownToRecover < currentCooldown) {
                    cooldownToRecover += 1
                }
                ship.moduleCooldowns.setAmount(moduleType, currentCooldown - cooldownToRecover)
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
            this.combatEnabled = false
            return
        }
        else if (playerFlagship.escaped) {
            this.result = ENCOUNTER_RESULTS.Escaped
            this.combatEnabled = false
            return
        }
        else if (playerFlagship.disabled) {
            this.result = ENCOUNTER_RESULTS.Defeat
            this.combatEnabled = false
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
            pseudoActions.push(ShipAction.getDamageAction(this, ship, 0, 0, false, true))
            ship.escaped = true
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
        const {playerShips, enemyShips, ships, playerFleet, enemyFleet, formationType} = this
        const maxSpawnDistance = this.mapRadius * ENCOUNTER_SHIP_MAX_SPAWN_DISTANCE_RATIO
        const minSpawnDistance = this.mapRadius * ENCOUNTER_SHIP_MIN_SPAWN_DISTANCE_RATIO

        for (const ship of ships) {
            ship.resetCombatVars()
        }

        const anglePlayerFleetToEnemy = calcAngleTowardsPoint(playerFleet.x, playerFleet.y, enemyFleet.x, enemyFleet.y)
        const angleEnemyFleetToPlayer = calcAngleTowardsPoint(enemyFleet.x, enemyFleet.y, playerFleet.x, playerFleet.y)
        const enemyFacingAngle = enemyFleet.angle
        const playerFacingAngle = playerFleet.angle
        const distMargin = maxSpawnDistance-minSpawnDistance
        const avgDist = distMargin/2 + minSpawnDistance

        //players ships should be in a half circle around the enemy
        if (formationType == FORMATION_TYPES.Storm) {
            for (const ship of enemyShips) {
                const dist = rng(0, this.mapRadius)
                const angle = rng(Math.PI * 2, 0, false)
                let [x, y] = rotatePoint(dist, 0, 0, 0, angle)
                Object.assign(ship, {x, y, angle: rng(Math.PI * 2, 0, false)})
            }
        }
        else if (formationType == FORMATION_TYPES.PlayerEncircled) {
            //enemy ships should be in a half circle around the players fleet
            const angleStep = (Math.PI * 2)/enemyShips.length
            enemyShips.forEach((ship, i) => {
                const angle = angleStep * i + (enemyFleet.angle || 0)
                const dist = rng(maxSpawnDistance,minSpawnDistance)
                const [x, y] = rotatePoint(dist, 0, 0, 0, angle)
                Object.assign(ship, {x, y})
            })
        }
        else {
            const [cx, cy] = rotatePoint(avgDist, 0, 0, 0, angleEnemyFleetToPlayer+Math.PI)
            enemyFleet.ships.forEach((ship,i)=>{
                const distFromCenter = rng(distMargin, distMargin/8)
                const [dx,dy] = rotatePoint(distFromCenter, 0, 0, 0, rng(Math.PI*2, 0, false))
                const angleDiff = rng(Math.PI/8)
                Object.assign(ship, {x: cx+dx, y: cy+dy, angle: enemyFacingAngle + angleDiff})
            })
        }
        if (formationType == FORMATION_TYPES.PlayerEncircle) {
            const angleStep = (Math.PI * 2) / playerShips.length
            playerShips.forEach((ship, i) => {
                const angle = angleStep * i + (playerFleet.angle || 0)
                const dist = rng(maxSpawnDistance,minSpawnDistance)
                const [x, y] = rotatePoint(dist, 0, 0, 0, angle)
                Object.assign(ship, {x, y})
            })
        }
        else {
            const [cx,cy] = rotatePoint(avgDist, 0, 0, 0, anglePlayerFleetToEnemy+Math.PI)
            playerFleet.ships.forEach((ship,i)=>{
                const distFromCenter = rng(distMargin, distMargin/8)
                const [dx,dy] = rotatePoint(distFromCenter, 0, 0, 0, rng(Math.PI*2, 0, false))
                const angleDiff = rng(Math.PI/8)
                Object.assign(ship, {x: cx+dx, y: cy+dy, angle: playerFacingAngle + angleDiff})
            })
        }

        for (const ship of enemyShips) {
            Object.assign(ship, {color: this.encounterType.enemyColor})
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
        
        // Add player fleet to enemy AI's visited list so they don't actively target player again
        if (this.fleet.fleetAI && this.fleet.fleetAI.visited && !this.fleet.fleetAI.visited.includes(gs.fleet)) {
            this.fleet.fleetAI.visited.push(gs.fleet)
        }
        
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
        if (reputationShrink) {
            if (planet) msg += gs.captain.grantReputation(planet, gs.captain.reputation.getAmount(planet) > 0 ? -reputationShrink : reputationShrink)
            if (faction) msg += gs.captain.grantReputation(faction, gs.captain.reputation.getAmount(faction) > 0 ? -reputationShrink : reputationShrink)
        }

        showModal(fleetName, msg, [['Continue', ()=>this.onSurrender()]])
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
            if (faction) msg += gs.captain.grantReputation(faction, reputation)
        }
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