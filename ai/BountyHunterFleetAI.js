/**
 * AI for bounty hunter fleets - hunts targets with bounties.
 * @class BountyHunterFleetAI
 * @extends FleetAI
 */
class BountyHunterFleetAI extends FleetAI {
    calcTarget() {
        const criminalFleets = (gs.system.fleets || []).filter(f => (f !== this.fleet && f.faction.criminal))
        return this.findNearest(criminalFleets, 12);
    }
    calcDestination() {
        return rndMember([...gs.system.planets, ...gs.system.dwarfPlanets].filter(p=>(p !== this.home)))
    }
}
