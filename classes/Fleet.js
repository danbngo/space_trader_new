// Fleet class extends SpaceObject
class Fleet extends SpaceObject {
    constructor(name = "Unnamed", color = '#ccc', x = 0, y = 0, flagship = new Ship(), ships = [new Ship()], cargo = new CountsMap(), captain = new Officer(), officers = [new Officer()], location = null) {
        super(name, color, 0, x, y);
        this.flagship = flagship;
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
        this.route = null
        planet.addChildren([this])
    }

    calcTotalCRShare(ofCR = 1, rounded = true) {
        if (this.officers.length == 0) return 0
        const shareRatio = this.officers.reduce((total, officer) => total + officer.crShare, 0)
        console.log('share ratio:',shareRatio,this.officers)
        const share = Math.min(1, shareRatio) * ofCR
        return rounded ? round(share) : share
    }

    calcTotalCargoSpace() {
        return this.ships.reduce((total, ship) => total + ship.cargoSpace, 0);
    }

    calcAvailableCargoSpace() {
        return this.calcTotalCargoSpace() - this.cargo.total
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
        weight += this.cargo.total
        return 60 * 24 * 365 * totalThrusters / weight
    }
    
    isStranded() {
        return this.ships.filter(s=>(!s.isDisabled())).length <= 0
    }

    get numPilots() {
        return this.officers.length + this.captain ? 1 : 0
    }
}