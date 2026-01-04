/**
 * AI for bounty hunter fleets - hunts targets with bounties.
 * @class BountyHunterFleetAI
 * @extends FleetAI
 */
class BountyHunterFleetAI extends FleetAI {
    constructor(fleet = null, origin = null, starMap = null) {
        super(fleet, origin, starMap);
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
        const liveFleets = gs.system.fleets.filter(f => {
            if (f === this.fleet || !f.factionType.criminal || f.location) return false
            // Skip if already visited
            if (this.visited.includes(f)) return false
            // Only target fleets with credits
            if (!f.captain || f.captain.credits <= 0) return false
            // Don't attack targets that are 2x stronger
            return f.combatRating <= ourScore * 2
        })
        
        // Also abduct criminals from abandoned criminal fleets
        const abandonedCriminals = gs.system.abandonedFleets.filter(f => {
            // Skip if already visited
            if (this.visited.includes(f)) return false
            // Only target abandoned fleets that still have crew
            if (f.officers.length === 0) return false
            // Only target criminal factions
            return f.factionType && f.factionType.criminal
        })
        
        return [...liveFleets, ...abandonedCriminals]
    }
    onNearTarget() {
        if (this.target instanceof Fleet && !this.target.location) {
            // Mark as visited
            this.visited.push(this.target);
            
            // Check if target is abandoned
            if (this.target instanceof AbandonedFleet) {
                // Abduct criminals from abandoned fleet
                this.transferOfficers(this.target, this.fleet, '🎯', COLORS.Yellow, '⚖️', COLORS.Gray);
                this.target = null
                this.fleet.route = null
            } else {
                // Don't automatically interact with player fleet - they get an encounter instead
                if (this.target === gs.fleet) {
                    this.target = null;
                    this.fleet.route = null;
                    return;
                }
                
                // 50% chance to take credits peacefully if they have any, otherwise fight
                if (this.target.captain && this.target.captain.credits > 0 && Math.random() < 0.5) {
                    this.transferCredits(this.target, this.fleet);
                    this.target = null;
                    this.fleet.route = null;
                } else {
                    this.fightTarget();
                }
            }
        }
    }
    fightTarget() {
        const result = super.fightTarget(false)
        // After combat, if we won, transfer officers from the defeated criminal
        if (result === this.fleet && this.target && this.target.officers && this.target.officers.length > 0) {
            this.transferOfficers(this.target, this.fleet)
        }
        return result
    }
    onDestroyed() {
        // Losing bounty hunters increases crime (less law enforcement)
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.crime *= 1.01;
        }
        super.onDestroyed()
    }
}
