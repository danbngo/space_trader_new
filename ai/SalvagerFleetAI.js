/**
 * AI for salvager fleets - travels around looking for debris and salvage opportunities.
 * @class SalvagerFleetAI
 * @extends FleetAI
 */
class SalvagerFleetAI extends FleetAI {
    constructor(fleet = null, origin = null, starMap = null) {
        super(fleet, origin, starMap);
    }
    
    calcValidTargets() {
        // Only target abandoned fleets for salvage if we have cargo space
        if (this.fleet.availableCargoSpace <= 0) {
            return []
        }
        
        return gs.system.abandonedFleets.filter(f => {
            // Skip if already visited
            if (this.visited.includes(f)) return false
            // Target any abandoned fleet
            return true
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
        if (this.target instanceof AbandonedFleet) {
            // Mark as visited
            this.visited.push(this.target);
            
            // Salvage everything from abandoned fleet
            let itemsSalvaged = 0
            
            // Rescue crew using utility function
            if (this.target.officers.length > 0) {
                const crewCount = this.target.officers.length
                this.rescueCrew(this.target, '♻️', COLORS.Green)
                itemsSalvaged += crewCount
            }
            
            // Transfer cargo (respecting cargo limit)
            if (this.target.cargo && this.target.cargo.total > 0 && this.fleet.availableCargoSpace > 0) {
                const cargoTypes = [...this.target.cargo.counts.keys()]
                let transferred = 0
                for (const cargoType of cargoTypes) {
                    if (transferred >= this.fleet.availableCargoSpace) break
                    const amount = this.target.cargo.getAmount(cargoType)
                    const toTransfer = Math.min(amount, this.fleet.availableCargoSpace - transferred)
                    this.target.cargo.increment(cargoType, -toTransfer)
                    this.fleet.cargo.increment(cargoType, toTransfer)
                    transferred += toTransfer
                }
                itemsSalvaged += transferred
                console.log(`📦 ${this.fleet.name} salvaged ${transferred} cargo from ${this.target.name}`)
            }
            
            if (itemsSalvaged > 0) {
                this.addPopup('📦', COLORS.Gray, this.target.x, this.target.y)
            }
            console.log(`♻️ ${this.fleet.name} completely salvaged ${this.target.name}`)
            // Remove the abandoned fleet entirely
            gs.system.removeAbandonedFleet(this.target)
            
            this.target = null
            this.fleet.route = null
        }
    }
    
    onNearDestination() {
        // Sell all cargo at destination market for credits
        if (this.destination && this.destination instanceof Planet && this.fleet.cargo.total > 0) {
            this.sellCargoAtMarket(this.destination);
        }
        
        super.onNearDestination()
    }
    
    onDestroyed(destroyedBy = null) {
        // Losing salvagers hurts resource recovery and industry
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.industry *= 0.99;
            this.fleet.planet.c.economy *= 0.99;
        }
        super.onDestroyed(destroyedBy)
    }
}
