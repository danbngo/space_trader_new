/**
 * AI for tourist fleets - travels to scenic locations.
 * @class TouristFleetAI
 * @extends FleetAI
 */
class TouristFleetAI extends FleetAI {
    constructor(fleet = null, homePlanet = null, destinationPlanet = null) {
        super(fleet, homePlanet, destinationPlanet);
        /** @type {number} */
        this.visitTimer = 0;
    }

    tick(elapsedYears = 0) {
        if (!this.fleet) return;
        
        this.moveTowardsDestination(elapsedYears);
        
        if (this.hasArrivedAtDestination()) {
            this.onArrival();
        }
    }

    onArrival() {
        // Stay for tourism (3-10 days)
        this.visitTimer = rng(10, 3) / 365;
        
        // Pick new scenic destination
        const planets = PLANETS.filter(p => p !== this.homePlanet && p !== this.destinationPlanet);
        if (planets.length > 0) {
            // Prefer planets with high culture and prestige
            const weights = planets.map(p => Math.max(0.1, p.c.culture + p.c.prestige));
            const index = rndIndexWeighted(weights);
            this.destinationPlanet = planets[index];
            this.destination = this.destinationPlanet;
        }
    }
}
