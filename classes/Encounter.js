

class Encounter {
    constructor(gs = new GameState(), encounterType = ENCOUNTER_TYPES_ALL[0], planet = new Planet(), fleet = new Fleet(), effects = []) {
        console.log('Encounter.constructor', { gs, encounterType, planet, fleet });
        this.encounterType = encounterType;
        this.planet = planet;
        this.fleet = fleet;
        this.combatEnabled = false;
        this.mapRadius = encounterType.mapRadius;
        this.playerFleet = gs.fleet
        this.playerShips = this.playerFleet.ships
        this.playerFlagship = this.playerFleet.flagship
        this.enemyFleet = this.fleet
        this.enemyShips = this.enemyFleet.ships
        this.enemyFlagship = this.enemyFleet.flagship
        this.ships = [...this.playerShips, ...this.enemyShips]
        this.ai = new EncounterAI(this)
        this.result = null //playerVictory, playerDefeat, playerSurrendered,
        this.activeTurnFleet = this.playerFleet
        this.luck = [Math.random(),Math.random(),Math.random(),Math.random(),Math.random()] //used for initial encounter decisions
        this.fleetName = this.planet ? `${this.planet.ianName} ${this.encounterType.name}` : this.encounterType.name
        this.effects = effects

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
        this.encounterType.onEndTurn?.(this)
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
}
