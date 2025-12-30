/**
 * AI for merchant fleets - travels between planets to trade.
 * @class MerchantFleetAI
 * @extends FleetAI
 */
class MerchantFleetAI extends FleetAI {
    constructor(fleet = null, homePlanet = null, destinationPlanet = null) {
        super(fleet, homePlanet, destinationPlanet);
        /** @type {number} */
        this.tradeTimer = 0;
    }

    tick(elapsedYears = 0) {
        if (!this.fleet) return;
        
        this.moveTowardsDestination(elapsedYears);
        
        if (this.hasArrivedAtDestination()) {
            this.onArrival();
        }
    }

    onArrival() {
        // Stay at planet for a bit (simulate trading)
        this.tradeTimer = rng(7, 3) / 365; // 3-7 days
        
        // Pick new destination
        const planets = PLANETS.filter(p => p !== this.homePlanet && p !== this.destinationPlanet);
        if (planets.length > 0) {
            // Prefer planets with high economy
            const weights = planets.map(p => Math.max(0.1, p.c.economy));
            const index = rndIndexWeighted(weights);
            this.destinationPlanet = planets[index];
            this.destination = this.destinationPlanet;
        }
    }
}
