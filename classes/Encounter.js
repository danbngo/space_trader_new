

class Encounter {
    constructor(gs = new GameState(), encounterType = ENCOUNTER_TYPES_ALL[0], planet = new Planet(), fleet = new Fleet()) {
        console.log('Encounter.constructor', { gs, encounterType, planet, fleet });
        this.encounterType = encounterType;
        this.planet = planet;
        this.fleet = fleet;
        this.combatEnabled = false;
        this.mapRadius = ENCOUNTER_MAP_RADIUS_MILES;
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
        this.effects = []
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
            if (ship.numActionsRemaining > 0) {
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
            ship.numActionsRemaining = 0
            // Decrement cloak duration
            if (ship.cloakedTurnsRemaining > 0) {
                ship.cloakedTurnsRemaining--
            }
            // Decrement module cooldowns
            for (const moduleType of Object.values(SHIP_MODULES)) {
                const currentCooldown = ship.moduleCooldowns.getAmount(moduleType)
                if (currentCooldown > 0) {
                    ship.moduleCooldowns.setAmount(moduleType, currentCooldown - 1)
                }
            }
        }
        
        // Handle effect expiration and decay
        for (const effect of this.effects) {
            effect.remainingTurns--
            effect.radius *= 0.8 // Reduce radius by 20% each turn
        }
        // Remove expired effects
        this.effects = this.effects.filter(effect => effect.remainingTurns > 0)
        
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
        return this.calcOpposingFleet(attacker.fleet).ships.filter(target => {
            if (target.disabled || target.escaped || target.cloakedTurnsRemaining > 0) return false
            return true
        })
    }

    calcLaserTargets(attacker = new Ship()) {
        console.log('Encounter.calcLaserTargets', { attacker });
        const validTargets = []
        const {ships} = this
        const [t1, t2] = attacker.calcLaserAreas()
        for (const target of this.calcHarmableTargets(attacker)) {
            if (!t1.containsPoint(target.x, target.y) && !t2.containsPoint(target.x, target.y)) continue
            validTargets.push(target)
        }
        return validTargets
    }

    calcRamTargets(attacker = new Ship()) {
        console.log('Encounter.calcLaserTargets', { attacker });
        const validTargets = []
        const a1 = attacker.calcMoveArea()
        for (const target of this.calcHarmableTargets(attacker)) {
            if (a1.containsPoint(target.x, target.y)) validTargets.push(target)
        }
        return validTargets
    }

    calcGravitonBeamTargets(attacker = new Ship()) {
        console.log('Encounter.calcGravitonBeamTargets', { attacker });
        const validTargets = []
        const targetingArea = attacker.calcGravitonBeamArea()
        for (const target of this.calcHarmableTargets(attacker)) {
            if (targetingArea.containsPoint(target.x, target.y)) validTargets.push(target)
        }
        return validTargets
    }

    checkShipEscaped(ship = new Ship()) {
        console.log('Encounter.checkShipEscaped', { ship });
        const distanceFromCenter = calcDistance(0, 0, ship.x, ship.y)
        if (distanceFromCenter > this.mapRadius) {
            ship.escaped = true
            return true
        }
        return false
    }
}
