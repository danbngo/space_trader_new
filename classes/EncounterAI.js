
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
            const mightHit = (Math.abs(dAngle) < Math.PI / 4); //loosen this to allow leading ships
            if (mightHit) return true
        }
        return false
    }

    /*calcEffectiveProjectileSpeed(firedBy = new Ship(), distance = 1, accelPerSecond=PROJECTILE_SPEED_INCREASE_FACTOR_PER_SECOND) {
        const [speedX,speedY,speed] = this.encounter.calcProjectileSpeed(firedBy)
        
        const r = accelPerSecond;
        const v0 = speed;

        // Time to cover distance with accelerating projectile
        const t = Math.log(1 + (distance * Math.log(r) / v0)) / Math.log(r);

        // Approximate "average speed" along path:
        // Or instantaneous speed at time of impact:
        const vImpact = v0 * Math.pow(r, t);

        return vImpact;
    }*/

    calcFuturePosition(firedBy = new Ship(), target = new Ship(), projectileSpeed = PROJECTILE_SPEED_IN_MILES_PER_SECOND) {
        const sx = firedBy.x;
        const sy = firedBy.y;
        const tx = target.x;
        const ty = target.y;

        const vx = target.speedX * 1.2; //assume they'll continue accelerating
        const vy = target.speedY * 1.2;

        const dx = tx - sx;
        const dy = ty - sy;

        const a = vx*vx + vy*vy - projectileSpeed*projectileSpeed;
        const b = 2 * (dx*vx + dy*vy);
        const c = dx*dx + dy*dy;

        // Solve quadratic: a t² + b t + c = 0
        const disc = b*b - 4*a*c;
        if (disc < 0) {
            // No real interception -- target too fast, aim directly instead
            return [tx,ty]
        }

        // Two roots, pick the smallest positive time
        const t1 = (-b + Math.sqrt(disc)) / (2*a);
        const t2 = (-b - Math.sqrt(disc)) / (2*a);

        const t = Math.min(t1, t2) > 0 ? Math.min(t1, t2)
            : Math.max(t1, t2) > 0 ? Math.max(t1, t2)
            : null;

        // If no positive solution, just aim directly
        if (!t) return [tx,ty]

        return [
            tx + vx * t,
            ty + vy * t,
        ]
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

    makeShipsPlan() {
        const {ships} = this.encounter
        for (const ship of ships) {
            if (ship.isDisabled()) continue
            const {fleet} = ship
            const opposingFleet = this.getOpposingFleet(ship)
            //assign a combat strategy for ships in auto
            ship.combatStrategy = this.chooseCombatStrategy(ship)
            //choose a target
            if (ship.combatStrategy == COMBAT_STRATEGIES.AttackNearest) {
                const target = this.calcNearestTarget(ship, opposingFleet.ships)
                if (!target) continue
                ship.target = target
                //estimate the target's future position
                //const dist = calcDistance(ship.x, ship.y, target.x, target.y)
                const effectiveProjectileSpeed = PROJECTILE_SPEED_IN_MILES_PER_SECOND//this.calcEffectiveProjectileSpeed(ship, dist)
                const [fx,fy] = this.calcFuturePosition(ship, target, effectiveProjectileSpeed)
                ship.destinationX = fx//target.x
                ship.destinationY = fy//target.y
                //console.log('set target for ship:',target)
            }
            else if (ship.combatStrategy == COMBAT_STRATEGIES.Escape) {
                //set destination to edge of map
                const angleAwayFromCenter = new Path(0, 0, ship.x, ship.y).angle
                const escapeDistance = this.encounter.mapDimensions*1.1 //just go off the map
                ship.destinationX = ship.x + Math.cos(angleAwayFromCenter)*escapeDistance
                ship.destinationY = ship.y + Math.sin(angleAwayFromCenter)*escapeDistance
            }
        }   
    }

    makeShipsFire(onShipFire = (s = new Ship())=>{}) {
        const {ships} = this.encounter
        for (const ship of ships) {
            if (ship.isDisabled()) continue
            if (!ship.autoCombat) continue
            const opposingFleet = this.getOpposingFleet(ship)
            //console.log('1')
            if (!ship.canFire()) continue
            if (!this.calcIsFacingAnyTarget(ship, opposingFleet.ships)) continue //dont shoot if we wont hit anything
            onShipFire(ship)
        }
    }

    makeShipsMove(elapsedSeconds = 0) {
        const {ships} = this.encounter
        for (const ship of ships) {
            if (ship.isDisabled()) continue
            if (!ship.autoCombat) continue
            const {x,y,destinationX,destinationY,angle} = ship //do not move to the top
            //dont bother moving if no destination
            if (destinationX == undefined || destinationY == undefined) continue
            //thrust towards target
            const angleToDestination = new Path(x, y, destinationX, destinationY).angle
            //const distanceToDestination = calcDistance(x, y, destinationX, destinationY)

            //how much is our current angle different from the angle we need to be facing in?
            let dAngle = angleToDestination - angle;
            // Normalize angle difference to the range (-PI, PI]
            dAngle = Math.atan2(Math.sin(dAngle), Math.cos(dAngle)); 

            //if destination is behind us, decelerate, otherwise accelerate
            const shouldDecel = (Math.abs(dAngle) > Math.PI / 2);
            //if destination is to the left of us, turn left, otherwise turn right
            const shouldTurnCounterClockwise = (dAngle > 0);

            //dont bother moving around if target is very close
            //TODO: re-enable this
            if (true) {//distanceToDestination > this.mapDimensions/1000) {
                //console.log('too far from enemy, so chasing:',elapsedSeconds,shouldDecel)
                ship.accelerate(elapsedSeconds, shouldDecel)
            }
            ship.turn(elapsedSeconds, shouldTurnCounterClockwise)
        }
    }
}

