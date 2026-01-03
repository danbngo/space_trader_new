/**
 * AI for mercenary fleets - hired guns who patrol for their employers.
 * @class MercenaryFleetAI
 * @extends FleetAI
 */
class MercenaryFleetAI extends FleetAI {
    constructor(fleet = null, origin = null, starMap = null) {
        super(fleet, origin, starMap);
        /** @type {Fleet[]} */
        this.visitedFleets = [];
    }
    
    calcValidTargets() {
        const ourScore = this.fleet.combatRating
        return gs.system.fleets.filter(f => {
            if (f === this.fleet) return false;
            if (f.location) return false;
            // Skip if already visited
            if (this.visitedFleets.includes(f)) return false;
            // Only target fleets with cargo
            if (!f.cargo || f.cargo.total === 0) return false;
            // Don't attack targets that are 2x stronger
            if (f.combatRating > ourScore * 2) return false;
            
            // Attack fleets from planets our employer is at war/tense with
            if (this.fleet.planet && this.fleet.planet.civilization && f.planet && f.planet.civilization) {
                const relationship = this.fleet.planet.c.relationships.get(f.planet)
                if (relationship === RELATIONSHIP_TYPES.WAR) return true;
                if (relationship === RELATIONSHIP_TYPES.TENSE) return true;
            }
            
            return false;
        });
    }
    calcDestination() {
        return rndMember([...gs.system.planets].filter(p=>(p !== this.origin)))
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
