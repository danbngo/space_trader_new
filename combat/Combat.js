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
     * Calculates the hit chance for an attack based on attacker and defender stats.
     * @param {Ship} attacker - The attacking ship
     * @param {Ship} defender - The defending ship
     * @returns {number} - Hit chance from 0 to 1
     */
    calculateHitChance(attacker, defender) {
        let baseChance = 0.7; // 70% base hit chance
        
        // Radar helps hit chance
        if (attacker.radars > 0) {
            baseChance += Math.min(0.15, attacker.radars * 0.01); // Up to +15% from radars
        }
        
        return Math.max(0.1, Math.min(0.95, baseChance)); // Clamp between 10% and 95%
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
        
        // Calculate damage based on laser power
        const baseDamage = attacker.lasers * 0.5; // 50% of lasers as base damage
        const variance = baseDamage * 0.3; // ±30% variance
        const damage = Math.ceil(baseDamage + (Math.random() * variance * 2 - variance));
        
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
        // Calculate ram damage based on engine power
        const baseDamage = attacker.engine; // Engine * 2 as ram damage
        const variance = baseDamage * 0.2; // ±20% variance
        const damage = Math.ceil(baseDamage + (Math.random() * variance * 2 - variance));
        
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
        // Find the fleet index of this ship
        const playerFleet = gs.combat.playerFleet.ships
        const enemyFleet = gs.combat.enemyFleet.ships
        const isPlayer = playerFleet.includes(ship)
        const fleetIndex = isPlayer ? playerFleet.indexOf(ship) : enemyFleet.indexOf(ship)
        
        // Find the enemy ship "across from" this ship (same index in opposing fleet)
        const opposingFleet = isPlayer ? enemyFleet : playerFleet
        const opposingShip = opposingFleet[fleetIndex]
        
        // If no ship is across from us (or they're disabled/escaped), auto-succeed
        if (!opposingShip || opposingShip.disabled || opposingShip.escaped) {
            return {
                escaped: true,
                message: `${ship.name} successfully escapes from combat!`
            }
        }
        
        // Base flee chance is 50%, modified by engine differential
        const engineDiff = ship.engine - opposingShip.engine
        let fleeChance = 0.5 + (engineDiff * 0.02) // +2% per engine point difference
        
        // Enemy ramming makes it harder to flee
        if (enemyIsRamming) {
            fleeChance *= 0.5 // 50% reduction if enemy rams
        }
        
        fleeChance = Math.max(0.1, Math.min(0.9, fleeChance)) // Clamp between 10% and 90%
        
        const escaped = Math.random() < fleeChance
        
        if (escaped) {
            return {
                escaped: true,
                message: `${ship.name} successfully escapes from combat!`
            }
        } else {
            return {
                escaped: false,
                message: `${ship.name} attempts to flee but fails!`
            }
        }
    }

    /**
     * Calculates shield recharge amount based on engine power without applying it.
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
        
        // Recharge amount based on engine power (20% of engine per turn)
        const rechargeAmount = Math.ceil(ship.engine * 0.2);
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
        
        // Auto-select first non-disabled player ship if player has initiative
        if (playerHasInitiative && currentMap && currentMap.selectedShip !== undefined) {
            const firstActiveShip = this.activePlayerShips[0] || null
            currentMap.selectedShip = firstActiveShip
            console.log('Auto-selected first player ship:', firstActiveShip?.name)
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
