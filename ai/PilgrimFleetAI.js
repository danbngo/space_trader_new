/**
 * AI for pilgrim fleets - travels to holy sites with the same state religion.
 * @class PilgrimFleetAI
 * @extends FleetAI
 */
class PilgrimFleetAI extends FleetAI {
    calcValidTargets() {
        return [];
    }
    
    calcDestination() {
        // 25% chance to travel to a random asteroid (meditation site)
        if (Math.random() < 0.25 && gs.system.asteroids.length > 0) {
            return rndMember(gs.system.asteroids);
        }
        
        // 10% chance to travel to a random waypoint in space (pilgrimage journey)
        if (Math.random() < 0.10) {
            const x = rng(gs.system.radius * 2) - gs.system.radius;
            const y = rng(gs.system.radius * 2) - gs.system.radius;
            return new Waypoint(x, y);
        }
        
        // Travel to planets with the same state religion as home planet
        if (!this.fleet.planet || !this.fleet.planet.civilization || !this.fleet.planet.civilization.stateReligion) {
            return rndMember([...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.spaceStations].filter(p => p !== this.origin));
        }
        
        const homeReligion = this.fleet.planet.civilization.stateReligion;
        const sameReligionPlanets = [...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.spaceStations].filter(p => 
            p !== this.fleet.planet && 
            p.civilization && 
            p.civilization.stateReligion === homeReligion
        );
        
        if (sameReligionPlanets.length > 0) {
            return rndMember(sameReligionPlanets);
        }
        
        // Fallback to any planet
        return rndMember([...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.spaceStations].filter(p => p !== this.origin));
    }

    onNearDestination() {
        if (!(this.fleet.planet instanceof Planet) || !(this.destination instanceof Planet)) {
            return super.onNearDestination()
        }
        
        // Calculate population transfer ratio (10% of origin's relative culture)
        const populationRatio = this.fleet.planet.c.culture / (this.fleet.planet.c.culture + this.destination.c.culture) * 0.1
        
        // Transfer religious values from origin to destination
        if (this.fleet.planet.c.religions && this.destination.c.religions) {
            for (const [religion, amount] of this.fleet.planet.c.religions.counts.entries()) {
                const transferAmount = amount * populationRatio
                this.destination.c.religions.increment(religion, transferAmount)
            }
            // Normalize to ensure total stays at 1
            this.destination.c.religions.normalize()
        }
        
        // Spread minor culture when passing through destinations (0.1% influence)
        if (this.destination instanceof Planet) {
            this.destination.addCulture(this.fleet.planet, 0.001);
            this.destination.c.wealth *= 1.01 //stimulate the local economy
        }

        super.onNearDestination()
    }
    onDestroyed() {
        // Losing pilgrims reduces religious devotion and culture
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.culture *= 0.99;
            this.fleet.planet.c.population *= 0.99;
        }
        super.onDestroyed()
    }
}
