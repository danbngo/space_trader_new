
class EncounterAI {
    constructor(encounter = new Encounter()) {
        console.log('EncounterAI.constructor', { encounter });
        this.encounter = encounter
    }

    calcOpposingFleet(fleet = new Fleet()) {
        console.log('EncounterAI.calcOpposingFleet', { fleet });
        if (fleet == gs.fleet) return this.encounter.fleet
        else return gs.fleet
    }

    calcActiveShips(fleet = new Fleet()) {
        console.log('EncounterAI.calcActiveShips', { fleet });
        return fleet.ships.filter(s => !s.isDisabled() && !s.escaped)
    }

    calcShipsWithActions(fleet = new Fleet()) {
        console.log('EncounterAI.calcShipsWithActions', { fleet });
        return this.calcActiveShips(fleet).filter(s => s.numActionsRemaining > 0)
    }

    calcNearestTarget(ship = new Ship(), targetShips = [new Ship()]) {
        console.log('EncounterAI.calcNearestTarget', { ship, targetShips });
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

    calcCombatStrategy(ship = new Ship()) {
        console.log('EncounterAI.calcCombatStrategy', { ship });
        const {fleet, aiType} = ship
        const opposingFleet = this.calcOpposingFleet(fleet)
        const fleetCombatBalance = fleet.calcCombatRating() / opposingFleet.calcCombatRating()
        const shipCombatBalance = ship.combatRating / (opposingFleet.calcCombatRating() / (opposingFleet.activeShips.length || 1))
        let strategy;
        
        if (aiType == AI_TYPES.Ship) {
            if (fleetCombatBalance + shipCombatBalance < 0.5) {
                strategy = COMBAT_STRATEGIES.Escape
            }
            else {
                strategy =  COMBAT_STRATEGIES.AttackNearest
            }
        }
        else if (aiType == AI_TYPES.Asteroid) {
            strategy = COMBAT_STRATEGIES.Asteroid
        }

        console.log('combat balances:', { fleetCombatBalance, shipCombatBalance, strategy });
        return strategy
    }

    calcNextMove(fleet = this.encounter.fleet) {
        console.log('EncounterAI.calcNextMove', { fleet });
        const movableShips = this.calcShipsWithActions(fleet)
        const mover = this.calcBestMover(movableShips)
        const action =  this.calcMoveForShip(mover)
        return action
    }

    calcBestMover(movableShips = [new Ship()]) {
        console.log('EncounterAI.calcBestMover', { movableShips });
        let bestShip = null
        let bestScore = -Infinity
        for (const ship of movableShips) {
            //always move ships with least remaining moves
            const score = -ship.numActionsRemaining
            if (score > bestScore) {
                bestScore = score
                bestShip = ship
            }
        }
        return bestShip
    }

    //simulates 100 moves. a move is considered good if it gets you closer to dest or improves your angle towards dest
    calcBestMoveCoords(ship = new Ship(), destX = 0, destY = 0, simulations = 100) {
        console.log('EncounterAI.calcBestMoveCoords', { ship, destX, destY, simulations });
        const moveArea = ship.calcMoveArea()
        let bestMove = null
        let bestMoveScore = 0
        const angleToTarget = new Path(ship.x, ship.y, destX, destY).angle
        for (let i = 0; i < simulations; i++) {
            const [toX, toY] = [rng(moveArea.x+moveArea.radiusX, moveArea.x-moveArea.radiusX, false), rng(moveArea.y+moveArea.radiusY, moveArea.y-moveArea.radiusY, false)]
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
    calcBestAttackCoords(attacker = new Ship(), targets = [new Ship()], simulations = 100) {
        console.log('EncounterAI.calcBestAttackCoords', { attacker, targets, simulations });
        const moveArea = attacker.calcMoveArea()
        let bestMove = null
        let bestMoveScore = 0.1 //only consider moves that allow attacking
        for (let i = 0; i < simulations; i++) {
            const [toX, toY] = [rng(moveArea.x+moveArea.radiusX, moveArea.x-moveArea.radiusX, false), rng(moveArea.y+moveArea.radiusY, moveArea.y-moveArea.radiusY, false)]
            if (!moveArea.containsPoint(toX, toY)) continue
            const [t1, t2] = attacker.calcAttackAreas(toX, toY)
            let canAttack = false
            for (const target of targets) {
                if (t1.containsPoint(target.x, target.y) || t2.containsPoint(target.x, target.y)) {
                    canAttack = true
                    break
                }
            }
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
        console.log('EncounterAI.calcMoveForShip', { ship });
        const {encounter} = this
        const strategy = this.calcCombatStrategy(ship)
        const opposingFleet = this.calcOpposingFleet(ship.fleet)
        const targets = this.calcActiveShips(opposingFleet)
        const attackableTargets = encounter.calcAttackTargets(ship, targets)
        const rammableTargets = encounter.calcRamTargets(ship, targets)
        const nearestTarget = this.calcNearestTarget(ship, targets)

        console.log('deciding move for ship with strategy:', { strategy, attackableTargets, rammableTargets, nearestTarget, targets, opposingFleet });

        if (strategy == COMBAT_STRATEGIES.Asteroid) {
            const inTheWayTargets = rammableTargets.filter(t => {
                const path = new Path(ship.x, ship.y, t.x, t.y)
                const angle = path.angle
                const dAngle = angle - ship.angle
                const normalizedDAngle = Math.atan2(Math.sin(dAngle), Math.cos(dAngle)); 
                const mightHit = (Math.abs(normalizedDAngle) < Math.PI/8);
                return mightHit
            })
            if (inTheWayTargets.length > 0 && ship.engine > 0 && Math.random() > .5) {
                //ram targets that are in the way
                const targetToRam = rndMember(inTheWayTargets)
                return new ShipAction(encounter, ship, MOVE_TYPES.Ram, targetToRam)
            }
            //if no targets in the way, move semi randomly, mostly in the same dir we're already facing
            const [toX, toY] = rotatePoint(0, encounter.mapRadius*2, 0, 0, ship.angle + rng(-Math.PI/8, Math.PI/8, false))
            const bestMove = this.calcBestMoveCoords(ship, toX, toY)
            if (bestMove) return new ShipAction(encounter, ship, MOVE_TYPES.Move, null, bestMove[0], bestMove[1])
        }
        else if (strategy == COMBAT_STRATEGIES.AttackNearest) {
            if (attackableTargets.length > 0 && ship.lasers > 0) {
                //attack targets if any available
                return new ShipAction(encounter, ship, MOVE_TYPES.Attack, nearestTarget)
            }
            else if (rammableTargets.length > 0 && ship.engine > 0) {
                //ram targets if any available
                return new ShipAction(encounter, ship, MOVE_TYPES.Ram, nearestTarget)
            }
            else if (nearestTarget && ship.engine > 0) {
                //move into attack range if possible
                const bestMove = this.calcBestAttackCoords(ship, targets)
                if (bestMove) return new ShipAction(encounter, ship, MOVE_TYPES.Move, null, bestMove[0], bestMove[1])
                else {
                    //move towards nearest target
                    const bestMove = this.calcBestMoveCoords(ship, nearestTarget.x, nearestTarget.y)
                    if (bestMove) return new ShipAction(encounter, ship, MOVE_TYPES.Move, null, bestMove[0], bestMove[1])
                }
            }
        }
        else if (strategy == COMBAT_STRATEGIES.Escape && ship.engine > 0) {
            //move towards edge of map
            const angleFromCenter = calcAngleTowardsPoint(0, 0, ship.x, ship.y)
            const [toX, toY] = rotatePoint(0, this.encounter.mapRadius*2, 0, 0, angleFromCenter)
            const bestMove = this.calcBestMoveCoords(ship, toX, toY)
            if (bestMove) return new ShipAction(this.encounter, ship, MOVE_TYPES.Move, null, bestMove[0], bestMove[1])
        }
        
        //if all else fails, recharge
        if ((ship.shields[0] < ship.shields[1]) && ship.engine > 0) {
            return new ShipAction(this.encounter, ship, MOVE_TYPES.Recharge)
        }
        else return new ShipAction(this.encounter, ship, MOVE_TYPES.Wait)
    }
}

