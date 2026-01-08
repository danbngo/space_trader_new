// Fleet class extends SpaceObject

/**
 * Represents a fleet of ships in the game.
 * @class Fleet
 * @extends {SpaceObject}
 */
class Fleet extends SpaceObject {
    static numFleetsEver = 0; // Total number of fleets ever created
    
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
        Fleet.numFleetsEver++; // Increment global fleet counter
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
        /** @type {CyberImplant[]} */
        this.cyberModules = [];
        /** @type {Officer} */
        this.captain = null;
        /** @type {Officer[]} */
        this.officers = []
        /** @type {Planet} */
        this.location = null;
        /** @type {FactionType|null} */
        this.factionType = factionType;
        /** @type {FleetAI} */
        this.fleetAI = null;
        /** @type {number} */
        this.angle = 0
        /** @type {number} */
        this.cloakLevel = 0; // 0 = visible, 1.0 = fully cloaked
        /** @type {Fleet|null} */
        this.escortTarget = null; // Fleet that this fleet is escorting/following
        /** @type {Fleet|Asteroid|Anomaly|string|null} */
        this.destroyedBy = null; // Track what destroyed this fleet
        /** @type {boolean} */
        this.destroyed = false; // Whether this fleet is destroyed/abandoned
        /** @type {number|null} */
        this.abandonedYear = null; // Year when fleet was destroyed
        /** @type {string|null} */
        this.originalName = null; // Original name before being abandoned
        /** @type {Orbit|null} */
        this.orbit = null; // Orbital path for abandoned fleets (spiraling into sun)
        
        // Temporary properties used during deserialization (SaveManager)
        /** @type {string} */
        this._planetUUID = undefined;
        /** @type {string} */
        this._locationUUID = undefined;
        /** @type {string} */
        this._fleetTypeName = undefined;
        /** @type {string} */
        this._factionTypeName = undefined;
        /** @type {string} */
        this._flagshipUUID = undefined;
        /** @type {string} */
        this._captainUUID = undefined;
        /** @type {string} */
        this._destroyedBy = undefined;
        /** @type {Object} */
        this._routeData = undefined;
        /** @type {Object} */
        this._fleetAIData = undefined;
        
        gameRegistry.registerFleet(this)

