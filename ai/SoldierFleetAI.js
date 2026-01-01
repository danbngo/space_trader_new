/**
 * AI for soldier/military fleets - patrols territory and responds to threats.
 * @class SoldierFleetAI
 * @extends FleetAI
 */
class SoldierFleetAI extends FleetAI {
    calcTarget() {
        const hostileFleets = (gs.system.fleets || []).filter(f => (f !== this.fleet && f.planet !== this.fleet.planet && f.faction.criminal));
        return this.findNearest(hostileFleets, 15);
    }
    calcDestination() {
        return rndMember([...gs.system.planets].filter(p=>(p !== this.home)))
    }
}
