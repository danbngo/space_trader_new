

class Graphics {
    constructor(shape = "circle", color = "White", size = 1) {
        this.shape = shape
        this.color = color
        this.size = size
    }
}

// Officer class
class Officer {
    constructor(name = "Unnamed", credits = 0, fame = 0, infamy = 0, bounty = 0, pilotSkill = 0, engineerSkill = 0, negotiationSkill = 0) {
        this.name = name;
        this.credits = credits;
        this.fame = fame;
        this.infamy = infamy;
        this.bounty = bounty;
        this.pilotSkill = pilotSkill;
        this.engineerSkill = engineerSkill;
        this.negotiationSkill = negotiationSkill;
    }

    get value() {
        return Math.pow(1 + this.pilotSkill + this.engineerSkill + this.negotiationSkill, 2)*100
    }
}

// Cargo class
class Cargo {
    constructor(cargoCounts = new Map([[CARGO_TYPES_ALL[0],0]])) {
        this.cargoCounts = cargoCounts
        for (const ct of CARGO_TYPES_ALL) {
            if (!this.cargoCounts.has(ct)) this.cargoCounts.set(ct,0)
        }
    }

    getAmount(cargoType = CARGO_TYPES_ALL[0]) {
        return this.cargoCounts.get(cargoType)
    }

    increment(cargoType = CARGO_TYPES_ALL[0], amount = 0) {
        this.cargoCounts.set(cargoType, this.cargoCounts.get(cargoType) + amount)
    }

    setAmount(cargoType = CARGO_TYPES_ALL[0], amount = 0) {
        this.cargoCounts.set(cargoType, amount)
    }

    calcTotalCargo() {
        return calcMapValuesTotal(this.cargoCounts)
    }
    
    randomItem() {
        const ctWeights = []
        for (const ct of CARGO_TYPES_ALL) weights.push(this.getAmount(ct))
        const ctIndex = rndIndexWeighted(ctWeights)
        const ct = CARGO_TYPES_ALL[ctIndex]
        return ct
    }

    //probably not mathematically correct but oh well
    randomSubset(amount = 0) {
        const subset = new Cargo()
        amount = Math.min(this.calcTotalCargo(), amount)
        while (amount > 0) {
            const ct = this.randomItem()
            if (subset.getAmount(ct) > this.getAmount(ct)) continue
            subset.increment(ct, 1)
        }
        return subset
    }

    add(addedCargo = new Cargo()) {
        for (const ct of CARGO_TYPES_ALL) {
            const amount = addedCargo.getAmount(ct)
            this.increment(ct, amount)
        }
    }

    subtract(subtractedCargo = new Cargo()) {
        for (const ct of CARGO_TYPES_ALL) {
            const amount = subtractedCargo.getAmount(ct)
            this.increment(ct, -amount)
        }
    }
}

// SpaceObject class
class SpaceObject {
    constructor(name = "Unnamed", graphics = new Graphics(), radius = 0, x = 0, y = 0) {
        this.name = name;
        this.graphics = graphics
        this.radius = radius;
        this.x = x;
        this.y = y;
        this.parent = null;
        this.children = [];
    }
    addChildren(children = []) {
        for (const child of children) {
            child.detachFromParent()
            child.parent = this
        }
        console.log('assigning children:',this,children)
        this.children.push(...children)
    }
    detachFromParent() {
        if (!this.parent) return
        const newChildren = new Set(parent.children)
        newChildren.delete(this)
        parent.children = Array.from(newChildren)
        this.parent = undefined
    }
}

class BackgroundStar extends SpaceObject {}

// Orbit class
class Orbit {
    constructor(radius = 0, progressOffset = Math.random()) {
        this.radius = radius;
        this.progressOffset = progressOffset
    }

    // Calculate orbital period in Earth years (Kepler's third law simplified: P^2 = a^3, a in AU, P in years)
    calcPeriod() {
        return Math.sqrt(Math.pow(this.radius, 3));
    }

    // Calculate progress along orbit as a 0-1 ratio given elapsed years
    calcProgress(years = 0) {
        const period = this.calcPeriod();
        return this.progressOffset + (years % period) / period;
    }

