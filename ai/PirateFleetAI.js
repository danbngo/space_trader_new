/**
 * AI for pirate fleets - hunts merchant ships and raids.
 * @class PirateFleetAI
 * @extends FleetAI
 */
class PirateFleetAI extends FleetAI {
    constructor(fleet = null, origin = null, starMap = null) {
        super(fleet, origin, starMap);
        /** @type {Fleet[]} */
        this.visitedFleets = [];
    }
    
    calcValidTargets() {
        const ourScore = this.fleet.combatRating
        return gs.system.fleets.filter(f => {
            if (f === this.fleet || f.factionType.criminal || f.factionType.authority || f.location) return false
            // Skip if already visited
            if (this.visitedFleets.includes(f)) return false
            // Only target fleets with cargo
            if (!f.cargo || f.cargo.total === 0) return false
            // Don't attack targets that are 2x stronger
            return f.combatRating <= ourScore * 2
        })
    }
    calcDestination() {
        return rndMember([...gs.system.dwarfPlanets, ...gs.system.spaceStations].filter(p=>(p !== this.origin)))
    }
    onNearTarget() {
        if (this.target instanceof Fleet && !this.target.location) {
            // Mark as visited
            this.visitedFleets.push(this.target);
            
            if (Math.random() > 0.5) {
                this.fightTarget();
            }
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
