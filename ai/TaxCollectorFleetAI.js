/**
 * AI for tax collector fleets - travels between planets to collect taxes.
 * @class TaxCollectorFleetAI
 * @extends FleetAI
 */
class TaxCollectorFleetAI extends FleetAI {
    constructor(fleet = null, origin = null, starMap = null) {
        super(fleet, origin, starMap);
    }
    
    calcValidTargets() {
        return gs.system.fleets.filter(f => {
            if (f === this.fleet || f.location) return false
            // Skip if already visited
            if (this.visited.includes(f)) return false
            // Only target non-criminal, non-authority ships with money
            if (f.factionType.criminal || f.factionType.authority) return false
            if (!f.captain || f.captain.credits <= 0) return false
            return true
        })
    }
    calcDestination() {
        return rndMember([...gs.system.dwarfPlanets, ...gs.system.spaceStations].filter(p=>(p !== this.origin)))
    }
    onNearOrigin() {
        if (this.origin instanceof Planet) {
            this.origin.c.wealth *= 1.01 //stimulate the local economy
            this.origin.c.taxes *= 0.98;
        }
        super.onNearOrigin()
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
            
            // 50% chance to collect taxes, 40% chance nothing happens, 10% chance to fight
            const roll = Math.random();
            if (roll < 0.5) {
                // Collect taxes peacefully
                this.transferCredits(this.target, this.fleet);
                this.target = null;
                this.fleet.route = null;
            } else if (roll < 0.9) {
                // Nothing happens - target evades or refuses
                this.target = null;
                this.fleet.route = null;
            } else {
                // Fight
                this.fightTarget(true);
            }
        }
    }
    onDestroyed() {
        // Losing tax collectors reduces government revenue capacity
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.taxes *= 0.98;
            this.fleet.planet.c.wealth *= 0.99;
        }
        super.onDestroyed()
    }
}
