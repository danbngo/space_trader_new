/**
 * AI for smuggler fleets - travels discreetly between planets, avoids police.
 * @class SmugglerFleetAI
 * @extends FleetAI
 */
class SmugglerFleetAI extends FleetAI {
    constructor(fleet = null, homePlanet = null, destinationPlanet = null) {
        super(fleet, homePlanet, destinationPlanet);
    }

    tick(elapsedYears = 0) {
        if (!this.fleet) return;
        
        // Check for police nearby and evade
        const policeFleets = (gs.system.fleets || []).filter(f => 
            f !== this.fleet && f.faction === FACTION_TYPES.POLICE
        );
        
        const nearestPolice = this.findNearest(policeFleets, 5);
        
        if (nearestPolice) {
            // Run away from police
            const dx = this.fleet.x - nearestPolice.x;
            const dy = this.fleet.y - nearestPolice.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 0) {
                const speed = this.fleet.speed * elapsedYears;
                this.fleet.x += (dx / dist) * speed;
                this.fleet.y += (dy / dist) * speed;
            }
        } else {
            this.moveTowardsDestination(elapsedYears);
            
            if (this.hasArrivedAtDestination()) {
                this.onArrival();
            }
        }
    }

    onArrival() {
        // Pick new destination (prefer high crime planets)
        const planets = PLANETS.filter(p => p !== this.homePlanet && p !== this.destinationPlanet);
        if (planets.length > 0) {
            const weights = planets.map(p => Math.max(0.1, p.c.crime + p.c.corruption));
            const index = rndIndexWeighted(weights);
            this.destinationPlanet = planets[index];
            this.destination = this.destinationPlanet;
        }
    }
}
