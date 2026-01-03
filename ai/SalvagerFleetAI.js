/**
 * AI for salvager fleets - travels around looking for debris and salvage opportunities.
 * @class SalvagerFleetAI
 * @extends FleetAI
 */
class SalvagerFleetAI extends FleetAI {
    calcDestination() {
        // Filter out Plasma belt asteroids (too dangerous)
        const validAsteroids = gs.system.asteroids.filter(a => {
            if (a.belt && a.belt.beltType === ASTEROID_BELT_TYPES.Plasma) return false;
            return true;
        });
        
        if (validAsteroids.length === 0) {
            // Fallback to planets if no valid asteroids
            return rndMember([...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.spaceStations].filter(p => p !== this.origin));
        }
        
        // Calculate weights based on distance (closer = higher weight)
        const weights = validAsteroids.map(a => {
            const distance = calcDistance(this.fleet.x, this.fleet.y, a.x, a.y);
            // Inverse distance weighting (closer asteroids more likely)
            return 1 / Math.max(0.1, distance);
        });
        
        const selectedIndex = rndIndexWeighted(weights);
        return selectedIndex >= 0 ? validAsteroids[selectedIndex] : rndMember(validAsteroids);
    }
    onDestroyed() {
        // Losing salvagers hurts resource recovery and industry
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.industry *= 0.99;
            this.fleet.planet.c.economy *= 0.99;
        }
        super.onDestroyed()
    }
}