    calcAngle(years = 0) {
        const progress = this.calcProgress(years);
        return 2 * Math.PI * progress;
    }

    // Calculate x, y position relative to center based on elapsed years
    calcRelativePosition(years = 0) {
        const angle = this.calcAngle(years);
        const x = this.radius * Math.cos(angle);
        const y = this.radius * Math.sin(angle);
        return [x,y]
    }
}

// Ship class
class Ship {
    constructor(name = "Unnamed", graphics = new Graphics('triangle', 'white', SPACE_SHIP_SIZE_IN_EARTH_RADII), hull = [0, 0], shields = [0, 0], lasers = 0, thrusters = 0, cargoSpace = 0) {
        this.name = name;
        this.graphics = graphics;
        this.hull = hull;
        this.shields = shields;
        this.lasers = lasers;
        this.thrusters = thrusters;
        this.cargoSpace = cargoSpace;
        this.x = 0; //used for encounters, only fleets travel in systems
        this.y = 0;
        this.destinationX = 0;
        this.destinationY = 0;
        this.angle = Math.PI*2; //direction ship is facing in. it can only accelerate/decelerate and shoot in that direction
        this.speedX = 0; //ships have momentum!
        this.speedY = 0;
        this.target = null; //ship that this one's trying to attack
        this.isShooting = false; //ships shoot laser in a stream
        this.currentLaser = 0;
        this.combatStrategy = COMBAT_STRATEGIES[0];
        this.autoCombat = true;
        this.laserRechargeProgress = 0;
        this.shieldRechargeProgress = 0;
    }

    get value() {
        return Math.pow(this.hull[1]/5 + this.shields[1]/5 + this.lasers + this.thrusters + this.cargoSpace, 2)*10
    }

    resetCombatVars() {
        this.destinationX = undefined;
        this.destinationY = undefined;
        this.angle = Math.PI*2;
        this.speedX = 0;
        this.speedY = 0;
        this.target = null;
        this.isShooting = false; 
        this.currentLaser = 0;
        this.combatStrategy = COMBAT_STRATEGIES_ALL[0];
        this.autoCombat = true;
        this.shieldRechargeProgress = 0;
        this.laserRechargeProgress = 0;
    }

    //in AU per years. during combat etc. baggage train is left behind.
    calcSpeed() {
        //in SPACE, each thruster makes your fleet go 1 AU per MINUTE if there was no weight
        //in COMBAT, same value = 1,549,263.45  IN  miles per second
        const mod = 1549263
        let thrusters = this.thrusters * mod * ENCOUNTER_THRUSTER_PENALTY
        let weight = this.value
        return thrusters / weight
    }

    calcAngleDeg() {
        return radiansToDegrees(this.angle)
    }

    accelerate(elapsedSeconds = 1, decel = false) {
        const speed = this.calcSpeed()
        const force = speed*elapsedSeconds
        const forceDims = rotatePoint(force,0,0,0,this.angle)
        this.speedX += (decel ? -1 : 1) * forceDims[0]
        this.speedY += (decel ? -1 : 1) * forceDims[1]
    }

    turn(elapsedSeconds = 1, counterClockwise = false) {
        const speed = this.calcSpeed()
        const force = speed*elapsedSeconds/TIME_TO_TURN_SHIP_WITH_ONE_THRUSTER_IN_SECONDS
        const turnRatio = force * (counterClockwise ? -1 : 1)
        this.angle += turnRatio*Math.PI*2
    }

    rechargeShields(elapsedSeconds = 1) {
        if (this.shields[0] >= this.shields[1]) return
        const rechargeProgress = elapsedSeconds/TIME_TO_RECHARGE_SHIELDS_IN_SECONDS
        this.shieldRechargeProgress += rechargeProgress
        const shieldChargedAmt = Math.floor(this.shieldRechargeProgress)
        if (shieldChargedAmt <= 0) return
        this.shieldRechargeProgress -= shieldChargedAmt
        this.shields[0] = Math.max(this.shields[1], this.shields[0]+this.shieldChargedAmt)
    }

