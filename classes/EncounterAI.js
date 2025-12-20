
class EncounterAI {
    constructor(encounter = new Encounter()) {
        this.encounter = encounter
    }

    calcOpposingFleet(fleet = new Fleet()) {
        if (fleet == gs.fleet) return this.encounter.fleet
        else return gs.fleet
    }

    calcActiveShips(fleet = new Fleet()) {
        return fleet.ships.filter(s => !s.isDisabled() && !s.escaped)
    }

    calcShipsWithMoves(fleet = new Fleet()) {
        return this.calcActiveShips(fleet).filter(s => s.numMovesRemaining > 0)
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

    calcCombatStrategy(ship = new Ship()) {
        const {fleet} = ship
        const opposingFleet = this.calcOpposingFleet(fleet)
        const fleetCombatBalance = fleet.calcCombatRating() / opposingFleet.calcCombatRating()
        const shipCombatBalance = ship.combatRating / opposingFleet.calcCombatRating()

        if (fleetCombatBalance + shipCombatBalance < 0.5) {
            return COMBAT_STRATEGIES.Escape
        }

        return COMBAT_STRATEGIES.AttackNearest
    }

    calcNextMove(fleet = this.encounter.fleet) {
        const opposingFleet = this.calcOpposingFleet(fleet)
        const movableShips = this.calcShipsWithMoves(fleet)
        const mover = rndMember(movableShips)
        const move = this.calcMoveForShip(mover)
        return move
    }

    //simulates 100 moves. a move is considered good if it gets you closer to dest or improves your angle towards dest
    calcBestMoveCoords(ship = new Ship(), destX = 0, destY = 0, simulations = 100) {
        const moveArea = ship.calcMoveArea()
        let bestMove = null
        let bestMoveScore = 0
        const angleToTarget = new Path(ship.x, ship.y, destX, destY).angle
        for (let i = 0; i < simulations; i++) {
            const [toX, toY] = [rng(moveArea.x-moveArea.radiusX, moveArea.x+moveArea.radiusX), rng(moveArea.y-moveArea.radiusY, moveArea.y+moveArea.radiusY)]
            if (!moveArea.containsPoint(toX, toY)) continue
            const path = new Path(ship.x, ship.y, destX, destY)
            const {angle, distance} = path
            const dAngle = angleToTarget - angle
            const normalizedDAngle = Math.atan2(Math.sin(dAngle), Math.cos(dAngle)); 
            const angleScore = (Math.PI - Math.abs(normalizedDAngle)) / Math.PI
            const distanceScore = 1 / (1 + distance)
            const moveScore = angleScore * 0.7 + distanceScore * 0.3
            if (moveScore > bestMoveScore) {
                bestMoveScore = moveScore
                bestMove = [toX, toY]
            }
        }
        return bestMove
    }

    //simulates 100 moves. a move is considered good if it allows you to attack
    calcBestAttackCoords(attacker = new Ship(), target = new Ship(), simulations = 100) {
        const moveArea = attacker.calcMoveArea()
        let bestMove = null
        let bestMoveScore = 0.1 //only consider moves that allow attacking
        const [targetX, targetY] = [target.x, target.y]
        for (let i = 0; i < simulations; i++) {
            const [toX, toY] = [rng(moveArea.x-moveArea.radiusX, moveArea.x+moveArea.radiusX), rng(moveArea.y-moveArea.radiusY, moveArea.y+moveArea.radiusY)]
            if (!moveArea.containsPoint(toX, toY)) continue
            const [t1, t2] = attacker.calcAttackAreas(toX, toY)
            const canAttack = (isPointInTriangle(targetX, targetY, t1.points) || isPointInTriangle(targetX, targetY, t2.points))
            const attackScore = canAttack ? 1.0 : 0.0
            const moveScore = attackScore * 1
            if (moveScore > bestMoveScore) {
                bestMoveScore = moveScore
                bestMove = [toX, toY]
            }
        }
        return bestMove
    }

    calcMoveForShip(ship = new Ship()) {
        const strategy = this.calcCombatStrategy(ship)
        const opposingFleet = this.calcOpposingFleet(ship.fleet)
        const targets = this.calcActiveShips(opposingFleet)
        const attackableTargets = this.encounter.calcAttackTargets(ship, targets)

        const moveArea = ship.calcMoveArea()

        if (strategy == COMBAT_STRATEGIES.AttackNearest) {
            if (attackableTargets.length > 0) {
                return new ShipMove(MOVE_TYPES.Attack, ship, nearestTarget)
            }
            else {
                const nearestTarget = this.calcNearestTarget(ship, targets)
                const [toX, toY] = this.calcBestMoveCoords(ship, nearestTarget.x, nearestTarget.y)
                return new ShipMove(MOVE_TYPES.Move, ship, null, toX, toY)
            }
        }
    }
}

