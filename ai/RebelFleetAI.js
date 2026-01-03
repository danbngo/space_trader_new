/**
 * AI for rebel fleets - travels around seeking to oppose authority, specifically targeting fleets from their home planet.
 * @class RebelFleetAI
 * @extends FleetAI
 */
class RebelFleetAI extends FleetAI {
    constructor(fleet = null, origin = null, starMap = null) {
        super(fleet, origin, starMap);
        /** @type {Fleet[]} */
        this.visitedFleets = [];
    }
    
    calcDestination() {
        return rndMember([...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.spaceStations].filter(p=>(p !== this.origin)))
    }
    calcValidTargets() {
        const ourScore = this.fleet.combatRating
        return gs.system.fleets.filter(f => {
            if (f === this.fleet || f.planet !== this.fleet.planet || f.location) return false
            // Skip if already visited
            if (this.visitedFleets.includes(f)) return false
            // Only target fleets with cargo
            if (!f.cargo || f.cargo.total === 0) return false
            // Don't attack targets that are 2x stronger
            return f.combatRating <= ourScore * 2
        })
    }
    onNearTarget() {
        if (this.target instanceof Fleet && !this.target.location) {
            // Mark as visited
            this.visitedFleets.push(this.target);
            
            // Always fight fleets from their home planet
            this.fightTarget();
        }
    }
    fightTarget() {
        const victor = super.fightTarget()
        if (victor == this.fleet) {
            // Winner takes cargo from loser
            this.transferCargo(this.target, this.fleet)
        }
        return victor
    }

}
