
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

    calcShipsWithActions(fleet = new Fleet()) {
        console.log('EncounterAI.calcShipsWithActions', { fleet });
        return fleet.activeShips.filter(s => s.numActionsRemaining > 0)
    }

    calcNearestTarget(ship = new Ship(), targetShips = [new Ship()]) {
        console.log('EncounterAI.calcNearestTarget', { ship, targetShips });
        let closestDistance = Infinity
        let closest = undefined
        const {x,y} = ship
        for (const target of targetShips) {
            if (target.isDisabled() || target.escaped) continue
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
        const fleetCombatBalance = fleet.combatRating / opposingFleet.combatRating
        const shipState = (ship.hull[0] / ship.hull[1] + ship.shields[0] / ship.shields[1]) / 2
        let strategy;
        
        if (aiType == AI_TYPES.Ship) {
            if (Math.max(fleetCombatBalance*shipState, shipState) < 0.5) {
                strategy = COMBAT_STRATEGIES.Escape
            }
            else {
                strategy =  COMBAT_STRATEGIES.Attack
            }
        }
        else if (aiType == AI_TYPES.Asteroid) {
            strategy = COMBAT_STRATEGIES.Asteroid
        }

        console.log('combat balances:', { fleetCombatBalance, shipState, strategy });
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
        let bestMoveScore = Infinity
        const pathToTarget = new Path(ship.x, ship.y, destX, destY)
        const angleToTarget = pathToTarget.angle
        const distToTarget = pathToTarget.distance
        for (let i = 0; i < simulations; i++) {
            const [toX, toY] = [rng(moveArea.x+moveArea.radiusX, moveArea.x-moveArea.radiusX, false), rng(moveArea.y+moveArea.radiusY, moveArea.y-moveArea.radiusY, false)]
            if (!moveArea.containsPoint(toX, toY)) continue
            const path = new Path(destX, destY, toX, toY)
            const {angle, distance} = path
            const dAngle = angleToTarget - angle
            const normalizedDAngle = Math.atan2(Math.sin(dAngle), Math.cos(dAngle)); 
            const angleScore = (Math.PI - Math.abs(normalizedDAngle)) / Math.PI
            const distanceScore = (distance / distToTarget)
            const moveScore = distanceScore * 0.5 + angleScore * 0.5
            if (moveScore < bestMoveScore) {
                bestMoveScore = moveScore
                bestMove = [toX, toY]
            }
        }
        console.log('found calcBestMoveCoords result:',bestMove,bestMoveScore)
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
            const [t1, t2] = attacker.calcLaserAreas(toX, toY)
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
        const targets = opposingFleet.activeShips
        const attackableTargets = encounter.calcAttackTargets(ship)
        const rammableTargets = encounter.calcRamTargets(ship)
        const nearestTarget = this.calcNearestTarget(ship, opposingFleet.activeShips)

        console.log('deciding move for ship with strategy:', { strategy, nearestTarget, attackableTargets, rammableTargets, targets, opposingFleet });

        if (strategy == COMBAT_STRATEGIES.Asteroid) {
            if (attackableTargets.length > 0 && ship.lasers > 0 && Math.random() > 0.5) {
                //attack targets if any available
                return new ShipAction(encounter, ship, MOVE_TYPES.Attack, rndMember(attackableTargets))
            }
            const inTheWayTargets = rammableTargets.filter(t => {
                const path = new Path(ship.x, ship.y, t.x, t.y)
                const angle = path.angle
                const dAngle = angle - ship.angle
                const normalizedDAngle = Math.atan2(Math.sin(dAngle), Math.cos(dAngle)); 
                const mightHit = (Math.abs(normalizedDAngle) < Math.PI/4);
                return mightHit
            })
            if (inTheWayTargets.length > 0 && ship.engine > 0 && Math.random() > .5) {
                //ram targets that are in the way
                const targetToRam = rndMember(inTheWayTargets)
                return new ShipAction(encounter, ship, MOVE_TYPES.Ram, targetToRam)
            }
            //if no targets in the way, move semi randomly, mostly in the same dir we're already facing
            const [toX, toY] = rotatePoint(encounter.mapRadius*2, 0, 0, 0, ship.angle + rng(-Math.PI/4, Math.PI/4, false))
            const bestMove = this.calcBestMoveCoords(ship, toX, toY)
            if (bestMove) return new ShipAction(encounter, ship, MOVE_TYPES.Move, null, bestMove[0], bestMove[1])
        }
        else if (strategy == COMBAT_STRATEGIES.Attack) {
            if (attackableTargets.length > 0 && ship.lasers > 0) {
                //attack targets if any available
                return new ShipAction(encounter, ship, MOVE_TYPES.Attack, rndMember(attackableTargets))
            }
            else if (rammableTargets.length > 0 && ship.engine > 0) {
                //ram targets if any available - but don't ram if they have more hull than us
                const safeRammableTargets = rammableTargets.filter(t => t.hull[0]*Math.random() < ship.hull[0]*Math.random())
                if (safeRammableTargets.length > 0) {
                    return new ShipAction(encounter, ship, MOVE_TYPES.Ram, rndMember(safeRammableTargets))
                }
            }
            else if (ship.engine > 0 && nearestTarget !== undefined) {
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
            const [toX, toY] = rotatePoint(this.encounter.mapRadius*2, 0, 0, 0, angleFromCenter)
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

