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
     * Applies damage to a ship, accounting for shields unless penetrating.
     * @param {Ship} ship - The ship taking damage
     * @param {number} damage - Amount of damage to apply
     * @param {boolean} penetratesShields - If true, damage bypasses shields
     * @returns {Object} - Damage breakdown {shieldDamage, hullDamage, destroyed}
     */
    applyDamage(ship, damage, penetratesShields = false) {
        let shieldDamage = 0;
        let hullDamage = 0;
        
        if (penetratesShields) {
            // Ram damage goes straight to hull
            hullDamage = Math.min(damage, ship.hull[0]);
            ship.hull[0] = Math.max(0, ship.hull[0] - damage);
        } else {
            // Normal damage hits shields first
            if (ship.shields[0] > 0) {
                shieldDamage = Math.min(damage, ship.shields[0]);
                ship.shields[0] -= shieldDamage;
                damage -= shieldDamage;
            }
            
            // Remaining damage goes to hull
            if (damage > 0) {
                hullDamage = Math.min(damage, ship.hull[0]);
                ship.hull[0] = Math.max(0, ship.hull[0] - damage);
            }
        }
        
        const destroyed = ship.hull[0] <= 0;
        
        return {
            shieldDamage,
            hullDamage,
            totalDamage: shieldDamage + hullDamage,
            destroyed
        };
    }

    /**
     * Executes a laser attack from attacker to defender.
     * @param {Ship} attacker - The attacking ship
     * @param {Ship} defender - The defending ship
     * @returns {Object} - Result of the attack {hit, damage, destroyed, message}
     */
    executeLaserAttack(attacker, defender) {
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
        
        // Apply damage
        const result = this.applyDamage(defender, damage, false);
        
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
     * Executes a ramming attack from attacker to defender.
     * Rams penetrate shields but also damage the attacker.
     * @param {Ship} attacker - The ramming ship
     * @param {Ship} defender - The ship being rammed
     * @returns {Object} - Result of the ram {damage, selfTotalDamage, destroyed, message}
     */
    executeRam(attacker, defender) {
        // Calculate ram damage based on engine power
        const baseDamage = attacker.engine; // Engine * 2 as ram damage
        const variance = baseDamage * 0.2; // ±20% variance
        const damage = Math.ceil(baseDamage + (Math.random() * variance * 2 - variance));
        
        // Calculate self-damage (30% of ram damage)
        const selfTotalDamage = Math.ceil(damage * 0.3);
        
        // Apply damage to defender (penetrates shields)
        const defenderResult = this.applyDamage(defender, damage, true);
        
        // Apply self-damage to attacker
        const attackerResult = this.applyDamage(attacker, selfTotalDamage, true);
        
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
     * Attempts to flee from combat.
     * @param {Ship} ship - The ship attempting to flee
     * @param {boolean} enemyIsRamming - Whether an enemy is ramming this turn
     * @returns {Object} - Result {escaped, message}
     */
    executeFlee(ship, enemyIsRamming = false) {
        // Base flee chance is 50%, modified by engine power
        let fleeChance = 0.5 + (ship.engine * 0.01); // +1% per engine point
        
        // Enemy ramming makes it much harder to flee
        if (enemyIsRamming) {
            fleeChance *= 0.3; // 70% reduction if enemy rams
        }
        
        fleeChance = Math.max(0.1, Math.min(0.9, fleeChance)); // Clamp between 10% and 90%
        
        const escaped = Math.random() < fleeChance;
        
        if (escaped) {
            ship.escaped = true;
            return {
                escaped: true,
                message: `${ship.name} successfully escapes from combat!`
            };
        } else {
            return {
                escaped: false,
                message: `${ship.name} attempts to flee but fails!`
            };
        }
    }

    /**
     * Recharges a ship's shields based on engine power.
     * @param {Ship} ship - The ship recharging shields
     * @returns {Object} - Result {amount, message}
     */
    rechargeShields(ship) {
        if (ship.shields[0] >= ship.shields[1]) {
            return {
                amount: 0,
                message: `${ship.name}'s shields are already at maximum capacity.`
            };
        }
        
        // Recharge amount based on engine power (20% of engine per turn)
        const rechargeAmount = Math.ceil(ship.engine * 0.2);
        const actualRecharge = Math.min(rechargeAmount, ship.shields[1] - ship.shields[0]);
        
        ship.shields[0] += actualRecharge;
        
        return {
            amount: actualRecharge,
            message: `${ship.name} recharges shields by ${actualRecharge}. (${ship.shields[0]}/${ship.shields[1]})`
        };
    }

    /**
     * Recharges a ship's lasers based on engine power.
     * Note: Lasers are now a static damage value, so this just returns a message.
     * @param {Ship} ship - The ship recharging lasers
     * @returns {Object} - Result {amount, message}
     */
    rechargeLasers(ship) {
        return {
            amount: 0,
            message: `${ship.name} powers up weapons systems.`
        };
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
                result = this.executeLaserAttack(ship, target)
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
                result = this.executeRam(ship, target)
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
                    destroyed: target && target.hull[0] <= 0
                })

            case 'recharge':
                const shieldResult = this.rechargeShields(ship)
                const laserResult = this.rechargeLasers(ship)
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
                result = this.executeFlee(ship, false)
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
        if (gs.encounter) gs.encounter.combatEnabled = true
        
        // Set initial turn
        this.activeTurnFleet = playerHasInitiative ? this.playerFleet : this.enemyFleet
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
