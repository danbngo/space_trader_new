/**
 * AI for slaver fleets - hunts vulnerable ships to capture crews.
 * @class SlaverFleetAI
 * @extends FleetAI
 */
class SlaverFleetAI extends FleetAI {
    calcTarget() {
        const vulnerableFleets = (gs.system.fleets || []).filter(f => (f !== this.fleet && !f.faction.authority && !f.faction.criminal));
        return this.findNearest(vulnerableFleets, 10);
    }
    calcDestination() {
        return rndMember([...gs.system.dwarfPlanets].filter(p=>(p !== this.home)))
    }
}
