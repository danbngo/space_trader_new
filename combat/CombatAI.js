/**
 * CombatAI - handles enemy AI decision making during combat
 */
class CombatAI {

    /**
     * Decides what action an enemy ship should take
     * @param {Ship} ship - The enemy ship making the decision
     * @returns {Object} - { action: string, target: Ship|null }
     */
    decideAction(ship) {
        const alivePlayers = gs.combat.activePlayerShips
        
        if (alivePlayers.length === 0) {
            return { action: 'none', target: null }
        }

        // Check if ship needs to recharge
        const shieldsLow = ship.shields[0] < ship.shields[1] * 0.3
        const lasersEmpty = ship.lasers <= 0
        const needsRecharge = shieldsLow || lasersEmpty

        if (needsRecharge) {
            return { action: 'recharge', target: null }
        }

        // Decide between laser attack and ram
        const canUseLasers = ship.lasers > 0
        const useLasers = canUseLasers && Math.random() > 0.3

        // Pick a random player target
        const target = alivePlayers[Math.floor(Math.random() * alivePlayers.length)]

        if (useLasers) {
            return { action: 'laser', target }
        } else {
            return { action: 'ram', target }
        }
    }

    /**
     * Executes a full turn for all enemy ships
     * @returns {CombatResult[]} - Array of results from all enemy actions
     */
    executeEnemyTurn() {
        const results = []
        const aliveEnemies = gs.combat.activeEnemyShips

        for (const enemyShip of aliveEnemies) {
            const decision = this.decideAction(enemyShip)
            
            if (decision.action !== 'none') {
                const result = gs.combat.executeAction(enemyShip, decision.action, decision.target)
                results.push(result)
            }
        }

        return results
    }
}
