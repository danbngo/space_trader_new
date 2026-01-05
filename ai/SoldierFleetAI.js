/**
 * AI for soldier/military fleets - patrols territory and responds to threats.
 * @class SoldierFleetAI
 * @extends FleetAI
 */
class SoldierFleetAI extends FleetAI {
    constructor(fleet = null, origin = null, starMap = null) {
        super(fleet, origin, starMap);
    }
    
    calcValidTargets() {
        const ourScore = this.fleet.combatRating
        const hostileFleets = gs.system.fleets.filter(f => {
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
        
        // Also rescue crew from abandoned fleets from own planet or allied planets
        const abandonedRescues = gs.system.abandonedFleets.filter(f => {
            // Skip if already visited
            if (this.visited.includes(f)) return false;
            // Only target abandoned fleets that still have crew
            if (f.officers.length === 0) return false;
            // Only rescue from own planet or allied planets
            if (this.fleet.planet && this.fleet.planet.civilization && f.planet && f.planet.civilization) {
                return (f.planet === this.fleet.planet) || Civilization.areAllies(this.fleet.planet, f.planet);
            }
            return false;
        });
        
        return [...hostileFleets, ...abandonedRescues];
    }
    calcDestination() {
        // 75% chance to patrol a random asteroid (weighted toward closer ones)
        if (Math.random() < 0.75 && gs.system.asteroids.length > 0) {
            // Filter out Plasma belt asteroids (too dangerous)
            const validAsteroids = gs.system.asteroids.filter(a => {
                if (a.belt && a.belt.asteroidBeltType === ASTEROID_BELT_TYPES.Plasma) return false;
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
            
            // Check if target is abandoned
            if (this.target.destroyed) {
                // Rescue crew from abandoned fleet
                this.rescueCrew(this.target);
                this.target = null
                this.fleet.route = null
            } else {
                // Don't automatically interact with player fleet - they get an encounter instead
                if (this.target === gs.fleet) {
                    this.target = null;
                    this.fleet.route = null;
                    return;
                }
                
                if (Math.random() > 0.5) {
                    this.fightTarget(true);
                }
            }
        }
    }
    onDestroyed(destroyedBy = null) {
        // Losing soldiers weakens military strength and defense
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.army *= 0.99;
            this.fleet.planet.c.navy *= 0.98;
            this.fleet.planet.c.prestige *= 0.99;
        }
        super.onDestroyed(destroyedBy)
    }
}