    rechargeLaser(elapsedSeconds = 1) {
        if (this.laserRechargeProgress >= 1) return
        const rechargeProgress = elapsedSeconds/TIME_TO_RECHARGE_LASER_IN_SECONDS
        this.laserRechargeProgress = Math.min(1, this.laserRechargeProgress+rechargeProgress)
    }
}

class OrbitingObject extends SpaceObject {
    constructor(name = "Unnamed", graphics = new Graphics(), radius = 0, x = 0, y = 0, orbit = null) {
        super(name, graphics, radius, x, y);
        this.orbit = orbit;
    }
    calcAbsPositionAtYear(year = 0) {
        if (!this.orbit) return [this.x, this.y]
        let [ox, oy] = this.orbit.calcRelativePosition(year);
        if (this.parent) {
            const [px, py] = this.parent.calcAbsPositionAtYear(year)
            ox += px
            oy += py
        }
        return [ox, oy]
    }
}

// Star class extends SpaceObject
class Star extends OrbitingObject {
    constructor(name = "Unnamed", graphics = new Graphics(), radius = 0, x = 0, y = 0, orbit = null) {
        super(name, graphics, radius, x, y, orbit);
    }
}

// Shipyard class
class Shipyard {
    constructor(planet = new Planet(), ships = [], credits = 0, rake = 0) {
        this.planet = planet
        this.ships = ships; // Ship[]
        this.credits = credits;
        this.rake = rake
    }
    calcBuyPrice(ship = new Ship()) {
        return Math.round(ship.value / (1+this.rake))
    }
    calcSellPrice(ship = new Ship()) {
        return Math.round(ship.value * (1+this.rake))
    }
}

// Guild class
class Guild {
    constructor(planet = new Planet(), officers = [], rake = 0) {
        this.planet = planet
        this.officers = officers; // Officer[]
        this.rake = rake
    }
}

// Market class
class Market {
    constructor(planet = new Planet(), cargo = [], credits = 0, rake = 0) {
        this.planet = planet
        this.cargo = cargo; // Cargo[]
        this.credits = credits;
        this.rake = rake
    }

    calcCargoBuyPrices() {
        const prices = new Cargo()
        for (const cargoType of CARGO_TYPES_ALL) {
            const price = Math.round(cargoType.value * this.planet.culture.cargoPriceModifiers.getAmount(cargoType) * (1+this.rake))
            prices.setAmount(cargoType, price)
        }
        return prices
    }

    calcCargoSellPrices() {
        const prices = new Cargo()
        for (const cargoType of CARGO_TYPES_ALL) {
            const price = Math.round(cargoType.value * this.planet.culture.cargoPriceModifiers.getAmount(cargoType) / (1+this.rake))
            prices.setAmount(cargoType, price)
        }
        return prices
    }

}

class Culture {
    constructor(cargoPriceModifiers = new Cargo(), shipQuality = 1.0, patrolRange = 1) {
        this.cargoPriceModifiers = cargoPriceModifiers
        this.shipQuality = shipQuality;
        this.patrolRange = patrolRange; //AUs, recall that neptune is 30
    }
}

class Settlement {
    constructor(shipyard = null, market = null, blackMarket = null, guild = null) {
        this.shipyard = shipyard;
        this.market = market;
        this.blackMarket = blackMarket;
        this.guild = guild;
    }
}

// Planet class extends SpaceObject
class Planet extends OrbitingObject {
    constructor(name = "Unnamed", graphics = new Graphics(), radius = 0, x = 0, y = 0, orbit = null, settlement = new Settlement(), culture = new Culture()) {
        super(name, graphics, radius, x, y, orbit);
        this.settlement = settlement
        this.culture = culture
    }
}

// Fleet class extends SpaceObject
class Fleet extends SpaceObject {
    constructor(name = "Unnamed", graphics = new Graphics(), x = 0, y = 0, ships = [new Ship()], cargo = new Cargo(), captain = new Officer(), officers = [new Officer()], location = null) {
        super(name, graphics, 0, x, y);
        this.ships = ships; // Ship[]
        this.cargo = cargo;
        this.captain = captain
        this.officers = officers; // Officer[]
        this.location = location; // SpaceObject
        this.route = null //could be Route class
    }

