/**
 * AI for tax collector fleets - travels between planets to collect taxes.
 * @class TaxCollectorFleetAI
 * @extends FleetAI
 */
class TaxCollectorFleetAI extends FleetAI {
    constructor(fleet = null, origin = null, starMap = null) {
        super(fleet, origin, starMap);
        /** @type {Fleet[]} */
        this.visitedFleets = [];
    }
    
    calcValidTargets() {
        return gs.system.fleets.filter(f => {
            if (f === this.fleet || f.location) return false
            // Skip if already visited
            if (this.visitedFleets.includes(f)) return false
            // Only target non-criminal, non-authority ships with money
            if (f.factionType.criminal || f.factionType.authority) return false
            if (!f.captain || f.captain.credits <= 0) return false
            return true
        })
    }
    calcDestination() {
        return rndMember([...gs.system.dwarfPlanets, ...gs.system.spaceStations].filter(p=>(p !== this.origin)))
    }
    onNearTarget() {
        if (this.target instanceof Fleet && !this.target.location) {
            // Mark as visited
            this.visitedFleets.push(this.target);
            
            // 90% chance to collect taxes peacefully, 10% chance to fight
            if (Math.random() < 0.9) {
                this.transferCredits(this.target, this.fleet);
                this.target = null;
                this.route = null;
            } else {
                this.fightTarget();
            }
        }
    }
}
