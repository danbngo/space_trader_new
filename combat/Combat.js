/**
 * Combat - manages combat state, turn management, and action processing
 */
class Combat {
    /**
     * @param {Fleet} playerFleet - The player's fleet
     * @param {Fleet} enemyFleet - The enemy fleet
     */
    constructor(playerFleet, enemyFleet) {
        console.log('Combat.constructor', { playerFleet, enemyFleet })
        
        /** @type {Fleet} */
        this.playerFleet = playerFleet
        /** @type {Ship[]} */
        this.playerShips = playerFleet.ships
        
        /** @type {Fleet} */
        this.enemyFleet = enemyFleet
        /** @type {Ship[]} */
        this.enemyShips = enemyFleet.ships
        
        /** @type {Fleet} */
        this.activeTurnFleet = this.playerFleet
        
        /** @type {ENCOUNTER_RESULTS|null} */
        this.result = null
        
        /** @type {CombatLog} */
        this.log = new CombatLog()
        
        /** @type {CombatAI} */
        this.combatAI = new CombatAI(this)
        
        /** @type {Map<Ship, number>} */
        this.playerShipHullsAtStart = new Map()
        for (const ship of this.playerShips) {
            this.playerShipHullsAtStart.set(ship, ship.hull[0])
        }
        
        /** @type {Set<Ship>} - Track ships for mission notifications */
        this._missionTrackedShips = new Set()
    }

    // Getters for ship states
    get ships() {
        return [...this.playerShips, ...this.enemyShips]
    }

    get disabledPlayerShips() {
        return this.playerShips.filter(s => s.disabled)
    }

    get escapedPlayerShips() {
        return this.playerShips.filter(s => s.escaped)
    }

    get disabledEnemyShips() {
        return this.enemyShips.filter(s => s.disabled)
    }

    get activePlayerShips() {
        return this.playerShips.filter(s => !s.disabled && !s.escaped)
    }

    get activeEnemyShips() {
        return this.enemyShips.filter(s => !s.disabled && !s.escaped)
    }

    get activeShips() {
        return this.ships.filter(s => !s.disabled && !s.escaped)
    }

    /**
     * Calculate total hull damage taken by player ships
     * @returns {number}
     */
    calcPlayerHullDamages() {
        let totalDamage = 0
        for (const ship of this.playerShips) {
            const hullAtStart = this.playerShipHullsAtStart.get(ship) || ship.hull[1]
            const damage = hullAtStart - ship.hull[0]
            if (damage > 0) totalDamage += damage
        }
        return totalDamage
    }

    /**
     * Calculate total repairable hull damage
     * @returns {number}
     */
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

    /**
     * Get list of damaged player ships
     * @returns {Ship[]}
     */
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

    /**
     * Get the opposing fleet
     * @param {Fleet} fleet
     * @returns {Fleet}
     */
    calcOpposingFleet(fleet) {
        console.log('Combat.calcOpposingFleet', { fleet })
        if (fleet === this.playerFleet || fleet === gs.fleet) {
            return this.enemyFleet
        } else {
            return this.playerFleet
        }
    }

    /**
     * Check if current turn is complete
     * @returns {boolean}
     */
    isTurnComplete() {
        const activeFleetShips = this.activeTurnFleet.ships.filter(s => !s.disabled && !s.escaped)
        for (const ship of activeFleetShips) {
            if (ship.actionsRemaining > 0) {
                return false
            }
        }
        return true
    }

    /**
     * Handle turn completion and switch turns
     */
    handleTurnComplete() {
        console.log('Combat.handleTurnComplete', { activeTurnFleet: this.activeTurnFleet })
        if (!this.isTurnComplete()) return
        
        if (this.activeTurnFleet === this.playerFleet) {
            this.activeTurnFleet = this.enemyFleet
        } else if (this.activeTurnFleet === this.enemyFleet) {
            this.activeTurnFleet = this.playerFleet
        }
        
        this.updateCombatResult()
    }

    /**
     * Update combat result based on current state
     */
    updateCombatResult() {
        console.log('Combat.updateCombatResult:', this.activeEnemyShips, this.activePlayerShips)
        const { activeEnemyShips, activePlayerShips, escapedPlayerShips, playerShips } = this
        
        // Track disabled enemy ships for missions
        for (const ship of this.ships) {
            if (ship.disabled && !this._missionTrackedShips.has(ship) && !this.playerShips.includes(ship)) {
                this._missionTrackedShips.add(ship)
                for (const mission of gs.missions) {
                    mission.onPlayerDestroyShip(ship, this.enemyFleet)
                }
            }
        }
        
        // Victory: No active enemy ships remain
        if (activeEnemyShips.length === 0) {
            this.result = ENCOUNTER_RESULTS.Victory
            return
        }
        
        // Escaped: All player ships have escaped
        if (activePlayerShips.length === 0 && escapedPlayerShips.length === playerShips.length) {
            this.result = ENCOUNTER_RESULTS.Escaped
            return
        }
        
        // Defeat: No player ships escaped (all disabled)
        if (activePlayerShips.length === 0 && escapedPlayerShips.length === 0) {
            this.result = ENCOUNTER_RESULTS.Defeat
            return
        }

        // Partial escape not yet implemented
        if (activePlayerShips.length === 0) {
            throw new Error('partial escapes not implemented yet')
        }
        
        console.log('Combat result:', this.result)
    }

