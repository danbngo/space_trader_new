/**
 * AI for slaver fleets - hunts vulnerable ships to capture crews.
 * @class SlaverFleetAI
 * @extends FleetAI
 */
class SlaverFleetAI extends FleetAI {
    calcValidTargets() {
        return gs.system.fleets.filter(f => (f !== this.fleet && !f.factionType.authority && !f.factionType.criminal));
    }
    calcDestination() {
        return rndMember([...gs.system.dwarfPlanets].filter(p=>(p !== this.home)))
    }
    onNearTarget() {
        if (this.target instanceof Fleet) {
            if (Math.random() > 0.5) {
                this.fightTarget();
            }
        }
    }
}
