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
        //introduce some fuzz so ship will move around
        // Filter out asteroids from Plasma belts (like Corona) - too dangerous to mine
        return gs.system.asteroids.filter(a => {
            if (calcDistance(this.fleet.x, this.fleet.y, a.x, a.y) <= 0.3) return false;
            if (a.belt && a.belt.beltType === ASTEROID_BELT_TYPES.Plasma) return false;
            // Skip if already visited
            if (this.visitedAsteroids.includes(a)) return false;
            return true;
        })
    }
    calcDestination() {
        return rndMember([...gs.system.planets].filter(p=>(p !== this.origin)))
    }
    
    onNearTarget() {
        // Mine cargo based on asteroid belt type
        if (this.target && this.target.parent && this.fleet.availableCargoSpace > 0) {
            // Mark asteroid as visited
            this.visitedAsteroids.push(this.target);
            
            const beltType = this.target.parent.beltType;
            const mineAmount = Math.min(rng(5, 2), this.fleet.availableCargoSpace);
            
            // Determine cargo type based on belt
            let cargoType;
            if (beltType === ASTEROID_BELT_TYPES.Rocky) {
                cargoType = rndMember([CARGO_TYPES.METAL, CARGO_TYPES.ISOTOPES]);
            } else if (beltType === ASTEROID_BELT_TYPES.Icy) {
                cargoType = rndMember([CARGO_TYPES.WATER, CARGO_TYPES.ISOTOPES]);
            } else if (beltType === ASTEROID_BELT_TYPES.Plasma) {
                cargoType = CARGO_TYPES.ANTIMATTER;
            }
            
            if (cargoType) {
                this.fleet.cargo.increment(cargoType, mineAmount);
                console.log(`⛏️ ${this.fleet.name} mined ${mineAmount} ${cargoType.name}`);
                
                // Show mining popup
                    this.starMap.addPopup(this.fleet.x, this.fleet.y, '⛏️', COLORS.Orange, 2000)
            }
        }
    }
    
    onNearDestination() {
        // Unload all cargo at destination market
        if (this.destination && this.destination instanceof Planet && this.destination.s && this.destination.s.market && this.fleet.cargo.total > 0) {
            const market = this.destination.s.market
            
            // Add all our cargo to the market
            for (const [cargoType, amount] of this.fleet.cargo.counts.entries()) {
                market.cargo.increment(cargoType, amount)
            }
            this.fleet.cargo.clear()
            
            console.log(`💰 ${this.fleet.name} unloaded all cargo at ${this.destination.name}`)
            
            // Show trade popup
            this.starMap.addPopup(this.fleet.x, this.fleet.y, '💲', COLORS.Green, 2000)
        }
        
        super.onNearDestination()
    }
    
    onNearOrigin() {
        // Unload all cargo at origin market
        if (this.origin && this.origin instanceof Planet && this.origin.s && this.origin.s.market && this.fleet.cargo.total > 0) {
            const market = this.origin.s.market
            
            // Add all our cargo to the market
            for (const [cargoType, amount] of this.fleet.cargo.counts.entries()) {
                market.cargo.increment(cargoType, amount)
            }
            this.fleet.cargo.clear()
            
            console.log(`💰 ${this.fleet.name} unloaded all cargo at ${this.origin.name}`)
            
            // Show trade popup
            this.starMap.addPopup(this.fleet.x, this.fleet.y, '💲', COLORS.Green, 2000)
        }
        
        super.onNearOrigin()
    }
}
