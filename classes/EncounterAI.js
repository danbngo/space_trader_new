
class EncounterAI {
    constructor(encounter = new Encounter()) {
        this.encounter = encounter
    }

    getOpposingFleet(ship = new Ship()) {
        if (ship.fleet == gs.fleet) return this.fleet
        else return gs.fleet
    }

    calcNearestTarget(ship = new Ship(), targetShips = [new Ship()]) {
        let closestDistance = Infinity
        let closest = targetShips[0]
        const {x,y} = ship
        for (const target of targetShips) {
            if (target.isDisabled()) continue
            const distance = calcDistance(x, y, target.x, target.y)
            if (distance < closestDistance) {
                closestDistance = distance
                closest = target
            }
        }
        return closest
    }

    calcIsFacingAnyTarget(ship = new Ship(), targetShips = [new Ship()]) {
        const {angle, x, y} = ship
        for (const target of targetShips) {
            if (target.isDisabled()) continue
            const angleToTarget = new Path(x, y, target.x, target.y).angle
            let dAngle = angleToTarget - angle;
            dAngle = Math.atan2(Math.sin(dAngle), Math.cos(dAngle)); 
            const mightHit = (Math.abs(dAngle) < SHIP_MAX_FIRING_ANGLE);
            if (mightHit) return true
        }
        return false
    }

    chooseCombatStrategy(ship = new Ship()) {
        if (!ship.autoCombat) return
        const {fleet} = ship
        const opposingFleet = this.getOpposingFleet(ship)
        const fleetCombatBalance = fleet.calcCombatRating() / opposingFleet.calcCombatRating()
        const shipCombatBalance = ship.combatRating / opposingFleet.calcCombatRating()

        if (fleetCombatBalance + shipCombatBalance < 0.5) {
            return COMBAT_STRATEGIES.Escape
        }

        return COMBAT_STRATEGIES.AttackNearest
    }

}

