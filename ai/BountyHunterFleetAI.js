/**
 * AI for bounty hunter fleets - hunts targets with bounties.
 * @class BountyHunterFleetAI
 * @extends FleetAI
 */
class BountyHunterFleetAI extends FleetAI {
    constructor(fleet = null, origin = null, starMap = null) {
        super(fleet, origin, starMap);
        /** @type {Fleet[]} */
        this.visited = [];
    }
    
    calcDestination() {
        // 75% chance to scope out a random asteroid (looking for criminals hiding there)
        if (Math.random() < 0.75 && gs.system.asteroids.length > 0) {
            return rndMember(gs.system.asteroids);
        }
        
        // Fallback to planets/stations
        return rndMember([...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.spaceStations].filter(p=>(p !== this.origin)))
    }
    calcValidTargets() {
        const ourScore = this.fleet.combatRating
        return gs.system.fleets.filter(f => {
            if (f === this.fleet || !f.factionType.criminal || f.location) return false
            // Skip if already visited
            if (this.visited.includes(f)) return false
            // Only target fleets with credits
            if (!f.captain || f.captain.credits <= 0) return false
            // Don't attack targets that are 2x stronger
            return f.combatRating <= ourScore * 2
        })
    }
    onNearTarget() {
        if (this.target instanceof Fleet && !this.target.location) {
            // Mark as visited
            this.visited.push(this.target);
            
            // 50% chance to take credits peacefully if they have any, otherwise fight
            if (this.target.captain && this.target.captain.credits > 0 && Math.random() < 0.5) {
                this.transferCredits(this.target, this.fleet);
                this.target = null;
                this.route = null;
            } else {
                this.fightTarget();
            }
        }
    }
    onDestroyed() {
        // Losing bounty hunters increases crime (less law enforcement)
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.crime *= 1.01;
        }
        super.onDestroyed()
    }
}