    /**
     * Adds a message to the combat log
     * @param {string} message
     */
    addToCombatLog(message) {
        this.log.add(message)
    }

    /**
     * Executes an action and returns the result
     * @param {Ship} ship - The ship performing the action
     * @param {string} action - 'laser', 'ram', 'evade', 'recharge', 'flee'
     * @param {Ship} [target] - The target ship (if applicable)
     * @returns {CombatResult}
     */
    executeAction(ship, action, target = null) {
        let result

        switch (action) {
            case 'laser':
                result = executeLaserAttack(ship, target)
                this.addToCombatLog(result.message)
                return new CombatResult({
                    attacker: ship,
                    defender: target,
                    action: 'laser',
                    success: result.hit,
                    message: result.message,
                    damage: result.damage || 0,
                    shieldsAbsorbed: result.shieldsAbsorbed || 0,
                    hullDamage: result.hullDamage || 0,
                    destroyed: target && target.hull[0] <= 0
                })

            case 'ram':
                result = executeRam(ship, target)
                this.addToCombatLog(result.message)
                return new CombatResult({
                    attacker: ship,
                    defender: target,
                    action: 'ram',
                    success: true,
                    message: result.message,
                    damage: result.damage || 0,
                    destroyed: target && target.hull[0] <= 0
                })

            case 'evade':
                result = executeEvade(ship)
                this.addToCombatLog(result.message)
                return new CombatResult({
                    attacker: ship,
                    action: 'evade',
                    success: result.evading,
                    message: result.message
                })

            case 'recharge':
                const shieldResult = rechargeShields(ship)
                const laserResult = rechargeLasers(ship)
                let message = ''
                if (shieldResult.amount > 0) {
                    message += shieldResult.message
                    this.addToCombatLog(shieldResult.message)
                }
                if (laserResult.amount > 0) {
                    if (message) message += ' '
                    message += laserResult.message
                    this.addToCombatLog(laserResult.message)
                }
                if (!message) {
                    message = `${ship.name} is already fully charged.`
                    this.addToCombatLog(message)
                }
                return new CombatResult({
                    attacker: ship,
                    action: 'recharge',
                    success: shieldResult.amount > 0 || laserResult.amount > 0,
                    message: message,
                    shieldsRecharged: shieldResult.amount || 0,
                    lasersRecharged: laserResult.amount || 0
                })

            case 'flee':
                // Simplified - assume no enemy ramming for now
                result = executeFlee(ship, false)
                this.addToCombatLog(result.message)
                return new CombatResult({
                    attacker: ship,
                    action: 'flee',
                    success: result.escaped,
                    message: result.message,
                    escaped: result.escaped
                })

            default:
                return new CombatResult({
                    attacker: ship,
                    action: 'none',
                    success: false,
                    message: 'Invalid action'
                })
        }
    }

    /**
     * Executes a full enemy turn using the AI
     * @returns {CombatResult[]}
     */
    executeEnemyTurn() {
        const results = this.combatAI.executeEnemyTurn()
        
        // Update combat result after enemy actions
        this.updateCombatResult()
        
        // If combat didn't end, complete the turn
        if (!this.result) {
            this.handleTurnComplete()
            this.addToCombatLog('--- Your Turn ---')
        }
        
        return results
    }

    /**
     * Start combat
     * @param {boolean} playerHasInitiative - Whether the player acts first
     */
    start(playerHasInitiative = true) {
        console.log('Combat.start', { playerHasInitiative })
        gs.combat = this
        
        // Set initial turn
        this.activeTurnFleet = playerHasInitiative ? this.playerFleet : this.enemyFleet
        
        this.log.add('--- Combat Started ---')
        if (playerHasInitiative) {
            this.log.add('--- Your Turn ---')
        } else {
            this.log.add('--- Enemy Turn ---')
        }
    }

    /**
     * End combat
     */
    end() {
        console.log('Combat.end')
        
        // Restore all shields for player ships
        for (const ship of this.playerShips) {
            ship.restoreShields()
        }
        
        gs.combat = null
    }
}
