/**
 * Combat mechanics utility functions for turn-based ship combat.
 * These functions handle all combat actions including attacking, defending, and special moves.
 */

/**
 * Calculates the hit chance for an attack based on attacker and defender stats.
 * @param {Ship} attacker - The attacking ship
 * @param {Ship} defender - The defending ship
 * @returns {number} - Hit chance from 0 to 1
 */
function calculateHitChance(attacker, defender) {
    let baseChance = 0.7; // 70% base hit chance
    
    // Evasion reduces hit chance
    if (defender.evading) {
        baseChance -= 0.3; // Evading reduces hit chance by 30%
    }
    
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
function applyDamage(ship, damage, penetratesShields = false) {
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
function executeLaserAttack(attacker, defender) {
    // Check if attacker has laser charge
    if (attacker.lasers[0] <= 0) {
        return {
            hit: false,
            damage: 0,
            destroyed: false,
            message: `${attacker.name} has no laser charge!`
        };
    }
    
    // Calculate hit chance
    const hitChance = calculateHitChance(attacker, defender);
    const hit = Math.random() < hitChance;
    
    if (!hit) {
        return {
            hit: false,
            damage: 0,
            destroyed: false,
            message: `${attacker.name} fires lasers at ${defender.name} but misses!`
        };
    }
    
    // Deplete laser charge
    attacker.lasers[0] = Math.max(0, attacker.lasers[0] - 1);
    
    // Calculate damage based on laser power
    const baseDamage = attacker.lasers[1] * 0.5; // 50% of max lasers as base damage
    const variance = baseDamage * 0.3; // ±30% variance
    const damage = Math.ceil(baseDamage + (Math.random() * variance * 2 - variance));
    
    // Apply damage
    const result = applyDamage(defender, damage, false);
    
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
        destroyed: result.destroyed,
        message
    };
}

/**
 * Executes a ramming attack from attacker to defender.
 * Rams penetrate shields but also damage the attacker.
 * @param {Ship} attacker - The ramming ship
 * @param {Ship} defender - The ship being rammed
 * @returns {Object} - Result of the ram {damage, selfDamage, destroyed, message}
 */
function executeRam(attacker, defender) {
    // Calculate ram damage based on engine power
    const baseDamage = attacker.engine * 2; // Engine * 2 as ram damage
    const variance = baseDamage * 0.2; // ±20% variance
    const damage = Math.ceil(baseDamage + (Math.random() * variance * 2 - variance));
    
    // Calculate self-damage (30% of ram damage)
    const selfDamage = Math.ceil(damage * 0.3);
    
    // Apply damage to defender (penetrates shields)
    const defenderResult = applyDamage(defender, damage, true);
    
    // Apply self-damage to attacker
    const attackerResult = applyDamage(attacker, selfDamage, true);
    
    let message = `${attacker.name} rams ${defender.name}! `;
    message += `${defender.name} takes ${defenderResult.hullDamage} hull damage! `;
    message += `${attacker.name} takes ${attackerResult.hullDamage} self-damage from the impact. `;
    
    if (defenderResult.destroyed) {
        message += `${defender.name} is destroyed! `;
    }
    if (attackerResult.destroyed) {
        message += `${attacker.name} is destroyed by the impact!`;
    }
    
    return {
        damage: defenderResult.totalDamage,
        selfDamage: attackerResult.totalDamage,
        destroyed: defenderResult.destroyed,
        selfDestroyed: attackerResult.destroyed,
        message
    };
}

/**
 * Sets a ship to evade mode, reducing incoming hit chances.
 * @param {Ship} ship - The ship evading
 * @returns {Object} - Result {message}
 */
function executeEvade(ship) {
    ship.evading = true;
    
    return {
        message: `${ship.name} prepares to evade incoming attacks!`
    };
}

/**
 * Attempts to flee from combat.
 * @param {Ship} ship - The ship attempting to flee
 * @param {boolean} enemyIsRamming - Whether an enemy is ramming this turn
 * @returns {Object} - Result {escaped, message}
 */
function executeFlee(ship, enemyIsRamming = false) {
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
function rechargeShields(ship) {
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
 * @param {Ship} ship - The ship recharging lasers
 * @returns {Object} - Result {amount, message}
 */
function rechargeLasers(ship) {
    if (ship.lasers[0] >= ship.lasers[1]) {
        return {
            amount: 0,
            message: `${ship.name}'s lasers are already at maximum charge.`
        };
    }
    
    // Recharge amount based on engine power (30% of engine per turn)
    const rechargeAmount = Math.ceil(ship.engine * 0.3);
    const actualRecharge = Math.min(rechargeAmount, ship.lasers[1] - ship.lasers[0]);
    
    ship.lasers[0] += actualRecharge;
    
    return {
        amount: actualRecharge,
        message: `${ship.name} recharges lasers by ${actualRecharge}. (${ship.lasers[0]}/${ship.lasers[1]})`
    };
}

/**
 * Resets end-of-turn status flags like evading.
 * @param {Ship} ship - The ship to reset
 */
function resetTurnStatus(ship) {
    ship.evading = false;
}

/**
 * Checks if a ship is destroyed (hull at 0 or below).
 * @param {Ship} ship - The ship to check
 * @returns {boolean} - True if ship is destroyed
 */
function isShipDestroyed(ship) {
    return ship.hull[0] <= 0;
}

/**
 * Gets all alive ships from an array.
 * @param {Ship[]} ships - Array of ships
 * @returns {Ship[]} - Array of ships that are not destroyed
 */
function getAliveShips(ships) {
    return ships.filter(ship => !isShipDestroyed(ship) && !ship.escaped);
}

/**
 * Checks if combat should end (one side has no ships remaining).
 * @param {Ship[]} playerShips - Player's ships
 * @param {Ship[]} enemyShips - Enemy's ships
 * @returns {Object} - {ended, winner} where winner is 'player', 'enemy', or 'draw'
 */
function checkCombatEnd(playerShips, enemyShips) {
    const alivePlayerShips = getAliveShips(playerShips);
    const aliveEnemyShips = getAliveShips(enemyShips);
    
    if (alivePlayerShips.length === 0 && aliveEnemyShips.length === 0) {
        return { ended: true, winner: 'draw' };
    }
    
    if (alivePlayerShips.length === 0) {
        return { ended: true, winner: 'enemy' };
    }
    
    if (aliveEnemyShips.length === 0) {
        return { ended: true, winner: 'player' };
    }
    
    return { ended: false, winner: null };
}
