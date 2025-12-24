class GameState {
    constructor(starSystem = new StarSystem()) {
        this.year = GAME_START_YEAR;
        this.system = starSystem

        // Create captain
        const captain = new Officer("Captain", STARTING_CREDITS);
        const playerShip = new Ship("Starting Ship", PSEUDO_SHIP_TYPES.STARTING_SHIP, COLORS.LightGray, [30,30], [20,20], 10, 10, 10, 10)
        
        // Give player all modules for testing
        playerShip.localModules = [
            SHIP_MODULE_TYPES.CLOAK,
            SHIP_MODULE_TYPES.MAGNETIZE,
            SHIP_MODULE_TYPES.WARHEAD,
            SHIP_MODULE_TYPES.EMP_PULSE,
            SHIP_MODULE_TYPES.BLINK,
            SHIP_MODULE_TYPES.BOOSTER,
            SHIP_MODULE_TYPES.SMOKE_BOMB,
            SHIP_MODULE_TYPES.SPEED_MODULE
        ]

        // Create fleet
        this.fleet = new Fleet(
            "Player Fleet",
            COLORS.LightGray,
            0, 0,
        )

        this.fleet.addShip(playerShip)
        this.fleet.addOfficer(captain)

        // Add player's fleet to system
        this.system.fleets = [this.fleet];

        // Initial planet setup
        this._initializePlanets();
        this.fleet.dock(rndMember(PLANETS));

        this.encounter = null//new Encounter() //dont need to serialize this, cant save during encounters
    }

    /** Internal helper to randomize guild/market/shipyard generation */
    _initializePlanets() {
        this.system.refreshPositions(this.year);
        for (const planet of PLANETS) {
            //dont modify order
            planet.culture = generateCulture(planet)
            planet.settlement = generateSettlement(planet)
        }
    }

    get captain() {
        return this.fleet.captain;
    }

    set captain(captain) {
        this.fleet.captain = captain
    }

    get credits() {
        return this.captain.credits;
    }
    set credits(amt) {
        this.captain.credits = amt
    }

    get loans() {
        return this.captain.loans
    }

    get location() {
        return this.fleet.location
    }

    /** Save to localStorage */
    save() {
        try {
            const data = JSON.stringify(this._serialize());
            localStorage.setItem("spaceGameState", data);
        } catch (e) {
            console.error("Failed to save game state:", e);
        }
    }

    /** Overwrite this instance with loaded data */
    load() {
        const raw = localStorage.getItem("spaceGameState");
        if (!raw) return;

        try {
            const data = JSON.parse(raw);
            this._deserialize(data);
        } catch (e) {
            console.error("Failed to parse saved game state:", e);
        }
    }

    /**
     * Convert complex classes into serializable objects
     * WITHOUT losing class type info.
     */
    _serialize() {
        return {
            year: this.year,
            captain: this.captain,
            fleet: this.fleet,
            system: this.system.name,          // save reference, not whole object
            location: this.fleet.location.name,
            destination: this.fleet.route?.destination ? this.fleet.route.destination.name : null,
        };
    }

    /**
     * Restore game state by rebuilding class instances
     */
    _deserialize(data) {
        this.year = data.year ?? 3000;

        // Restore captain
        this.captain = Object.assign(
            new Officer("Captain"),
            data.captain
        );

        // Helper function to restore CountsMap with planet keys
        const restoreCountsMapWithPlanetKeys = (serializedData) => {
            const countsMap = new CountsMap()
            if (!serializedData || !serializedData.counts) return countsMap
            
            // serializedData.counts is an object like {planetName: amount, ...}
            for (const [planetName, amount] of Object.entries(serializedData.counts)) {
                const planet = PLANETS.find(p => p.name === planetName)
                if (planet && amount > 0) {
                    countsMap.setAmount(planet, amount)
                }
            }
            return countsMap
        }

        // Restore CountsMap instances for captain (with planet keys)
        this.captain.bounty = restoreCountsMapWithPlanetKeys(data.captain.bounty)
        this.captain.fame = restoreCountsMapWithPlanetKeys(data.captain.fame)
        this.captain.infamy = restoreCountsMapWithPlanetKeys(data.captain.infamy)
        
        // Restore skills CountsMap (keys are skill constants, not planets)
        if (data.captain.skills && data.captain.skills.counts) {
            this.captain.skills = new CountsMap()
            for (const [skillName, amount] of Object.entries(data.captain.skills.counts)) {
                // Find the skill constant by name
                const skill = Object.values(SKILLS).find(s => s.name === skillName)
                if (skill && amount > 0) {
                    this.captain.skills.setAmount(skill, amount)
                }
            }
        }

        // Restore loans with planet references
        if (data.captain.loans && Array.isArray(data.captain.loans)) {
            this.captain.loans = data.captain.loans.map(loanData => {
                const loan = Object.assign(new BankLoan(), loanData)
                // Restore planet reference
                if (loanData.planet && typeof loanData.planet === 'string') {
                    loan.planet = PLANETS.find(p => p.name === loanData.planet) || null
                } else if (loanData.planet && loanData.planet.name) {
                    loan.planet = PLANETS.find(p => p.name === loanData.planet.name) || null
                }
                return loan
            })
        }

        // Restore fleet
        this.fleet = Object.assign(
            new Fleet("Player Fleet", COLORS.LightGray, 0, 0),
            data.fleet
        );

        this.fleet.captain = this.captain;
        this.fleet.officers = [];

        // Restore system reference
        this.system = new StarSystem();

        // Restore location/destination
        const locName = data.location;
        const destName = data.destination;

        this.fleet.location = PLANETS.find(p => p.name === locName) || EARTH;
        this.fleet.route.destination = PLANETS.find(p => p.name === destName) || null;

        // Recalculate positions
        this.system.refreshPositions(this.year);
    }
}
