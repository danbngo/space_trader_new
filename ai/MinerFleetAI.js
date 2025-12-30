/**
 * AI for miner fleets - mines asteroids and returns home when cargo is full.
 * @class MinerFleetAI
 * @extends FleetAI
 */
class MinerFleetAI extends FleetAI {
    constructor(fleet = null, homePlanet = null, destinationPlanet = null) {
        super(fleet, homePlanet, destinationPlanet);
        /** @type {boolean} */
        this.returningHome = false;
        /** @type {number} */
        this.miningTimer = 0;
    }

    tick(elapsedYears = 0) {
        if (!this.fleet) return;
        
        // If cargo full, return home
        if (this.fleet.availableCargoSpace <= 0 && !this.returningHome) {
            this.returningHome = true;
            this.destination = this.homePlanet;
            this.target = null;
        }
        
        // If at home with cargo, unload and pick new asteroid
        if (this.returningHome && this.hasArrivedAtDestination()) {
            this.onArrival();
            return;
        }
        
        // If near asteroid, mine it
        if (this.target && !this.returningHome) {
            const dx = this.target.x - this.fleet.x;
            const dy = this.target.y - this.fleet.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 0.05) { // Within mining range
                this.mineAsteroid(elapsedYears);
                return;
            }
        }
        
        // Otherwise move towards destination
        this.moveTowardsDestination(elapsedYears);
    }

    mineAsteroid(elapsedYears = 0) {
        if (!this.fleet || !this.target || this.fleet.availableCargoSpace <= 0) return;
        
        this.miningTimer += elapsedYears;
        
        // Mine roughly 1 unit per day (1/365 years)
        if (this.miningTimer >= 1/365) {
            this.miningTimer = 0;
            
            // Determine what to mine based on belt type
            const belt = this.target.belt;
            const cargoType = belt ? rndMember(belt.encounterTypes[0].fleetType.cargoTypes) : CARGO_TYPES.METAL;
            
            this.fleet.cargo.increment(cargoType, 1);
        }
    }

    onArrival() {
        if (this.returningHome) {
            // Unload cargo
            this.fleet.cargo = new CountsMap();
            this.returningHome = false;
            
            // Pick new asteroid to mine
            this.selectNewAsteroid();
        }
    }

    selectNewAsteroid() {
        if (!this.fleet) return;
        
        const asteroids = gs.system.asteroids || [];
        if (asteroids.length === 0) return;
        
        // Weight asteroids by inverse distance (closer = higher weight)
        const weights = asteroids.map(ast => {
            const dx = ast.x - this.fleet.x;
            const dy = ast.y - this.fleet.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            return 1 / (dist + 0.1); // +0.1 to avoid division by zero
        });
        
        const index = rndIndexWeighted(weights);
        this.target = asteroids[index];
        this.destination = this.target;
    }
}
