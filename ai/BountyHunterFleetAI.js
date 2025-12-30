/**
 * AI for bounty hunter fleets - hunts targets with bounties.
 * @class BountyHunterFleetAI
 * @extends FleetAI
 */
class BountyHunterFleetAI extends FleetAI {
    constructor(fleet = null, homePlanet = null, destinationPlanet = null) {
        super(fleet, homePlanet, destinationPlanet);
    }

    tick(elapsedYears = 0) {
        if (!this.fleet) return;
        
        // Look for criminal fleets within 12 AU
        const criminalFleets = (gs.system.fleets || []).filter(f => 
            f !== this.fleet && 
            (f.faction === FACTION_TYPES.PIRATES || 
             f.faction === FACTION_TYPES.SMUGGLERS ||
             f.faction === FACTION_TYPES.SLAVERS)
        );
        
        const nearestCriminal = this.findNearest(criminalFleets, 12);
        
        if (nearestCriminal) {
            this.target = nearestCriminal;
            this.destination = nearestCriminal;
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
        // Pick new patrol area (prefer high crime planets)
        const planets = PLANETS.filter(p => p !== this.homePlanet);
        if (planets.length > 0) {
            const weights = planets.map(p => Math.max(0.1, p.c.crime));
            const index = rndIndexWeighted(weights);
            this.destinationPlanet = planets[index];
            this.destination = this.destinationPlanet;
        }
    }
}
