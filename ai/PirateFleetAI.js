/**
 * AI for pirate fleets - hunts merchant ships and raids.
 * @class PirateFleetAI
 * @extends FleetAI
 */
class PirateFleetAI extends FleetAI {
    constructor(fleet = null, homePlanet = null, destinationPlanet = null) {
        super(fleet, homePlanet, destinationPlanet);
    }

    tick(elapsedYears = 0) {
        if (!this.fleet) return;
        
        // Look for merchant or tourist fleets within 15 AU
        const targets = (gs.system.fleets || []).filter(f => 
            f !== this.fleet && 
            (f.faction === FACTION_TYPES.MERCHANTS || 
             f.faction === FACTION_TYPES.TOURISTS ||
             f.faction === FACTION_TYPES.MINERS)
        );
        
        const nearestTarget = this.findNearest(targets, 15);
        
        if (nearestTarget) {
            this.target = nearestTarget;
            this.destination = nearestTarget;
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
        // Pick new hunting ground (prefer high economy planets)
        const planets = PLANETS.filter(p => p !== this.homePlanet);
        if (planets.length > 0) {
            const weights = planets.map(p => Math.max(0.1, p.c.economy));
            const index = rndIndexWeighted(weights);
            this.destinationPlanet = planets[index];
            this.destination = this.destinationPlanet;
        }
    }
}
