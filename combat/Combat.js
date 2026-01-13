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
        
        /** @type {CombatAI} */
        this.combatAI = new CombatAI()
        
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
     * Get the visual row of a ship based on its index in fleet.ships array
     * Pattern: 0=middle, 1=up 1, 2=down 1, 3=up 2, 4=down 2, etc.
     * @param {Ship} ship - The ship to get the row for
     * @returns {number} - Row number (0=middle, positive=up, negative=down)
     */
    getRow(ship) {
        // Find which fleet this ship belongs to
        let index = this.playerFleet.ships.indexOf(ship)
        if (index === -1) {
            index = this.enemyFleet.ships.indexOf(ship)
        }
        if (index === -1) {
            return 0 // Ship not found, return middle
        }
        
        // Convert index to visual row: 0, +1, -1, +2, -2, +3, -3, ...
        if (index === 0) return 0
        if (index % 2 === 1) {
            // Odd indices go up: 1→+1, 3→+2, 5→+3
            return Math.ceil(index / 2)
        } else {
            // Even indices go down: 2→-1, 4→-2, 6→-3
            return -(index / 2)
        }
    }

    /**
     * Get the visual row difference between two ships
     * @param {Ship} ship - First ship
     * @param {Ship} enemyShip - Second ship
     * @returns {number} - Absolute difference between their rows
     */
    getRowDifference(ship, enemyShip) {
        const row1 = this.getRow(ship)
        const row2 = this.getRow(enemyShip)
        return Math.abs(row1 - row2)
    }

    /**
     * Check if current turn is complete
     * @returns {boolean}
     */
    isTurnComplete() {
        const activeFleetShips = this.activeTurnFleet.ships.filter(s => !s.disabled && !s.escaped)
        console.log('=== isTurnComplete check ===', {
            fleet: this.activeTurnFleet.name,
            activeShips: activeFleetShips.length,
            shipsWithActions: activeFleetShips.filter(s => s.actionsRemaining > 0).map(s => ({ name: s.name, actions: s.actionsRemaining }))
        })
        for (const ship of activeFleetShips) {
            if (ship.actionsRemaining > 0) {
                console.log('Turn NOT complete - ship has actions:', ship.name, 'actions:', ship.actionsRemaining)
                return false
            }
        }
        console.log('Turn IS complete - all ships used their actions')
        return true
    }

    /**
     * Handle turn completion and switch turns
     */
    handleTurnComplete() {
        console.log('=== Combat.handleTurnComplete ===', { activeTurnFleet: this.activeTurnFleet.name })
        const isComplete = this.isTurnComplete()
        console.log('Turn complete check result:', isComplete)
        if (!isComplete) {
            console.log('Turn not complete, returning early')
            return
        }
        
        const previousFleet = this.activeTurnFleet
        if (this.activeTurnFleet === this.playerFleet) {
            this.activeTurnFleet = this.enemyFleet
            console.log('Switching from player fleet to enemy fleet')
        } else if (this.activeTurnFleet === this.enemyFleet) {
            this.activeTurnFleet = this.playerFleet
            console.log('Switching from enemy fleet to player fleet')
        }
        console.log('Fleet changed from', previousFleet.name, 'to', this.activeTurnFleet.name)
        
        // Reset actionsRemaining for all active ships in the new fleet
        const activeShips = this.activeTurnFleet.ships.filter(s => !s.disabled && !s.escaped)
        console.log('Resetting actions for', activeShips.length, 'ships in', this.activeTurnFleet.name)
        for (const ship of activeShips) {
            ship.actionsRemaining = 1
            console.log('Reset actions for', ship.name, '- actionsRemaining:', ship.actionsRemaining)
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
     * Calculates the hit chance for a laser attack based on attacker and defender stats.
     * @param {Ship} attacker - The attacking ship
     * @param {Ship} defender - The defending ship
     * @returns {number} - Hit chance from 0 to 1
     */
    calculateHitChance(attacker, defender) {
        const rowDiff = this.getRowDifference(attacker, defender)
        
        // Base hit chance varies with row difference (interpolate between min and max)
        const minChance = COMBAT_LASER_HIT_CHANCE_AT_MIN_ROW_DIFFERENCE
        const maxChance = COMBAT_LASER_HIT_CHANCE_AT_MAX_ROW_DIFFERENCE
        const maxRowDiff = COMBAT_LASER_MAX_ROW_DIFFERENCE
        
        // Linear interpolation: closer targets = higher hit chance
        const baseChance = minChance - ((minChance - maxChance) * (rowDiff / maxRowDiff))
        
        // Radar reduces miss chance
        // Formula: new_miss_chance = miss_chance * (1 - (radars / (radars + HALVED_AT_X)))
        // At X radars: miss reduced by 50%, at 2X: 66%, at 3X: 75%, etc.
        const missChance = 1 - baseChance
        const radarReduction = attacker.radars / (attacker.radars + COMBAT_LASER_MISS_CHANCE_HALVED_AT_X_RADARS)
        const newMissChance = missChance * (1 - radarReduction)
        const finalChance = 1 - newMissChance
        
        return Math.max(0.05, Math.min(0.95, finalChance)) // Clamp between 5% and 95%
    }

    /**
     * Calculates damage to a ship without applying it, accounting for shields unless penetrating.
     * @param {Ship} ship - The ship taking damage
     * @param {number} damage - Amount of damage to calculate
     * @param {boolean} penetratesShields - If true, damage bypasses shields
     * @returns {Object} - Damage breakdown {shieldDamage, hullDamage, destroyed}
     */
    calculateDamage(ship, damage, penetratesShields = false) {
        let shieldDamage = 0;
        let hullDamage = 0;
        let currentShields = ship.shields[0];
        let currentHull = ship.hull[0];
        
        if (penetratesShields) {
            // Ram damage goes straight to hull
            hullDamage = Math.min(damage, currentHull);
            currentHull = Math.max(0, currentHull - damage);
        } else {
            // Normal damage hits shields first
            if (currentShields > 0) {
                shieldDamage = Math.min(damage, currentShields);
                currentShields -= shieldDamage;
                damage -= shieldDamage;
            }
            
            // Remaining damage goes to hull
            if (damage > 0) {
                hullDamage = Math.min(damage, currentHull);
                currentHull = Math.max(0, currentHull - damage);
            }
        }
        
        const destroyed = currentHull <= 0;
        
        return {
            shieldDamage,
            hullDamage,
            totalDamage: shieldDamage + hullDamage,
            destroyed
        };
    }

    /**
     * Calculates a laser attack from attacker to defender without applying damage.
     * @param {Ship} attacker - The attacking ship
     * @param {Ship} defender - The defending ship
     * @returns {Object} - Result of the attack {hit, damage, destroyed, message}
     */
    calculateLaserAttack(attacker, defender) {
        // Check if attacker has lasers
        if (attacker.lasers <= 0) {
            return {
                hit: false,
                damage: 0,
                destroyed: false,
                message: `${attacker.name} has no lasers!`
            };
        }
        
        // Check if target is within laser range
        const rowDiff = this.getRowDifference(attacker, defender)
        if (rowDiff > COMBAT_LASER_MAX_ROW_DIFFERENCE) {
            return {
                hit: false,
                damage: 0,
                destroyed: false,
                message: `${attacker.name} cannot target ${defender.name} - too far away!`
            };
        }
        
        // Calculate hit chance
        const hitChance = this.calculateHitChance(attacker, defender);
        const hit = Math.random() < hitChance;
        
        if (!hit) {
            return {
                hit: false,
                damage: 0,
                destroyed: false,
                message: `${attacker.name} fires lasers at ${defender.name} but misses!`
            };
        }
        
        // Calculate damage based on laser power (up to 100% of laser value, min 1)
        const maxDamage = attacker.lasers * COMBAT_MAX_LASER_DAMAGE_PER_LASER_POINT
        const damage = Math.max(1, Math.ceil(Math.random() * maxDamage));
        
        // Calculate damage (without applying)
        const result = this.calculateDamage(defender, damage, false);
        
        let message = `${attacker.name} fires lasers at ${defender.name}! `;
        if (result.shieldDamage > 0) {
            message += `Shields absorb ${result.shieldDamage} damage. `;
        }
        if (result.hullDamage > 0) {
            message += `Hull takes ${result.hullDamage} damage! `;
        }
        if (result.destroyed) {
            message += `${defender.name} is destroyed!`;
        }
        
        return {
            hit: true,
            damage: result.totalDamage,
            shieldsAbsorbed: result.shieldDamage,
            hullDamage: result.hullDamage,
            destroyed: result.destroyed,
            message
        };
    }

    /**
     * Calculates a ramming attack from attacker to defender without applying damage.
     * Rams penetrate shields but also damage the attacker.
     * @param {Ship} attacker - The ramming ship
     * @param {Ship} defender - The ship being rammed
     * @returns {Object} - Result of the ram {damage, selfTotalDamage, destroyed, message}
     */
    calculateRam(attacker, defender) {
        // Check if target is directly opposite (row difference = 0)
        const rowDiff = this.getRowDifference(attacker, defender)
        if (rowDiff > COMBAT_RAM_MAX_ROW_DIFFERENCE) {
            return {
                damage: 0,
                selfTotalDamage: 0,
                hullDamage: 0,
                shieldsAbsorbed: 0,
                destroyed: false,
                selfDestroyed: false,
                selfHullDamage: 0,
                message: `${attacker.name} cannot ram ${defender.name} - not directly opposite!`
            };
        }
        
        // Calculate ram hit chance based on engine power
        // Higher engine = higher chance to connect the ram
        const engineRatio = attacker.engine / Math.max(1, defender.engine)
        const hitChance = COMBAT_RAM_HIT_CHANCE_AT_SAME_ENGINE_POWER * engineRatio
        const clampedHitChance = Math.max(0.1, Math.min(0.9, hitChance))
        
        if (Math.random() >= clampedHitChance) {
            return {
                damage: 0,
                selfTotalDamage: 0,
                hullDamage: 0,
                shieldsAbsorbed: 0,
                destroyed: false,
                selfDestroyed: false,
                selfHullDamage: 0,
                message: `${attacker.name} attempts to ram ${defender.name} but fails to connect!`
            };
        }
        
        // Calculate ram damage based on attacker's max hull (up to 25% of max hull, min 1)
        const maxDamage = attacker.hull[1] * COMBAT_MAX_RAM_DAMAGE_PER_MAX_HULL_POINT
        const damage = Math.max(1, Math.ceil(Math.random() * maxDamage))
        
        // Calculate self-damage (30% of ram damage)
        const selfTotalDamage = Math.ceil(damage * 0.3);
        
        // Calculate damage to defender (penetrates shields)
        const defenderResult = this.calculateDamage(defender, damage, true);
        
        // Calculate self-damage to attacker
        const attackerResult = this.calculateDamage(attacker, selfTotalDamage, true);
        
        let message = `${attacker.name} rams ${defender.name}! `;
        message += `${defender.name} takes ${defenderResult.hullDamage} hull damage! `;
        message += `${attacker.name} takes ${attackerResult.hullDamage} damage from the impact. `;
        
        if (defenderResult.destroyed) {
            message += `${defender.name} is destroyed! `;
        }
        if (attackerResult.destroyed) {
            message += `${attacker.name} is destroyed by the impact!`;
        }
        
        return {
            damage: defenderResult.totalDamage,
            selfTotalDamage: attackerResult.totalDamage,
            hullDamage: defenderResult.hullDamage,
            shieldsAbsorbed: defenderResult.shieldsAbsorbed,
            destroyed: defenderResult.destroyed,
            selfDestroyed: attackerResult.destroyed,
            selfHullDamage: attackerResult.hullDamage,
            message
        };
    }
    /**
     * Calculates flee attempt without modifying ship state.
     * @param {Ship} ship - The ship attempting to flee
     * @param {boolean} enemyIsRamming - Whether an enemy is ramming this turn
     * @returns {Object} - Result {escaped, message}
     */
    calculateFlee(ship, enemyIsRamming = false) {
        // Check if any enemy is in the same row (row difference = 0)
        const opposingFleet = this.calcOpposingFleet(ship.fleet || gs.fleet)
        const enemiesInSameRow = opposingFleet.ships.filter(enemyShip => {
            if (enemyShip.disabled || enemyShip.escaped) return false
            const rowDiff = this.getRowDifference(ship, enemyShip)
            return rowDiff === 0
        })
        
        // If no enemy in same row, automatically escape
        if (enemiesInSameRow.length === 0) {
            return {
                escaped: true,
                message: `${ship.name} successfully escapes from combat!`
            }
        }
        
        // Calculate flee chance based on engine power relative to closest enemy
        // Use the strongest enemy in the same row
        const strongestEnemy = enemiesInSameRow.reduce((strongest, enemy) => 
            enemy.engine > strongest.engine ? enemy : strongest
        )
        
        // Base chance with equal engines is 50%, scales with engine ratio
        const engineRatio = ship.engine / Math.max(1, strongestEnemy.engine)
        let fleeChance = COMBAT_FLEE_CHANCE_ENEMY_IN_SAME_ROW_WITH_SAME_ENGINE * engineRatio
        
        // Enemy ramming makes it harder to flee
        if (enemyIsRamming) {
            fleeChance *= 0.5 // 50% reduction if enemy rams
        }
        
        fleeChance = Math.max(0.05, Math.min(0.95, fleeChance)) // Clamp between 5% and 95%
        
        const escaped = Math.random() < fleeChance
        
        if (escaped) {
            return {
                escaped: true,
                message: `${ship.name} successfully escapes from combat!`
            }
        } else {
            return {
                escaped: false,
                message: `${ship.name} attempts to flee but ${strongestEnemy.name} blocks the escape!`
            }
        }
    }

    /**
     * Calculates shield recharge amount based on max shield capacity without applying it.
     * @param {Ship} ship - The ship recharging shields
     * @returns {Object} - Result {amount, message}
     */
    calculateRechargeShields(ship) {
        if (ship.shields[0] >= ship.shields[1]) {
            return {
                amount: 0,
                message: `${ship.name}'s shields are already at maximum capacity.`
            };
        }
        
        // Recharge amount based on max shields (up to 25% of max shields, min 1)
        const maxRecharge = ship.shields[1] * COMBAT_MAX_RECHARGE_PER_MAX_SHIELD_POINT
        const rechargeAmount = Math.max(1, Math.ceil(maxRecharge))
        const actualRecharge = Math.min(rechargeAmount, ship.shields[1] - ship.shields[0]);
        
        return {
            amount: actualRecharge,
            message: `${ship.name} recharges shields by ${actualRecharge}. (${ship.shields[0] + actualRecharge}/${ship.shields[1]})`
        };
    }

    /**
     * Calculates laser recharge (currently lasers are static, so no actual recharge).
     * Note: Lasers are now a static damage value, so this just returns a message.
     * @param {Ship} ship - The ship recharging lasers
     * @returns {Object} - Result {amount, message}
     */
    calculateRechargeLasers(ship) {
        return {
            amount: 0,
            message: `${ship.name} powers up weapons systems.`
        };
    }

    /**
     * Calculates an action result without executing it
     * @param {Ship} ship - The ship performing the action
     * @param {string} action - 'laser', 'ram', 'evade', 'recharge', 'flee'
     * @param {Ship} [target] - The target ship (if applicable)
     * @returns {CombatResult}
     */
    calculateAction(ship, action, target = null) {
        let result

        switch (action) {
            case 'laser':
                result = this.calculateLaserAttack(ship, target)
                return new CombatResult({
                    attacker: ship,
                    defender: target,
                    action: 'laser',
                    success: result.hit,
                    message: result.message,
                    damage: result.damage || 0,
                    shieldsAbsorbed: result.shieldsAbsorbed || 0,
                    hullDamage: result.hullDamage || 0,
                    destroyed: result.destroyed
                })

            case 'ram':
                result = this.calculateRam(ship, target)
                return new CombatResult({
                    attacker: ship,
                    defender: target,
                    action: 'ram',
                    success: true,
                    message: result.message,
                    damage: result.damage || 0,
                    hullDamage: result.hullDamage || 0,
                    shieldsAbsorbed: result.shieldsAbsorbed || 0,
                    selfHullDamage: result.selfHullDamage || 0,
                    destroyed: result.destroyed,
                    selfDestroyed: result.selfDestroyed
                })

            case 'recharge':
                const shieldResult = this.calculateRechargeShields(ship)
                const laserResult = this.calculateRechargeLasers(ship)
                let message = ''
                if (shieldResult.amount > 0) {
                    message += shieldResult.message
                }
                if (laserResult.amount > 0) {
                    if (message) message += ' '
                    message += laserResult.message
                }
                if (!message) {
                    message = `${ship.name} is already fully charged.`
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
                result = this.calculateFlee(ship, false)
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
     * Executes an action and applies the result immediately (legacy method)
     * @param {Ship} ship - The ship performing the action
     * @param {string} action - 'laser', 'ram', 'evade', 'recharge', 'flee'
     * @param {Ship} [target] - The target ship (if applicable)
     * @returns {CombatResult}
     */
    executeAction(ship, action, target = null) {
        const result = this.calculateAction(ship, action, target)
        this.executeResult(result)
        return result
    }

    /**
     * Executes a combat result by applying its effects to ship stats
     * @param {CombatResult} result - The combat result to execute
     */
    executeResult(result) {
        if (!result) return
        
        switch (result.action) {
            case 'laser':
                if (result.success && result.defender) {
                    // Apply shield damage
                    if (result.shieldsAbsorbed > 0) {
                        result.defender.shields[0] = Math.max(0, result.defender.shields[0] - result.shieldsAbsorbed)
                    }
                    // Apply hull damage
                    if (result.hullDamage > 0) {
                        result.defender.hull[0] = Math.max(0, result.defender.hull[0] - result.hullDamage)
                    }
                }
                break
                
            case 'ram':
                if (result.defender) {
                    // Apply damage to defender (hull only since ram penetrates shields)
                    if (result.hullDamage > 0) {
                        result.defender.hull[0] = Math.max(0, result.defender.hull[0] - result.hullDamage)
                    }
                }
                if (result.attacker && result.selfHullDamage > 0) {
                    // Apply self-damage to attacker
                    result.attacker.hull[0] = Math.max(0, result.attacker.hull[0] - result.selfHullDamage)
                }
                break
                
            case 'recharge':
                if (result.attacker && result.shieldsRecharged > 0) {
                    result.attacker.shields[0] = Math.min(
                        result.attacker.shields[1],
                        result.attacker.shields[0] + result.shieldsRecharged
                    )
                }
                break
                
            case 'flee':
                if (result.escaped && result.attacker) {
                    result.attacker.escaped = true
                }
                break
        }
    }

    /**
     * Executes a full enemy turn using the AI
     * @returns {Array<{ship: Ship, action: string, target: Ship|null, result: CombatResult}>}
     */
    executeEnemyTurn() {
        console.log('=== Combat.executeEnemyTurn called ===')
        console.log('Active turn fleet:', this.activeTurnFleet.name)
        console.log('Enemy fleet:', this.enemyFleet.name)
        console.log('Enemy ships:', this.enemyShips.map(s => ({ name: s.name, disabled: s.disabled, actions: s.actionsRemaining })))
        
        const actions = this.combatAI.executeEnemyTurn()
        console.log('CombatAI returned actions:', actions)
        
        // Update combat result after enemy actions
        this.updateCombatResult()
        
        return actions
    }

    /**
     * Start combat
     * @param {boolean} playerHasInitiative - Whether the player acts first
     */
    start(playerHasInitiative = true) {
        console.log('Combat.start', { playerHasInitiative })
        gs.combat = this
        if (gs.encounter) gs.encounter.combatEnabled = true
        
        // Set initial turn
        this.activeTurnFleet = playerHasInitiative ? this.playerFleet : this.enemyFleet
        
        // Auto-select first non-disabled player ship if player has initiative, but only if no valid ship is selected
        if (playerHasInitiative && currentMap && currentMap.selectedShip !== undefined) {
            const currentlySelected = currentMap.selectedShip
            const isValidSelection = currentlySelected && 
                                    this.activePlayerShips.includes(currentlySelected) &&
                                    !currentlySelected.disabled && 
                                    !currentlySelected.escaped
            
            if (!isValidSelection) {
                const firstActiveShip = this.activePlayerShips[0] || null
                currentMap.selectedShip = firstActiveShip
                console.log('Auto-selected first player ship:', firstActiveShip?.name)
            } else {
                console.log('Keeping currently selected ship:', currentlySelected?.name)
            }
        }
    }

    /**
     * End combat
     */
    end() {
        console.log('Combat.end')
        
        // Restore all shields for player ships and reset combat state
        for (const ship of this.playerShips) {
            ship.restoreShields()
            ship.escaped = false
            ship.actionsRemaining = 1
        }
        
        gs.combat = null
    }
}
