
class EncounterAI {
    constructor(encounter = new Encounter()) {
        console.log('EncounterAI.constructor', { encounter });
        this.encounter = encounter
    }

    calcShipsWithActions(fleet = new Fleet()) {
        console.log('EncounterAI.calcShipsWithActions', { fleet });
        return fleet.activeShips.filter(s => s.numActionsRemaining > 0)
    }

    calcNearestTarget(ship = new Ship()) {
        const targetShips = this.encounter.calcHarmableTargets(ship)
        console.log('EncounterAI.calcNearestTarget', { ship, targetShips });
        let closestDistance = Infinity
        let closest = undefined
        const {x,y} = ship
        for (const target of targetShips) {
            if (target.disabled || target.escaped) continue
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
        const opposingFleet = this.encounter.calcOpposingFleet(fleet)
        const fleetCombatBalance = fleet.combatRating / opposingFleet.combatRating
        const shipState = (ship.hull[0] / ship.hull[1])
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
    calcBestMoveCoords(ship = new Ship(), destX = 0, destY = 0, avoidHazards = true, simulations = 100) {
        console.log('EncounterAI.calcBestMoveCoords', { ship, destX, destY, simulations });
        const moveArea = ship.calcMoveArea()
        let bestMove = null
        let bestMoveScore = Infinity
        const pathToTarget = new Path(ship.x, ship.y, destX, destY)
        const angleToTarget = pathToTarget.angle
        const distToTarget = pathToTarget.distance
        const effects = avoidHazards ? this.encounter.effects : []
        for (let i = 0; i < simulations; i++) {
            const [toX, toY] = [rng(moveArea.x+moveArea.radiusX, moveArea.x-moveArea.radiusX, false), rng(moveArea.y+moveArea.radiusY, moveArea.y-moveArea.radiusY, false)]
            if (!moveArea.containsPoint(toX, toY)) continue
            const path = new Path(destX, destY, toX, toY)
            const {angle, distance} = path
            const dAngle = angleToTarget - angle
            const normalizedDAngle = normalizeAngle(dAngle);
            const angleScore = (Math.PI - Math.abs(normalizedDAngle)) / Math.PI
            const distanceScore = (distance / distToTarget)
            let hazardPenalty = 0
            // Check if move position is in any hazard effects
            if (avoidHazards) {
                for (const effect of effects) {
                    if (effect.containsPoint(toX, toY)) {
                        hazardPenalty = 0.5 // Increase score (worse) if in hazard
                        break
                    }
                }
            }
            const moveScore = distanceScore * 0.75 + angleScore * 0.25 + hazardPenalty
            if (moveScore < bestMoveScore) {
                bestMoveScore = moveScore
                bestMove = [toX, toY]
            }
        }
        console.log('found calcBestMoveCoords result:',bestMove,bestMoveScore)
        return bestMove
    }

    //simulates 100 moves. a move is considered good if it allows you to attack
    calcBestLaserCoords(attacker = new Ship(), targets = [new Ship()], avoidHazards = true, simulations = 100) {
        console.log('EncounterAI.calcBestLaserCoords', { attacker, targets, simulations });
        const moveArea = attacker.calcMoveArea()
        let bestMove = null
        let bestMoveScore = 0.1 //only consider moves that allow attacking
        const effects = avoidHazards ? this.encounter.effects : []
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
            let hazardPenalty = 0
            // Check if move position is in any hazard effects
            if (avoidHazards) {
                for (const effect of effects) {
                    if (effect.containsPoint(toX, toY)) {
                        hazardPenalty = 0.5 // Reduce score (worse) if in hazard
                        break
                    }
                }
            }
            const moveScore = attackScore * 1 - hazardPenalty
            if (moveScore > bestMoveScore) {
                bestMoveScore = moveScore
                bestMove = [toX, toY]
            }
        }
        return bestMove
    }

    calcModuleAction(ship = new Ship(), strategy = null, targets = [new Ship()]) {
        console.log('EncounterAI.calcModuleAction', { ship, modules: ship.modules });
        const {encounter} = this
        const nearestTarget = this.calcNearestTarget(ship)
        
        // Check each module to see if it can be used
        for (const module of ship.modules) {
            const moduleType = module.moduleType || module
            
            // Check if module is on cooldown
            if (ship.moduleCooldowns.getAmount(moduleType) > 0) {
                continue
            }

            if (strategy == COMBAT_STRATEGIES.Attack || strategy == COMBAT_STRATEGIES.Asteroid) {
                if (moduleType === SHIP_MODULE_TYPES.WARHEAD) {
                    // Warhead: needs targets within bomb area
                    const bombArea = ship.calcBombArea()
                    const targetsInRange = targets.filter(t => 
                        !t.disabled && !t.escaped && bombArea.containsPoint(t.x, t.y)
                    )
                    if (targetsInRange.length > 0) {
                        // Aim at center of closest target
                        const closest = targetsInRange[0]
                        return new WarheadAction(encounter, ship, null, closest.x, closest.y)
                    }
                }
                else if (moduleType === SHIP_MODULE_TYPES.EMP_PULSE) {
                    // EMP Pulse: affects all ships in pulse radius
                    const pulseArea = ship.calcPulseArea()
                    const targetsInRange = targets.filter(t => {
                        if (t.disabled || t.escaped) return false
                        const distance = calcDistance(ship.x, ship.y, t.x, t.y)
                        return distance <= pulseArea.radius
                    })
                    if (targetsInRange.length > 0) {
                        return new EMPPulseAction(encounter, ship)
                    }
                }
                else if (moduleType === SHIP_MODULE_TYPES.MAGNETIZE) {
                    // Magnetize: needs target in beam area
                    const beamTargets = encounter.calcBeamTargets(ship)
                    if (beamTargets.length > 0) {
                        return new MagnetizeAction(encounter, ship, rndMember(beamTargets))
                    }
                }
                else if (moduleType === SHIP_MODULE_TYPES.BOOSTER) {
                    // Booster: use to close distance or escape
                    if (nearestTarget) {
                        const distance = calcDistance(ship.x, ship.y, nearestTarget.x, nearestTarget.y)
                        // Use booster if target is far away when attacking
                        //must be facing the enemy to boost towards them
                        if (distance > ship.maxMoveDistance * 1.5 * Math.random()) {
                            if (this.calcIsFacing(ship, nearestTarget)) {
                                return new BoosterAction(encounter, ship)
                            }
                        }
                    }
                }
                if (moduleType === SHIP_MODULE_TYPES.SMOKE_BOMB) {
                // Smoke Bomb: place near nearest target or self
                    const pulseTargets = encounter.calcPulseTargets(ship)
                    if (pulseTargets.length > 0) {
                        const t = rndMember(pulseTargets)
                        return new SmokeBombAction(encounter, ship, t.x, t.y)//ship, nearestTarget.x, nearestTarget.y)
                    }
                }
            }
            if (strategy == COMBAT_STRATEGIES.Escape || strategy == COMBAT_STRATEGIES.Asteroid) {
                if (moduleType === SHIP_MODULE_TYPES.SMOKE_BOMB) {
                // Smoke Bomb: place near nearest target or self
                    if (nearestTarget) {
                        const pulseArea = ship.calcPulseArea()
                        // Place smoke between ship and target
                        const midX = (ship.x + nearestTarget.x) / 2
                        const midY = (ship.y + nearestTarget.y) / 2
                        if (pulseArea.containsPoint(midX, midY)) {
                            return new SmokeBombAction(encounter, ship, midX, midY)
                        }
                    }
                }
                else if (moduleType === SHIP_MODULE_TYPES.BLINK) {
                    // Blink: use when in danger (low health or outnumbered)
                    const shipHealth = (ship.hull[0] / ship.hull[1] + ship.shields[0] / ship.shields[1]) / 2
                    if (Math.random() > shipHealth) {
                        return new BlinkAction(encounter, ship)
                    }
                }
                else if (moduleType === SHIP_MODULE_TYPES.BOOSTER) {
                    //always boost if retreating
                    return new BoosterAction(encounter, ship)
                }
                else if (moduleType === SHIP_MODULE_TYPES.CLOAK) {
                    // Cloak: use when not already cloaked and in danger
                    if (!ship.statusEffects.has(STATUS_EFFECTS.CLOAKED)) {
                        return new CloakAction(encounter, ship)
                    }
                }
            }
        }
        
        return null
    }

    calcIsFacing(ship = new Ship(), target = new Ship()) {
        console.log('EncounterAI.calcIsFacing', { ship, target });
        const path = new Path(ship.x, ship.y, target.x, target.y)
        const angleToTarget = path.angle
        const dAngle = angleToTarget - ship.angle
        const normalizedDAngle = normalizeAngle(dAngle);
        const isFacing = (Math.abs(normalizedDAngle) < Math.PI/6) //within 30 degrees
        return isFacing
    }

    calcMoveForShip(ship = new Ship()) {
        console.log('EncounterAI.calcMoveForShip', { ship });
        const {encounter} = this
        const strategy = this.calcCombatStrategy(ship)
        const opposingFleet = this.encounter.calcOpposingFleet(ship.fleet)
        const targets = opposingFleet.activeShips
        const attackableTargets = encounter.calcLaserTargets(ship)
        const rammableTargets = encounter.calcRamTargets(ship)
        const nearestTarget = this.calcNearestTarget(ship)

        console.log('deciding move for ship with strategy:', { strategy, nearestTarget, attackableTargets, rammableTargets, targets, opposingFleet });

        // First, try to use ship modules if available and off cooldown
        if (ship.canUseModules && ship.modules.length > 0 && Math.random() > .75) {
            const moduleAction = this.calcModuleAction(ship, strategy, targets)
            if (moduleAction) {
                console.log('AI using module:', moduleAction)
                return moduleAction
            }
        }

        if (strategy == COMBAT_STRATEGIES.Asteroid) {
            if (attackableTargets.length > 0 && ship.canShoot && Math.random() > 0.5) {
                //attack targets if any available
                return new LaserAction(encounter, ship, rndMember(attackableTargets))
            }
            const inTheWayTargets = rammableTargets.filter(t => {
                return this.calcIsFacing(ship, t)
            })
            if (inTheWayTargets.length > 0 && ship.canRam && Math.random() > .5) {
                //ram targets that are in the way
                const targetToRam = rndMember(inTheWayTargets)
                return new RamAction(encounter, ship, targetToRam)
            }
            //if no targets in the way, move semi randomly, mostly in the same dir we're already facing
            const [toX, toY] = rotatePoint(encounter.mapRadius*2, 0, 0, 0, ship.angle + rng(-Math.PI/4, Math.PI/4, false))
            const bestMove = this.calcBestMoveCoords(ship, toX, toY, false)
            if (bestMove) return new MoveAction(encounter, ship, bestMove[0], bestMove[1])
        }
        else if (strategy == COMBAT_STRATEGIES.Attack) {
            if (attackableTargets.length > 0 && ship.canShoot) {
                //attack targets if any available
                return new LaserAction(encounter, ship, rndMember(attackableTargets))
            }
            else if (rammableTargets.length > 0 && ship.canRam) {
                //ram targets if any available - but don't ram if they have more hull than us
                const safeRammableTargets = rammableTargets.filter(t => t.hull[0]*Math.random() < ship.hull[0]*Math.random())
                if (safeRammableTargets.length > 0) {
                    return new RamAction(encounter, ship, rndMember(safeRammableTargets))
                }
            }
            else if (ship.engine > 0 && nearestTarget !== undefined) {
                //move into attack range if possible
                const bestMove = this.calcBestLaserCoords(ship, targets)
                if (bestMove) return new MoveAction(encounter, ship, bestMove[0], bestMove[1])
                else {
                    //move towards nearest target
                    const bestMove = this.calcBestMoveCoords(ship, nearestTarget.x, nearestTarget.y)
                    if (bestMove) return new MoveAction(encounter, ship, bestMove[0], bestMove[1])
                }
            }
        }
        else if (strategy == COMBAT_STRATEGIES.Escape && ship.engine > 0) {
            //move towards edge of map
            const angleFromCenter = calcAngleTowardsPoint(0, 0, ship.x, ship.y)
            const [toX, toY] = rotatePoint(this.encounter.mapRadius*2, 0, 0, 0, angleFromCenter)
            const bestMove = this.calcBestMoveCoords(ship, toX, toY)
            if (bestMove) return new MoveAction(this.encounter, ship, bestMove[0], bestMove[1])
        }
        
        //if all else fails, recharge
        if ((ship.shields[0] < ship.shields[1]) && ship.canRecharge) {
            return new RechargeAction(this.encounter, ship)
        }
        else return new WaitAction(this.encounter, ship)
    }
}

