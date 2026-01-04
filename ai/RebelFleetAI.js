/**
 * AI for rebel fleets - travels around seeking to oppose authority, specifically targeting fleets from their home planet.
 * @class RebelFleetAI
 * @extends FleetAI
 */
class RebelFleetAI extends FleetAI {
    constructor(fleet = null, origin = null, starMap = null) {
        super(fleet, origin, starMap);
    }
    
    calcDestination() {
        return rndMember([...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.spaceStations].filter(p=>(p !== this.origin)))
    }
    calcValidTargets() {
        const ourScore = this.fleet.combatRating
        const liveFleets = gs.system.fleets.filter(f => {
            if (f === this.fleet || f.planet !== this.fleet.planet || f.location) return false
            // Skip if already visited
            if (this.visited.includes(f)) return false
            // Only target authority fleets (government, police, military)
            if (!f.factionType.authority) return false
            // Only target fleets with cargo
            if (!f.cargo || f.cargo.total === 0) return false
            // Don't attack targets that are 2x stronger
            return f.combatRating <= ourScore * 2
        })
        
        // Also take cargo from abandoned fleets from their home planet (only if we have cargo space)
        const abandonedCargo = this.fleet.availableCargoSpace > 0 ? gs.system.abandonedFleets.filter(f => {
            // Skip if already visited
            if (this.visited.includes(f)) return false
            // Only target abandoned fleets with cargo remaining
            if (!f.cargo || f.cargo.total === 0) return false
            // Only take from their home planet
            return f.planet === this.fleet.planet
        }) : []
        
        return [...liveFleets, ...abandonedCargo]
    }
    onNearTarget() {
        if (this.target instanceof Fleet && !this.target.location) {
            // Mark as visited
            this.visited.push(this.target);
            
            // Check if target is abandoned
            if (this.target instanceof AbandonedFleet) {
                // Take cargo from abandoned fleet (respecting cargo limit)
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
                    if (transferred > 0) {
                        console.log(`🎭 ${this.fleet.name} seized ${transferred} cargo from ${this.target.name}`)
                        this.addPopup('🎭', COLORS.Purple, this.fleet.x, this.fleet.y)
                        this.addPopup('📦', COLORS.Gray, this.target.x, this.target.y)
                    }
                }
                this.target = null
                this.fleet.route = null
            } else {
                // Don't automatically interact with player fleet - they get an encounter instead
                if (this.target === gs.fleet) {
                    this.target = null;
                    this.fleet.route = null;
                    return;
                }
                
                // Reduce prestige and culture when rebels fight
                if (this.fleet.planet && this.fleet.planet.civilization) {
                    this.fleet.planet.c.prestige *= 0.999;
                    this.fleet.planet.c.culture *= 0.999;
                }
                
                // Always fight fleets from their home planet
                this.fightTarget();
            }
        }
    }
    fightTarget() {
        return super.fightTarget(true)
    }
    onDestroyed() {
        // Increase prestige and culture when rebels are destroyed (restores order)
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.prestige *= 1.01;
            this.fleet.planet.c.culture *= 1.01;
        }
        super.onDestroyed()
    }
}
