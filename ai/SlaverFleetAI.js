/**
 * AI for slaver fleets - hunts vulnerable ships to capture crews.
 * @class SlaverFleetAI
 * @extends FleetAI
 */
class SlaverFleetAI extends FleetAI {
    constructor(fleet = null, origin = null, starMap = null) {
        super(fleet, origin, starMap);
    }
    
    calcValidTargets() {
        const ourScore = this.fleet.combatRating
        const liveFleets = gs.system.fleets.filter(f => {
            if (f === this.fleet || f.factionType.militant || f.factionType.criminal || f.location) return false
            // Skip if already visited
            if (this.visited.includes(f)) return false
            // Only target fleets with officers (captain + at least 1 subordinate)
            if (!f.captain || f.subordinates.length === 0) return false
            // Don't attack targets that are 2x stronger
            return f.combatRating <= ourScore * 2
        })
        
        // Also target abandoned fleets with crew
        const abandonedFleets = gs.system.abandonedFleets.filter(f => {
            // Skip if already visited
            if (this.visited.includes(f)) return false
            // Only target abandoned fleets that still have crew
            return f.officers.length > 0
        })
        
        return [...liveFleets, ...abandonedFleets]
    }
    calcDestination() {
        return rndMember([...gs.system.dwarfPlanets, ...gs.system.spaceStations].filter(p=>(p !== this.origin)))
    }
    onNearTarget() {
        if (this.target instanceof Fleet && !this.target.location) {
            // Don't automatically interact with player fleet - they get an encounter instead
            if (this.target === gs.fleet) {
                this.target = null;
                this.fleet.route = null;
                return;
            }
            
            // Mark as visited
            this.visited.push(this.target);
            
            // Check if target is abandoned
            if (this.target instanceof AbandonedFleet) {
                // Take all crew from abandoned fleet using utility function
                this.transferOfficers(this.target, this.fleet, '⛓️', COLORS.Orange, '🆘', COLORS.Gray);
                this.target = null
                this.fleet.route = null
            } else {
                // 50% chance to capture officers peacefully, 50% chance to fight
                if (Math.random() < 0.5) {
                    this.transferOfficers(this.target, this.fleet);
                    this.target = null;
                    this.fleet.route = null;
                } else {
                    this.fightTarget(true);
                }
            }
        }
    }
    onDestroyed(destroyedBy = null) {
        // Destroying slavers improves freedom and reduces crime
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.population *= 0.99;
            this.fleet.planet.c.industry *= 0.99;
            this.fleet.planet.c.corruption *= 0.98;
        }
        super.onDestroyed(destroyedBy)
    }
}