        /** @type {number} */
        this.fuel = 0;
        console.log('set fleet fuel to:',this.fuel,'for fleet:',this.name)
    }

    /**
     * Docks the fleet at a planet, setting location and stopping travel.
     * @param {Planet} planet - The planet to dock at.
     */
    dock(planet) {
        console.log(`🚢 ${this.name} ${this.uuid} is docking at ${planet.name} ${planet.uuid}`);
        this.location = planet
        this.x = planet.x
        this.y = planet.y
        this.route = null
        planet.addChildren([this])
        
        // If this is the player's fleet, memorize the settlement and visit date
        if (this === gs.fleet && planet.settlement) {
            gs.memorizedSettlements.set(planet, planet.settlement.clone())
            gs.lastVisitedDates.set(planet, gs.year)
            console.log(`📝 Memorized settlement at ${planet.name} (year ${gs.year})`)
            
            // Track planet visits for missions
            for (const mission of gs.missions) {
                mission.onPlayerVisitLocation(planet)
            }
        }
    }

    /** @param {Route} route */
    startRoute(route) {
        console.log(`🚢 ${this.name} ${this.uuid} is starting route to ${route.destination.name}`)
        this.location = null
        this.route = route
    };

    get subordinates() {
        return this.officers.filter(officer => officer !== this.captain);
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

    get mapViewDistance() {
        return 0.5 + STAR_MAP_AVERAGE_VIEW_DISTANCE * (this.totalRadar)/AVERAGE_SHIP_RADARS
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

    get totalFuelCapacity() {
        return this.ships.reduce((total, ship) => total + ship.fuelCapacity, 0);
    }

    get totalSkills() {
        const totalSkills = new CountsMap();
        for (const skill of SKILLS_ALL) {
            for (const officer of this.officers) {
                totalSkills.increment(skill, officer.skills.getAmount(skill))
                totalSkills.increment(skill, officer.bonusSkills.getAmount(skill))
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
        const weight = this.totalMass
        const baseSpeed = this.totalEngine/AVERAGE_SHIP_ENGINE / weight
        const totalPilotSkill = this.totalSkills.getAmount(SKILLS.Pilot)
        const speed = Math.sqrt(baseSpeed* AVERAGE_FLEET_SPEED) * (1 + totalPilotSkill/50) 
        return speed
        //fleets are a lil too fast, slow ones are a lil too slow
    }

    get totalRadar() {
        return this.ships.reduce((total, ship) => total + ship.radars, 0);
    }

    get combatRating() {
        return this.ships.reduce((total, ship) => total + ship.combatRating, 0);
    }
    
    /**
     * Checks if this fleet is in position to backstab/sneak attack an enemy fleet.
     * @param {Fleet} enemyFleet - The enemy fleet to check against.
     * @returns {boolean} True if this fleet can backstab the enemy.
     */
    isBackstabbing(enemyFleet) {
        // Calculate angle from this fleet to enemy fleet
        const angleToEnemy = calcAngleTowardsPoint(this.x, this.y, enemyFleet.x, enemyFleet.y)
        
        // Check if this fleet is facing toward enemy (within ~90 degrees)
        const angleDiff = Math.abs(normalizeAngle(this.angle - angleToEnemy))
        const facingEnemy = angleDiff < Math.PI / 2
        
        // Check if this fleet is behind enemy (within ~90 degrees of enemy's back)
        const angleEnemyToThis = calcAngleTowardsPoint(enemyFleet.x, enemyFleet.y, this.x, this.y)
        const enemyBackAngle = normalizeAngle(enemyFleet.angle + Math.PI) // Enemy's back is 180 degrees from facing
        const relativeToEnemyBack = Math.abs(normalizeAngle(angleEnemyToThis - enemyBackAngle))
        const behindEnemy = relativeToEnemyBack < Math.PI / 2
        
        // Check stealth/radar advantage
        const stealthAdvantage = this.totalRadar * (1 + this.totalSkills.getAmount(SKILLS.Stealth) / 50) > enemyFleet.totalRadar
        
        return facingEnemy && behindEnemy && stealthAdvantage
    }
    
    get stranded() {
        return this.ships.filter(s=>(!s.disabled)).length <= 0 || this.fuel <= 0
    }

    get numPilots() {
        return this.officers.length + (this.captain !== undefined ? 1 : 0)
    }

    /**
     * Adds a ship to the fleet.
     * @param {Ship} ship - The ship to add.
     */
    addShip(ship ) {
        if (!this.flagship) this.flagship = ship
        this.ships.push(ship)
        ship.fleet = this
    }
    /**
     * Adds an officer to the fleet.
     * @param {Officer} officer - The officer to add.
     */
    addOfficer(officer) {
        if (!officer) throw new Error('tried to add null officer!')
        if (!this.captain) this.captain = officer
        this.officers.push(officer)
        officer.fleet = this
    }

    removeOfficer(officer) {
        //assign a new captain if needed
        if (officer === this.captain) {
            const newCaptain = this.officers.find(o => o !== officer);
            this.captain = newCaptain || null;
        }
        const index = this.officers.indexOf(officer);
        if (index !== -1) {
            this.officers.splice(index, 1);
            officer.fleet = null;
        }
    }

    /**
     * Find all officers matching a given condition
     * @param {(officer: Officer) => boolean} callback - Function that returns true for matching officers
     * @returns {Officer[]} Array of officers matching the condition
     */
    findOfficersMatching(callback) {
        return this.officers.filter(callback);
    }

    /**
     * Calculate price multiplier when trading with another fleet based on barter skill comparison.
     * Uses 50-point intervals: if their barter is 50 and ours is 1, they get 2x advantage.
     * @param {Fleet} otherFleet - The other fleet to compare barter skills with.
     * @param {boolean} isBuying - True if this fleet is buying, false if selling.
     * @returns {number} Price multiplier (1.0 = base price, >1.0 = worse deal, <1.0 = better deal).
     */
    calcBarterPriceMultiplier(otherFleet, isBuying) {
        const myBarter = this.totalSkills.getAmount(SKILLS.Barter) || 0;
        const theirBarter = otherFleet.totalSkills.getAmount(SKILLS.Barter) || 0;
        
        // Calculate ratio based on 50-point intervals
        // (1 + theirBarter/50) / (1 + myBarter/50)
        const skillRatio = (1 + theirBarter / 50) / (1 + myBarter / 50);
        
        if (isBuying) {
            // When buying: higher ratio = higher price (worse for us)
            return skillRatio;
        } else {
            // When selling: higher ratio = lower price (worse for us)
            return 1.0 / skillRatio;
        }
    }

    get activeShips() {
        return this.ships.filter(s=>!s.disabled && !s.escaped)
    }
}