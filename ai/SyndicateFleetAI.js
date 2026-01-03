/**
 * AI for syndicate fleets - extorts and hunts civilian AND criminal ships.
 * @class SyndicateFleetAI
 * @extends FleetAI
 */
class SyndicateFleetAI extends FleetAI {
    constructor(fleet = null, origin = null, starMap = null) {
        super(fleet, origin, starMap);
        /** @type {Fleet[]} */
        this.visited = [];
    }
    
    calcValidTargets() {
        const ourScore = this.fleet.combatRating
        return gs.system.fleets.filter(f => {
            if (f === this.fleet || f.factionType.militant || f.factionType.authority || f.location) return false
            // Skip if already visited
            if (this.visited.includes(f)) return false
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
            this.visited.push(this.target);
            
            // 75% chance to extort credits peacefully, 25% chance to fight
            if (Math.random() < 0.5) {
                this.transferCredits(this.target, this.fleet);
                this.target = null;
                this.route = null;
            } else {
                this.fightTarget();
            }
        }
    }
    fightTarget() {
        return super.fightTarget(true)
    }
    onDestroyed() {
        // Destroying syndicates reduces organized crime and corruption
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.crime *= 0.99;
            this.fleet.planet.c.corruption *= 0.99;
            this.fleet.planet.c.wealth *= 0.99;
        }
        super.onDestroyed()
    }
}
