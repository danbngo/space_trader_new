// Fleet class extends SpaceObject

/**
 * Represents a fleet of ships in the game.
 * @class Fleet
 * @extends {SpaceObject}
 */
class Fleet extends SpaceObject {
    /**
     * @param {string} name - The name of the fleet.
     * @param {Planet} planet - The planet the fleet starts at.
     * @param {FleetType} fleetType - The type of fleet
     * @param {FactionType|null} factionType - The faction the fleet belongs to.
     * @param {number[]} color - The color of the fleet.
     * @param {number} x - The x-coordinate of the fleet's position.
     * @param {number} y - The y-coordinate of the fleet's position.
     */
    constructor(name = "Unnamed", planet = null, fleetType = FLEET_TYPES_ALL[0], factionType = null, color = COLORS.White, x = 0, y = 0) {
        super(name, OBJECT_TYPES.FLEET, color, FLEET_RADIUS, x, y);
        /** @type {Planet} */
        this.planet = planet;
        /** @type {FleetType} */
        this.fleetType = fleetType;
        /** @type {Ship} */
        this.flagship = null;
        /** @type {Ship[]} */
        this.ships = []
        /** @type {CountsMap} */
        this.cargo = new CountsMap();
        /** @type {Equipment[]} */
        this.equipment = [];
        /** @type {Officer} */
        this.captain = null;
        /** @type {Officer[]} */
        this.officers = []
        /** @type {Planet} */
        this.location = null;
        /** @type {Route} */
        this.route = null //could be Route class
        /** @type {FactionType|null} */
        this.factionType = factionType;
        /** @type {FleetAI} */
        this.fleetAI = null;
        /** @type {number} */
        this.angle = 0 //danmod this is temporary should get rid of it later
        /** @type {number} */
        this.cloakLevel = 0; // 0 = visible, 1.0 = fully cloaked
    }

    /**
     * Docks the fleet at a planet, setting location and stopping travel.
     * @param {Planet} planet - The planet to dock at.
     */
    dock(planet) {
        this.location = planet
        this.x = planet.x
        this.y = planet.y
        this.route = null
        planet.addChildren([this])
    }

    /**
     * Calculates the total credit share owed to officers.
     * @param {number} ofCR - The amount of credits to calculate share from.
     * @param {boolean} rounded - Whether to round the result.
     * @returns {number} The total share amount.
     */
    calcTotalCRShare(ofCR = 1, rounded = true) {
        if (this.officers.length == 0 || isNaN(ofCR) || !ofCR || ofCR < 0) return 0
        const shareRatio = this.officers.reduce((total, officer) => {
            return officer == this.captain ? 0 : total + officer.crShare
        }, 0)
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

    get totalLasers() {
        return this.ships.reduce((total, ship) => total + ship.lasers, 0);
    }

    get totalHull() {
        return this.ships.reduce((total, ship) => total + ship.hull[0], 0);
    }

    get totalSkills() {
        const totalSkills = new CountsMap();
        for (const skill of SKILLS_ALL) {
            for (const officer of this.officers) {
                totalSkills.increment(skill, officer.skills.getAmount(skill))
            }
        }
        return totalSkills
    }

    /**
     * Get all officers who are not currently piloting any ship
     * @returns {Officer[]} Array of unassigned officers
     */
    getUnassignedOfficers() {
        return [this.captain, ...this.officers].filter(officer => {
            return !this.ships.some(ship => ship.pilot === officer)
        })
    }

    /**
     * Get the ship that an officer is piloting
     * @param {Officer} officer - The officer to check
     * @returns {Ship|null} The ship being piloted or null
     */
    getAssignedShip(officer) {
        return this.ships.find(ship => ship.pilot === officer) || null
    }

    /**
     * Assign an officer to pilot a ship
     * @param {Ship} ship - The ship to assign
     * @param {Officer} officer - The officer to assign
     */
    assignPilot(ship, officer) {
        if (!this.ships.includes(ship)) {
            console.error('Cannot assign pilot to ship not in fleet', ship)
            return
        }
        if (officer && officer !== this.captain && !this.officers.includes(officer)) {
            console.error('Cannot assign officer not in fleet', officer)
            return
        }
        ship.pilot = officer
    }

    /**
     * Auto-assign unassigned officers to ships without pilots
     */
    autoAssignPilots() {
        const unassignedOfficers = this.getUnassignedOfficers()
        const unassignedShips = this.ships.filter(ship => !ship.pilot)
        
        // Always assign captain to flagship if it has no pilot
        if (this.flagship && !this.flagship.pilot) {
            this.flagship.pilot = this.captain
            const idx = unassignedOfficers.indexOf(this.captain)
            if (idx >= 0) unassignedOfficers.splice(idx, 1)
        }
        
        // Assign remaining officers to remaining ships
        for (let i = 0; i < Math.min(unassignedOfficers.length, unassignedShips.length); i++) {
            unassignedShips[i].pilot = unassignedOfficers[i]
        }
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

    /**
     * Adds a ship to the fleet.
     * @param {Ship} ship - The ship to add.
     */
    addShip(ship = new Ship()) {
        if (!this.flagship) this.flagship = ship
        this.ships.push(ship)
        ship.fleet = this
    }
    /**
     * Adds an officer to the fleet.
     * @param {Officer} officer - The officer to add.
     */
    addOfficer(officer = new Officer()) {
        if (!this.captain) this.captain = officer
        this.officers.push(officer)
        officer.fleet = this
    }

    get activeShips() {
        return this.ships.filter(s=>!s.disabled && !s.escaped)
    }
}