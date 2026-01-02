/**
 * AI for rebel fleets - travels around seeking to oppose authority, specifically targeting fleets from their home planet.
 * @class RebelFleetAI
 * @extends FleetAI
 */
class RebelFleetAI extends FleetAI {
    calcDestination() {
        return rndMember([...gs.system.planets].filter(p=>(p !== this.home)))
    }
    calcValidTargets() {
        // Target any fleet that belongs to the rebel's home planet
        return gs.system.fleets.filter(f => (f !== this.fleet && f.planet === this.home && !f.location));
    }
    onNearTarget() {
        if (this.target instanceof Fleet && !this.target.location) {
            // Always fight fleets from their home planet
            this.fightTarget();
        }
    }
}
