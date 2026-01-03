/**
 * AI for syndicate fleets - extorts and hunts civilian ships.
 * @class SyndicateFleetAI
 * @extends FleetAI
 */
class SyndicateFleetAI extends FleetAI {
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
            // Only target fleets with credits
            if (!f.captain || f.captain.credits <= 0) return false
            // Target civilian ships that aren't too strong
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
            
            // 50% chance to extort credits peacefully, 50% chance to fight
            if (Math.random() < 0.5) {
                this.transferCredits(this.target, this.fleet);
                this.target = null;
                this.route = null;
            } else {
                this.fightTarget();
            }
        }
    }
}
