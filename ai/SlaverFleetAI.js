/**
 * AI for slaver fleets - hunts vulnerable ships to capture crews.
 * @class SlaverFleetAI
 * @extends FleetAI
 */
class SlaverFleetAI extends FleetAI {
    calcValidTargets() {
        //slavers will attack other criminals!
        return gs.system.fleets.filter(f => (f !== this.fleet && !f.factionType.authority && !f.location));
    }
    calcDestination() {
        return rndMember([...gs.system.dwarfPlanets].filter(p=>(p !== this.home)))
    }
    onNearTarget() {
        if (this.target instanceof Fleet) {
            if (Math.random() > 0.5 && !this.target.location) {
                this.fightTarget();
            }
        }
    }
}
