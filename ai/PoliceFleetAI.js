/**
 * AI for police fleets - patrols and chases pirates.
 * @class PoliceFleetAI
 * @extends FleetAI
 */
class PoliceFleetAI extends FleetAI {
    constructor(fleet = null, homePlanet = null, destinationPlanet = null) {
        super(fleet, homePlanet, destinationPlanet);
    }

    tick(elapsedYears = 0) {
        if (!this.fleet) return;
        
        // Look for pirate fleets within 10 AU
        const pirateFleets = (gs.system.fleets || []).filter(f => 
            f !== this.fleet && 
            (f.faction === FACTION_TYPES.PIRATES || f.faction === FACTION_TYPES.SLAVERS)
        );
        
        const nearestPirate = this.findNearest(pirateFleets, 10);
        
        if (nearestPirate) {
            this.target = nearestPirate;
            this.destination = nearestPirate;
        } else {
            this.target = null;
            this.destination = this.destinationPlanet;
        }
        
        this.moveTowardsDestination(elapsedYears);
        
        if (this.hasArrivedAtDestination() && !this.target) {
            this.onArrival();
        }
    }

    onArrival() {
        // Pick new patrol destination
        const planets = PLANETS.filter(p => p !== this.homePlanet);
        if (planets.length > 0) {
            this.destinationPlanet = rndMember(planets);
            this.destination = this.destinationPlanet;
        }
    }
}
