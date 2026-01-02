/**
 * AI for police fleets - patrols and chases pirates.
 * @class PoliceFleetAI
 * @extends FleetAI
 */
class PoliceFleetAI extends FleetAI {
    calcValidTargets() {
        return gs.system.fleets.filter(f => (f !== this.fleet && f.factionType.criminal));
    }
    calcDestination() {
        return rndMember([...gs.system.planets].filter(p=>(p !== this.home)))
    }
    onNearTarget() {
        if (this.target instanceof Fleet) {
            if (Math.random() > 0.5) {
                this.fightTarget();
            }
        }
    }
}
