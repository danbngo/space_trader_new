// Fleet class extends SpaceObject
class Fleet extends SpaceObject {
    constructor(name = "Unnamed", color = COLORS.White, x = 0, y = 0) {
        super(name, color, FLEET_RADIUS, x, y);
        this.flagship = null;
        this.ships = []
        this.cargo = new CountsMap();
        this.captain = null;
        this.officers = []
        this.location = null;
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
        return rounded ? Math.round(share) : share
    }

    calcTotalCargoSpace() {
        return this.ships.reduce((total, ship) => total + ship.cargoSpace, 0);
    }

    calcAvailableCargoSpace() {
        return this.calcTotalCargoSpace() - this.cargo.total
    }

    calcTotalEngine() {
        return this.ships.reduce((total, ship) => total + ship.engine, 0);
    }

    //in AU per years
    calcSpeed() {
        //each engine makes your fleet go 1 AU per MINUTE if there was no weight
        const totalEngine = this.calcTotalEngine()
        let weight = 0
        for (const ship of this.ships) {
            weight += ship.mass
        }
        weight += this.cargo.total
        return 60 * 24 * 365 * totalEngine / weight
    }

    calcCombatRating() {
        return this.ships.reduce((total, ship) => total + ship.combatRating, 0);
    }
    
    isStranded() {
        return this.ships.filter(s=>(!s.isDisabled())).length <= 0
    }

    get numPilots() {
        return this.officers.length + this.captain ? 1 : 0
    }

    addShip(ship = new Ship()) {
        if (!this.flagship) this.flagship = ship
        this.ships.push(ship)
        ship.fleet = this
    }
    addOfficer(officer = new Officer()) {
        if (!this.captain) this.captain = officer
        this.officers.push(officer)
        officer.fleet = this
    }

    get activeShips() {
        return this.ships.filter(s=>!s.isDisabled() && !s.escaped)
    }
}