    dock(planet) {
        this.location = planet
        this.x = planet.x
        this.y = planet.y
        planet.addChildren([this])
    }

    calcTotalCargoSpace() {
        return this.ships.reduce((total, ship) => total + ship.cargoSpace, 0);
    }

    calcAvailableCargoSpace() {
        return this.calcTotalCargoSpace() - this.cargo.calcTotalCargo()
    }

    calcTotalThrusters() {
        return this.ships.reduce((total, ship) => total + ship.thrusters, 0);
    }

    //in AU per years
    calcSpeed() {
        //each thruster makes your fleet go 1 AU per MINUTE if there was no weight
        const totalThrusters = this.calcTotalThrusters()
        let weight = 0
        for (const ship of this.ships) {
            weight += ship.value
        }
        weight += this.cargo.calcTotalCargo()
        return 60 * 24 * 365 * totalThrusters / weight
    }

}

class StarSystem extends SpaceObject {
    constructor(name = "Unnamed", graphics = new Graphics(), radius = 0, x = 0, y = 0, barycenter = null, stars = [], planets = [], fleets = [], backgroundStars = []) {
        super(name, graphics, radius, x, y)
        this.barycenter = barycenter
        this.stars = stars
        this.planets = planets
        this.fleets = fleets
        this.backgroundStars = backgroundStars
    }

    refreshPositions(year = gameState.year) {
        const objects = [...this.stars, ...this.planets]
        for (const obj of objects) {
            const [x, y] = obj.calcAbsPositionAtYear(year)
            obj.x = x
            obj.y = y
        }

        const fleets = this.fleets
        for (const fleet of fleets) {
            //if docked, move with planet
            if (fleet.location && !fleet.route) {
                fleet.x = fleet.location.x
                fleet.y = fleet.location.y
                continue
            }
            if (!fleet.route) continue //if floating in space, do nothing
            //if route not started yet, do nothing
            if (year <= fleet.route.startYear) continue
            //check if route completed, if so arrive at destination and dock
            if (year >= fleet.route.endYear) {
                fleet.location = fleet.route.destination
                fleet.route = undefined
                continue
            }
            //otherwise, make progress along journey
            fleet.location = undefined
            const [fx,fy] = fleet.route.positionAtYear(year)
            fleet.x = fx
            fleet.y = fy
        }
    }
}

class Path {
    constructor(startX = 0, startY = 0, endX = 0, endY = 0) {
        this.startX = startX
        this.startY = startY
        this.endX = endX
        this.endY = endY
        this.left = Math.min(this.startX, this.endX)
        this.top = Math.min(this.startY, this.endY)
        this.right = Math.max(this.startX, this.endX)
        this.bottom = Math.max(this.startY, this.endY)
        this.width = (this.right-this.left)
        this.height = (this.bottom-this.top)
        this.distance = Math.sqrt(this.width*this.width + this.height*this.height);
        this.dx = this.endX - this.startX
        this.dy = this.endY - this.startY
        this.angle = Math.atan2(this.dy, this.dx);
        this.angleDeg = radiansToDegrees(this.angle) // convert to degrees
    }
}

class Route {
    constructor(fleet = new Fleet(), destination = new Planet(), startYear = gameState.year) {
        //run simu
        const naiveDistance = calcDistance(fleet.x, fleet.y, destination.x, destination.y)
        const naiveTravelTime = naiveDistance/fleet.calcSpeed()
        const {endX, endY, endYear, bestTime} = Route.estimateTravelTimeToOrbitingBody(startYear, fleet, destination, 100, naiveTravelTime*2+1)
        this.fleet = fleet
        this.destination = destination
        this.startYear = startYear
        this.endYear = endYear
        this.travelTime = bestTime
        this.path = new Path(fleet.x, fleet.y, endX, endY)
    }

