/**
 * AI for soldier/military fleets - patrols territory and responds to threats.
 * @class SoldierFleetAI
 * @extends FleetAI
 */
class SoldierFleetAI extends FleetAI {
    constructor(fleet = null, homePlanet = null, destinationPlanet = null) {
        super(fleet, homePlanet, destinationPlanet);
        /** @type {number} */
        this.patrolTimer = 0;
    }

    tick(elapsedYears = 0) {
        if (!this.fleet) return;
        
        this.moveTowardsDestination(elapsedYears);
        
        if (this.hasArrivedAtDestination()) {
            this.onArrival();
        }
    }

    onArrival() {
        // Patrol for a bit
        this.patrolTimer = rng(14, 7) / 365; // 7-14 days
        
        // Pick allied or neutral planet to patrol
        const planets = PLANETS.filter(p => {
            Civilization.areAlliesOrNeutral(p, this.homePlanet);
        });
        
        if (planets.length > 0) {
            this.destinationPlanet = rndMember(planets);
            this.destination = this.destinationPlanet;
        } else {
            this.destination = this.homePlanet;
        }
    }
}
