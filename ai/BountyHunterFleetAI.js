/**
 * AI for bounty hunter fleets - hunts targets with bounties.
 * @class BountyHunterFleetAI
 * @extends FleetAI
 */
class BountyHunterFleetAI extends FleetAI {
    calcDestination() {
        return rndMember([...gs.system.planets, ...gs.system.dwarfPlanets].filter(p=>(p !== this.home)))
    }
    calcValidTargets() {
        return gs.system.fleets.filter(f => (f !== this.fleet && f.factionType.criminal && !f.location))
    }
    onNearTarget() {
        if (this.target instanceof Fleet && !this.target.location) {
            if (Math.random() > 0.5) {
                this.fightTarget();
            }
        }
    }
}
