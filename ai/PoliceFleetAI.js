/**
 * AI for police fleets - patrols and chases pirates.
 * @class PoliceFleetAI
 * @extends FleetAI
 */
class PoliceFleetAI extends FleetAI {
    constructor(fleet = null, origin = null, starMap = null) {
        super(fleet, origin, starMap);
    }
    
    calcValidTargets() {
        const ourScore = this.fleet.combatRating
        const criminals = gs.system.fleets.filter(f => {
            if (f === this.fleet || !f.factionType.criminal || f.location) return false
            // Skip if already visited
            if (this.visited.includes(f)) return false
            // Don't attack targets that are 2x stronger
            return f.combatRating <= ourScore * 2
        })
        
        // Also rescue crew from any abandoned fleets
        const abandonedRescues = gs.system.abandonedFleets.filter(f => {
            // Skip if already visited
            if (this.visited.includes(f)) return false
            // Only target abandoned fleets that still have crew
            if (f.officers.length === 0) return false
            return true
        })
        
        return [...criminals, ...abandonedRescues]
    }
    calcDestination() {
        return rndMember([...gs.system.planets].filter(p=>(p !== this.origin)))
    }
    onNearTarget() {
        if (this.target instanceof Fleet && !this.target.location) {
            // Mark as visited
            this.visited.push(this.target);
            
            // Check if target is abandoned
            if (this.target.destroyed) {
                // Rescue crew from abandoned fleet
                this.rescueCrew(this.target, '🚓', COLORS.Blue)
                this.target = null
                this.fleet.route = null
            } else {
                // Don't automatically interact with player fleet - they get an encounter instead
                if (this.target === gs.fleet) {
                    this.target = null;
                    this.fleet.route = null;
                    return;
                }
                
                if (Math.random() > 0.5) {
                    this.fightTarget(true);
                }
            }
        }
    }
    onDestroyed(destroyedBy = null) {
        // Losing police increases crime and reduces security
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.crime *= 1.01;
            this.fleet.planet.c.security *= 0.99;
        }
        super.onDestroyed(destroyedBy)
    }
}
