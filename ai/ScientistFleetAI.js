/**
 * AI for scientist fleets - travels between planets for research expeditions.
 * @class ScientistFleetAI
 * @extends FleetAI
 */
class ScientistFleetAI extends FleetAI {
    constructor(fleet = null, homePlanet = null, destinationPlanet = null) {
        super(fleet, homePlanet, destinationPlanet);
        /** @type {number} */
        this.researchTimer = 0;
    }

    tick(elapsedYears = 0) {
        if (!this.fleet) return;
        
        this.moveTowardsDestination(elapsedYears);
        
        if (this.hasArrivedAtDestination()) {
            this.onArrival();
        }
    }

    onArrival() {
        // Stay at planet for research (simulate expeditions/surveys)
        this.researchTimer = rng(14, 5) / 365; // 5-14 days
        
        // Pick new destination
        const planets = PLANETS.filter(p => p !== this.homePlanet && p !== this.destinationPlanet);
        if (planets.length > 0) {
            // Prefer planets with high technology and education
            const weights = planets.map(p => Math.max(0.1, p.c.technology + p.c.education));
            const index = rndIndexWeighted(weights);
            this.destinationPlanet = planets[index];
            this.destination = this.destinationPlanet;
        }
    }
}
