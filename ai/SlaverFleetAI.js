/**
 * AI for slaver fleets - hunts vulnerable ships to capture crews.
 * @class SlaverFleetAI
 * @extends FleetAI
 */
class SlaverFleetAI extends FleetAI {
    constructor(fleet = null, origin = null, starMap = null) {
        super(fleet, origin, starMap);
        /** @type {Fleet[]} */
        this.visitedFleets = [];
    }
    
    calcValidTargets() {
        const ourScore = this.fleet.combatRating
        return gs.system.fleets.filter(f => {
            if (f === this.fleet || f.factionType.authority || f.location) return false
            // Skip if already visited
            if (this.visitedFleets.includes(f)) return false
            // Only target fleets with officers (captain + at least 1 subordinate)
            if (!f.captain || f.subordinates.length === 0) return false
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
            
            // 50% chance to capture officers peacefully, 50% chance to fight
            if (Math.random() < 0.5) {
                this.transferOfficers(this.target, this.fleet);
                this.target = null;
                this.route = null;
            } else {
                this.fightTarget();
            }
        }
    }
}
