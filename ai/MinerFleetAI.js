/**
 * AI for miner fleets - mines asteroids and returns home when cargo is full.
 * @class MinerFleetAI
 * @extends FleetAI
 */
class MinerFleetAI extends FleetAI {
    constructor(fleet = null, origin = null, starMap = null) {
        super(fleet, origin, starMap);
        /** @type {Asteroid[]} */
        this.visitedAsteroids = [];
    }
    calcValidTargets() {
        // Only target asteroids if we have cargo space
        if (this.fleet.availableCargoSpace <= 0) {
            return []
        }
        
        //introduce some fuzz so ship will move around
        // Filter out asteroids from Plasma belts (like Corona) - too dangerous to mine
        return gs.system.asteroids.filter(a => {
            if (calcDistance(this.fleet.x, this.fleet.y, a.x, a.y) <= 0.3) return false;
            if (a.belt && a.belt.asteroidBeltType === ASTEROID_BELT_TYPES.Plasma) return false;
            // Skip if already visited
            if (this.visitedAsteroids.includes(a)) return false;
            return true;
        })
    }
    calcDestination() {
        // If cargo is full, go to a planet to unload
        if (this.fleet.availableCargoSpace <= 0) {
            return rndMember([...gs.system.planets].filter(p => p !== this.origin));
        }
        
        // Filter out Plasma belt asteroids (too dangerous)
        const validAsteroids = gs.system.asteroids.filter(a => {
            if (a.belt && a.belt.asteroidBeltType === ASTEROID_BELT_TYPES.Plasma) return false;
            return true;
        });
        
        if (validAsteroids.length === 0) {
            // Fallback to planets if no valid asteroids
            return rndMember([...gs.system.planets].filter(p => p !== this.origin));
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
    
    onNearTarget() {
        // Mine cargo based on asteroid belt type
        if (this.target && this.target.parent && this.fleet.availableCargoSpace > 0) {
            // Mark asteroid as visited
            this.visitedAsteroids.push(this.target);
            
            const asteroidBeltType = this.target.belt.asteroidBeltType;
            const mineAmount = Math.min(rng(5, 2), this.fleet.availableCargoSpace);
            
            // Determine cargo type based on belt
            let cargoType;
            if (asteroidBeltType === ASTEROID_BELT_TYPES.Rocky) {
                cargoType = rndMember([CARGO_TYPES.METAL, CARGO_TYPES.ISOTOPES]);
            } else if (asteroidBeltType === ASTEROID_BELT_TYPES.Icy) {
                cargoType = rndMember([CARGO_TYPES.WATER, CARGO_TYPES.ISOTOPES]);
            } else if (asteroidBeltType === ASTEROID_BELT_TYPES.Plasma) {
                cargoType = CARGO_TYPES.ANTIMATTER;
            }
            
            if (cargoType) {
                this.fleet.cargo.increment(cargoType, mineAmount);
                console.log(`⛏️ ${this.fleet.name} mined ${mineAmount} ${cargoType.name}`);
                
                // Randomize asteroid orbit after mining
                if (this.target.orbit) {
                    this.target.orbit.progressOffset = Math.random();
                }
                
                // Show mining popup
                    this.addPopup('⛏️', COLORS.Orange)
            }
        }
    }
    
    onNearDestination() {
        // Sell all cargo at destination market for credits
        if (this.destination && this.destination instanceof Planet && this.fleet.cargo.total > 0) {
            // Boost industry specifically for miners
            if (this.destination.civilization) {
                this.destination.c.industry *= 1.01;
            }
            this.sellCargoAtMarket(this.destination);
        }
        
        super.onNearDestination()
    }
    
    onNearOrigin() {
        // Sell all cargo at origin market for credits
        if (this.origin && this.origin instanceof Planet && this.fleet.cargo.total > 0) {
            // Boost industry specifically for miners
            if (this.origin.civilization) {
                this.origin.c.industry *= 1.01;
            }
            this.sellCargoAtMarket(this.origin);
        }
        
        super.onNearOrigin()
    }
    onDestroyed(destroyedBy = null) {
        // Losing miners hurts industrial production
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.industry *= 0.98;
        }
        super.onDestroyed(destroyedBy)
    }
}