    positionAtYear(year = 0) {
        if (year < this.startYear) return [this.path.startX, this.path.startY]
        if (year > this.endYear) return [this.path.endX, this.path.endY]
        const duration = this.endYear - this.startYear
        const elapsedTime = year - this.startYear
        const progressRatio = elapsedTime/duration
        const normalProgress = applyNormalCurve(progressRatio)
        return [this.path.startX + this.path.dx*normalProgress, this.path.startY + this.path.dy*normalProgress]
    }

    static estimateTravelTimeToOrbitingBody(
        startYear = 0,
        fleet = new Fleet(),
        planet = new Planet(),
        samples = 100,
        maxYears = 10
    ) {
        const results = [];
        const speed = fleet.calcSpeed()
        let bestYearOffset = Infinity;
        let endPosition;

        console.log('estimating travel time to an orbiting body:',startYear,fleet,planet,samples,maxYears)

        for (let i = 0; i < samples; i++) {
            const t = (i / samples) * maxYears; // future year offset

            // planet's position in AU
            const [px, py] = planet.calcAbsPositionAtYear(startYear + t);

            const dx = px - fleet.x;
            const dy = py - fleet.y;

            const dist = Math.sqrt(dx * dx + dy * dy);
            const travelTime = dist / speed;


            if (travelTime > t) {
                //dont consider this a valid route if fleet couldn't make it there in time
                continue
            }

            results.push([t, travelTime]);

            if (t < bestYearOffset) {
                bestYearOffset = t;
                endPosition = [px,py]
            }
        }

        if (!endPosition) throw new Error('couldnt find a valid route!')

        return {
            bestYearOffset,
            endPosition,
            endX: endPosition[0],
            endY: endPosition[1],
            endYear: startYear+bestYearOffset,
            debug: results
        };
    }
}

class Encounter {
    constructor(encounterType = ENCOUNTER_TYPES_ALL[0], planet = new Planet(), fleet = new Fleet()) {
        this.encounterType = encounterType;
        this.planet = planet;
        this.fleet = fleet;
        this.combatEnabled = false;
        this.mapDimensions = ENCOUNTER_MAP_RADIUS_MILES;
        this.time = 0;
    }

    applyPhysics(elapsedSeconds = 0) {
        const playerShips = gameState.fleet.ships
        const enemyShips = this.fleet.ships
        const ships = [...playerShips, ...enemyShips]
        for (const ship of ships) {
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

    makeShipsAct(elapsedSeconds = 0) {
        const playerFleet = gameState.fleet
        const playerShips = playerFleet.ships
        const enemyFleet = this.fleet
        const enemyShips = enemyFleet.ships
        const ships = [...playerShips, ...enemyShips]

        console.log('~~make ships act~~')

        for (const ship of ships) {
            console.log('making ship act:',ship)
            //const fleet = playerShips.includes(ship) ? playerFleet : enemyFleet
            const opposingFleet = playerShips.includes(ship) ? enemyFleet : playerFleet
            //assigning a combat strategy for ships in auto
            if (ship.autoCombat) {
                ship.combatStrategy = COMBAT_STRATEGIES.ATTACK_NEAREST
            }
            //choose a target
            if (ship.combatStrategy == COMBAT_STRATEGIES.ATTACK_NEAREST) {
                const target = this.calcNearestTarget(ship, opposingFleet.ships)
                ship.target = target
                ship.destinationX = target.x
                ship.destinationY = target.y
                console.log('set target for ship:',target)
            }
            const {x,y,destinationX,destinationY,angle} = ship //do not move to the top
            if (destinationX !== undefined && destinationY !== undefined) {
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

                ship.rechargeLaser(elapsedSeconds)
                if (false) {
                    console.log('close enough to the enemy, so holding still')
                    ship.rechargeShields(elapsedSeconds) //shields only recharge when not moving
                }
                else {
                    console.log('too far from enemy, so chasing:',elapsedSeconds,shouldDecel)
                    ship.accelerate(elapsedSeconds, shouldDecel)
                }
                ship.turn(elapsedSeconds, shouldTurnCounterClockwise)
            }
        }
    }



}

