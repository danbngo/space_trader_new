/**
 * AI for pirate fleets - hunts merchant ships and raids.
 * @class PirateFleetAI
 * @extends FleetAI
 */
class PirateFleetAI extends FleetAI {
    calcTarget() {
        const merchantFleets = (gs.system.fleets || []).filter(f => (f !== this.fleet && !f.faction.criminal && !f.faction.authority));
        return this.findNearest(merchantFleets, 12);
    }
    calcDestination() {
        return rndMember([...gs.system.dwarfPlanets].filter(p=>(p !== this.home)))
    }
}
