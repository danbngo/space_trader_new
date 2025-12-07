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
