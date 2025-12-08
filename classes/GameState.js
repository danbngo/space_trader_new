class GameState {
    constructor(starSystem = new StarSystem()) {
        this.year = 3000;
        this.system = starSystem

        // Create captain
        this.captain = new Officer("Captain", 5000, 0, 0, 0, 0, 0, 0);
        const playerShip = new Ship("Starting Ship", new Graphics("triangle", "white", SPACE_SHIP_RADIUS_IN_MILES), SPACE_SHIP_RADIUS_IN_MILES, [25,25], [25,25], 5, 5, 5)

        // Create fleet
        this.fleet = new Fleet(
            "Player Fleet",
            new Graphics("triangle", "white", FLEET_RADIUS_IN_EARTH_RADII),
            0, 0,
            playerShip,
            [playerShip],
            new Cargo(),
            this.captain,
            [this.captain],
            EARTH,
        )

        this.fleet.captain = this.captain;
        this.fleet.officers = [this.captain];

        // Add player's fleet to system
        this.system.fleets = [this.fleet];

        // Initial planet setup
        this._initializePlanets();
        this.fleet.dock(EARTH);

        this.encounter = null//new Encounter() //dont need to serialize this, cant save during encounters
        const bgStars = generateBackgroundStars(SOLAR_SYSTEM_RADIUS_IN_AU, 1000)
        this.system.backgroundStars = bgStars
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

        // Restore fleet
        this.fleet = Object.assign(
            new Fleet("Player Fleet", new Graphics('triangle', 'white', FLEET_RADIUS_IN_EARTH_RADII), 0, 0, [], [], 0, null, EARTH, 0),
            data.fleet
        );

        this.fleet.captain = this.captain;
        this.fleet.officers = [this.captain];

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
