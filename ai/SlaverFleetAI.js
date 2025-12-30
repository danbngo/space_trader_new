/**
 * AI for slaver fleets - hunts vulnerable ships to capture crews.
 * @class SlaverFleetAI
 * @extends FleetAI
 */
class SlaverFleetAI extends FleetAI {
    constructor(fleet = null, homePlanet = null, destinationPlanet = null) {
        super(fleet, homePlanet, destinationPlanet);
    }

    tick(elapsedYears = 0) {
        if (!this.fleet) return;
        
        // Look for vulnerable fleets within 12 AU
        const targets = (gs.system.fleets || []).filter(f => 
            f !== this.fleet && 
            (f.faction === FACTION_TYPES.TOURISTS || 
             f.faction === FACTION_TYPES.COLONISTS ||
             f.faction === FACTION_TYPES.MERCHANTS)
        );
        
        const nearestTarget = this.findNearest(targets, 12);
        
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
        // Pick new hunting ground
        const planets = PLANETS.filter(p => p !== this.homePlanet);
        if (planets.length > 0) {
            const weights = planets.map(p => Math.max(0.1, p.c.population));
            const index = rndIndexWeighted(weights);
            this.destinationPlanet = planets[index];
            this.destination = this.destinationPlanet;
        }
    }
}
