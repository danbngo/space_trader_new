// Fleet class extends SpaceObject

/**
 * Represents a fleet of ships in the game.
 * @class Fleet
 * @extends {SpaceObject}
 */
class Fleet extends SpaceObject {
    /**
     * @param {string} name - The name of the fleet.
     * @param {number[]} color - The color of the fleet.
     * @param {number} x - The x-coordinate of the fleet's position.
     * @param {number} y - The y-coordinate of the fleet's position.
     * @param {Planet} planet - The planet the fleet starts at.
     */
    constructor(name = "Unnamed", color = COLORS.White, x = 0, y = 0, planet = null) {
        super(name, color, FLEET_RADIUS, x, y);
        /** @type {Planet} */
        this.planet = planet;
        /** @type {Ship} */
        this.flagship = null;
        /** @type {Ship[]} */
        this.ships = []
        /** @type {CountsMap} */
        this.cargo = new CountsMap();
        /** @type {Officer} */
        this.captain = null;
        /** @type {Officer[]} */
        this.officers = []
        /** @type {Planet} */
        this.location = null;
        /** @type {Route} */
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
        if (this.officers.length == 0 || isNaN(ofCR) || !ofCR || ofCR < 0) return 0
        const shareRatio = this.officers.reduce((total, officer) => total + officer.crShare, 0)
        console.log('share ratio:',shareRatio,this.officers)
        const share = Math.min(1, shareRatio) * ofCR
        return rounded ? Math.round(share) : share
    }

    get totalCargoSpace() {
        return this.ships.reduce((total, ship) => total + ship.cargoSpace, 0);
    }

    get availableCargoSpace() {
        return this.totalCargoSpace - this.cargo.total
    }

    get totalEngine() {
        return this.ships.reduce((total, ship) => total + ship.engine, 0);
    }

    get totalSkills() {
        console.log('getting total skills',this)
        const totalSkills = new CountsMap();
        for (const skill of SKILLS_ALL) {
            console.log('checking skill:',skill)
            for (const officer of this.officers) {
                totalSkills.increment(skill, officer.skills.getAmount(skill))
                console.log('added officer skill:',officer.name,skill,officer.skills.getAmount(skill))
            }
        }
        console.log('returning total skills:',totalSkills.counts)
        return totalSkills
    }

    get totalMass() {
        return this.ships.reduce((total, ship) => total + ship.mass, 0);
    }

    //in AU per years
    get speed() {
        //each engine makes your fleet go 1 AU per MINUTE if there was no weight
        const weight = this.totalMass + this.cargo.total
        const baseSpeed = AVERAGE_FLEET_SPEED * this.totalEngine/AVERAGE_SHIP_ENGINE / weight
        const totalPilotSkill = this.totalSkills.getAmount(SKILLS.Pilot)
        const speed = baseSpeed * (1 + totalPilotSkill/50)
        return speed
    }

    get totalRadar() {
        return this.ships.reduce((total, ship) => total + ship.radars, 0);
    }

    get combatRating() {
        return this.ships.reduce((total, ship) => total + ship.combatRating, 0);
    }
    
    get stranded() {
        return this.ships.filter(s=>(!s.disabled)).length <= 0
    }

    get numPilots() {
        return this.officers.length + (this.captain !== undefined ? 1 : 0)
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
        return this.ships.filter(s=>!s.disabled && !s.escaped)
    }
}