

class Graphics {
    constructor(shape = "Circle", color = "White", size = 1) {
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
    constructor(name = "Unnamed", hull = [0, 0], shields = [0, 0], lasers = 0, thrusters = 0, cargoSpace = 0) {
        this.name = name;
        this.hull = hull;
        this.shields = shields;
        this.lasers = lasers;
        this.thrusters = thrusters;
        this.cargoSpace = cargoSpace;
    }

    get value() {
        return Math.pow(this.hull[1]/5 + this.shields[1]/5 + this.lasers + this.thrusters + this.cargoSpace, 2)*10
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
    constructor(ships = [], credits = 0, priceModifier = 0, rake = 0) {
        this.ships = ships; // Ship[]
        this.credits = credits;
        this.priceModifier = priceModifier
        this.rake = rake
    }
    calcBuyPrice(ship = new Ship()) {
        return Math.round(ship.value * this.priceModifier / (1+this.rake))
    }
    calcSellPrice(ship = new Ship()) {
        return Math.round(ship.value * this.priceModifier * (1+this.rake))
    }
}

// Guild class
class Guild {
    constructor(officers = [], priceModifier = 0, rake = 0) {
        this.officers = officers; // Officer[]
        this.priceModifier = priceModifier
        this.rake = rake
    }
}

// Market class
class Market {
    constructor(cargo = [], credits = 0,  cargoPriceModifiers = new Cargo(), rake = 0) {
        this.cargo = cargo; // Cargo[]
        this.credits = credits;
        this.cargoPriceModifiers = cargoPriceModifiers
        this.rake = rake
    }

    calcCargoBuyPrices() {
        const prices = new Cargo()
        for (const cargoType of CARGO_TYPES_ALL) {
            const price = Math.round(cargoType.value * this.cargoPriceModifiers.getAmount(cargoType) / (1+this.rake))
            prices.setAmount(cargoType, price)
        }
        return prices
    }

    calcCargoSellPrices() {
        const prices = new Cargo()
        for (const cargoType of CARGO_TYPES_ALL) {
            const price = Math.round(cargoType.value * this.cargoPriceModifiers.getAmount(cargoType) * (1+this.rake))
            prices.setAmount(cargoType, price)
        }
        return prices
    }

}

// Planet class extends SpaceObject
class Planet extends OrbitingObject {
    constructor(name = "Unnamed", graphics = new Graphics(), radius = 0, x = 0, y = 0, orbit = null, shipyard = null, market = null, blackMarket = null, guild = null) {
        super(name, graphics, radius, x, y, orbit);
        this.shipyard = shipyard;
        this.market = market;
        this.blackMarket = blackMarket;
        this.guild = guild;
    }
}

// Fleet class extends SpaceObject
class Fleet extends SpaceObject {
    constructor(name = "Unnamed", graphics = new Graphics(), x = 0, y = 0, ships = [], cargo = new Cargo(), captain = null, officers = [], location = null) {
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
    constructor(name = "Unnamed", graphics = new Graphics(), radius = 0, x = 0, y = 0, barycenter = null, stars = [], planets = [], fleets = []) {
        super(name, graphics, radius, x, y)
        this.barycenter = barycenter
        this.stars = stars
        this.planets = planets
        this.fleets = fleets
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
            if (!fleet.route) continue
            //if route not started yet, do nothing
            if (year <= fleet.route.startYear) continue
            //check if route completed, if so arrive at destination and dock
            if (year >= fleet.route.endYear) {
                fleet.location = route.destination
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

class Route {
    constructor(fleet = new Fleet(), destination = new Planet(), startYear = gameState.year) {
        //run simu
        const naiveDistance = calcDistance(fleet.x, fleet.y, destination.x, destination.y)
        const naiveTravelTime = naiveDistance/fleet.calcSpeed()
        const {endX, endY, endYear, bestTime} = Route.estimateTravelTimeToOrbitingBody(startYear, fleet, destination, 100, naiveTravelTime*2+1)

        this.fleet = fleet
        this.destination = destination
        this.startYear = startYear
        this.startX = fleet.x
        this.startY = fleet.y
        this.endX = endX
        this.endY = endY
        this.endYear = endYear
        this.travelTime = bestTime

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
        this.angleDeg = this.angle * (180 / Math.PI); // convert to degrees
        //if (this.angleDeg < 0) this.angleDeg += 360

        console.log('created route:',this.angleDeg,this)
    }

    positionAtYear(year = 0) {
        if (year < this.startYear) return [this.startX, this.startY]
        if (year > this.endYear) return [this.endX, this.endY]
        const duration = this.endYear - this.startYear
        const elapsedTime = year - this.startYear
        const progressRatio = elapsedTime/duration
        return [this.startX + this.dx*progressRatio, this.startY + this.dy*progressRatio]
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

