/**
 * AI for miner fleets - mines asteroids and returns home when cargo is full.
 * @class MinerFleetAI
 * @extends FleetAI
 */
class MinerFleetAI extends FleetAI {
    calcValidTargets() {
        //introduce some fuzz so ship will move around
        // Filter out asteroids from Plasma belts (like Corona) - too dangerous to mine
        return gs.system.asteroids.filter(a => {
            if (calcDistance(this.fleet.x, this.fleet.y, a.x, a.y) <= 0.3) return false;
            if (a.belt && a.belt.beltType === ASTEROID_BELT_TYPES.Plasma) return false;
            return true;
        })
    }
    calcDestination() {
        return rndMember([...gs.system.planets].filter(p=>(p !== this.origin)))
    }
    
    onNearTarget() {
        // Mine cargo based on asteroid belt type
        if (this.target && this.target.parent && this.fleet.availableCargoSpace > 0) {
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
            }
        }
    }
}
