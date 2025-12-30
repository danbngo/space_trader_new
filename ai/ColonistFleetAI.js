/**
 * AI for colonist fleets - travels to establish new colonies.
 * @class ColonistFleetAI
 * @extends FleetAI
 */
class ColonistFleetAI extends FleetAI {
    constructor(fleet = null, homePlanet = null, destinationPlanet = null) {
        super(fleet, homePlanet, destinationPlanet);
    }

    tick(elapsedYears = 0) {
        if (!this.fleet) return;
        
        this.moveTowardsDestination(elapsedYears);
        
        if (this.hasArrivedAtDestination()) {
            this.onArrival();
        }
    }

    onArrival() {
        // Colonists typically make a one-way trip, but for simulation they can return
        // Stay at destination for a while (30-60 days)
        
        // Eventually return home or pick another destination
        if (Math.random() < 0.5) {
            this.destination = this.homePlanet;
        } else {
            const planets = PLANETS.filter(p => p !== this.homePlanet && p !== this.destinationPlanet);
            if (planets.length > 0) {
                this.destinationPlanet = rndMember(planets);
                this.destination = this.destinationPlanet;
            }
        }
    }
}
