
class Encounter {
    constructor(gameState = new GameState(), encounterType = ENCOUNTER_TYPES_ALL[0], planet = new Planet(), fleet = new Fleet()) {
        this.encounterType = encounterType;
        this.planet = planet;
        this.fleet = fleet;
        this.combatEnabled = false;
        this.mapDimensions = ENCOUNTER_MAP_RADIUS_MILES;
        this.playerFleet = gameState.fleet
        this.playerShips = this.playerFleet.ships
        this.enemyFleet = this.fleet
        this.enemyShips = this.enemyFleet.ships
        this.ships = [...this.playerShips, ...this.enemyShips]
    }

    tick(elapsedSeconds = 0) {
        this.refreshShipStatus(elapsedSeconds)
        this.applyPhysics(elapsedSeconds)
        this.makeShipsPlan()
        this.makeShipsMove(elapsedSeconds)
        this.makeShipsFire(elapsedSeconds)
    }

    applyPhysics(elapsedSeconds = 0) {
        for (const ship of this.ships) {
            ship.x += ship.speedX * elapsedSeconds
            ship.y += ship.speedY * elapsedSeconds
        }
    }

    calcNearestTarget(ship = new Ship(), targetShips = [new Ship()]) {
        let closestDistance = Infinity
        let closest = targetShips[0]
        const {x,y} = ship
        for (const target of targetShips) {
            const distance = calcDistance(x, y, target.x, target.y)
            if (distance < closestDistance) {
                closestDistance = distance
                closest = target
            }
        }
        return closest
    }

    refreshShipStatus(elapsedSeconds = 0) {
        const {ships} = this
        for (const ship of ships) {
            //update stats
            ship.checkDoneFiring(elapsedSeconds)
            if (!ship.firingTimeRemaining) ship.rechargeLaser(elapsedSeconds)
            ship.resetCombatVarsTurn() //always last, otherwise recharge ALWAYS works
        }
    }

    makeShipsPlan() {
        const {ships, playerShips, enemyFleet, playerFleet} = this
        for (const ship of ships) {
            const opposingFleet = playerShips.includes(ship) ? enemyFleet : playerFleet
            //assign a combat strategy for ships in auto
            if (ship.autoCombat) {
                ship.combatStrategy = COMBAT_STRATEGIES.ATTACK_NEAREST
            }
            //choose a target
            if (!ship.firingTimeRemaining) { //dont change targets while shooting
                if (ship.combatStrategy == COMBAT_STRATEGIES.ATTACK_NEAREST) {
                    const target = this.calcNearestTarget(ship, opposingFleet.ships)
                    ship.target = target
                    ship.destinationX = target.x
                    ship.destinationY = target.y
                    //console.log('set target for ship:',target)
                }
            }
        }   
    }

    makeShipsFire() {
        const {ships} = this
        for (const ship of ships) {
            const {target} = ship
            if (!ship.canFireAt(target)) continue
            ship.fire(target)
        }
    }

    makeShipsMove(elapsedSeconds = 0) {
        const {ships} = this

        for (const ship of ships) {
            const {x,y,destinationX,destinationY,angle} = ship //do not move to the top
            //dont bother moving if no destination
            if (destinationX == undefined || destinationY == undefined) continue
            //thrust towards target
            const angleToDestination = new Path(x, y, destinationX, destinationY).angle
            const distanceToDestination = calcDistance(x, y, destinationX, destinationY)

            //how much is our current angle different from the angle we need to be facing in?
            let dAngle = angleToDestination - angle;
            // Normalize angle difference to the range (-PI, PI]
            dAngle = Math.atan2(Math.sin(dAngle), Math.cos(dAngle)); 

            //if destination is behind us, decelerate, otherwise accelerate
            const shouldDecel = (Math.abs(dAngle) > Math.PI / 2);
            //if destination is to the left of us, turn left, otherwise turn right
            const shouldTurnCounterClockwise = (dAngle < 0);

            //dont bother moving around if target is very close
            if (distanceToDestination > this.mapDimensions/1000) {
                //console.log('too far from enemy, so chasing:',elapsedSeconds,shouldDecel)
                ship.accelerate(elapsedSeconds, shouldDecel)
            }
            ship.turn(elapsedSeconds, shouldTurnCounterClockwise)
        }
    }
}

