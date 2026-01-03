/**
 * AI for soldier/military fleets - patrols territory and responds to threats.
 * @class SoldierFleetAI
 * @extends FleetAI
 */
class SoldierFleetAI extends FleetAI {
    constructor(fleet = null, origin = null, starMap = null) {
        super(fleet, origin, starMap);
        /** @type {Fleet[]} */
        this.visited = [];
    }
    
    calcValidTargets() {
        const ourScore = this.fleet.combatRating
        return gs.system.fleets.filter(f => {
            if (f === this.fleet) return false;
            if (f.location) return false;
            // Skip if already visited
            if (this.visited.includes(f)) return false;
            // Don't attack targets that are 2x stronger
            if (f.combatRating > ourScore * 2) return false;
            
            // Attack criminals who are also militant (pirates, slavers, rebels but not syndies or smugglers)
            if (f.factionType.criminal && f.factionType.militant) return true;
            
            // Attack fleets from planets we're at war with
            if (this.fleet.planet && this.fleet.planet.civilization && f.planet && f.planet.civilization) {
                if (Civilization.areAtWar(this.fleet.planet, f.planet)) return true;
            }
            
            return false;
        });
    }
    calcDestination() {
        // 75% chance to patrol a random asteroid (weighted toward closer ones)
        if (Math.random() < 0.75 && gs.system.asteroids.length > 0) {
            // Filter out Plasma belt asteroids (too dangerous)
            const validAsteroids = gs.system.asteroids.filter(a => {
                if (a.belt && a.belt.beltType === ASTEROID_BELT_TYPES.Plasma) return false;
                return true;
            });
            
            if (validAsteroids.length > 0) {
                // Calculate weights based on distance (closer = higher weight)
                const weights = validAsteroids.map(a => {
                    const distance = calcDistance(this.fleet.x, this.fleet.y, a.x, a.y);
                    // Inverse distance weighting (closer asteroids more likely)
                    return 1 / Math.max(0.1, distance);
                });
                
                const selectedIndex = rndIndexWeighted(weights);
                if (selectedIndex >= 0) {
                    return validAsteroids[selectedIndex];
                }
            }
        }
        
        // Fallback to planets
        return rndMember([...gs.system.planets].filter(p=>(p !== this.origin)))
    }
    onNearTarget() {
        if (this.target instanceof Fleet && !this.target.location) {
            // Mark as visited
            this.visited.push(this.target);
            
            if (Math.random() > 0.5) {
                this.fightTarget();
            }
        }
    }
    onDestroyed() {
        // Losing soldiers weakens military strength and defense
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.army *= 0.99;
            this.fleet.planet.c.navy *= 0.98;
            this.fleet.planet.c.prestige *= 0.99;
        }
        super.onDestroyed()
    }
}
