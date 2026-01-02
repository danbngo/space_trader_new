/**
 * AI for pirate fleets - hunts merchant ships and raids.
 * @class PirateFleetAI
 * @extends FleetAI
 */
class PirateFleetAI extends FleetAI {
    calcValidTargets() {
        return gs.system.fleets.filter(f => (f !== this.fleet && !f.factionType.criminal && !f.factionType.authority && !f));
    }
    calcDestination() {
        return rndMember([...gs.system.dwarfPlanets].filter(p=>(p !== this.home)))
    }
    onNearTarget() {
        if (this.target instanceof Fleet && !this.target.location) {
            if (Math.random() > 0.5) {
                this.fightTarget();
            }
        }
    }
}
