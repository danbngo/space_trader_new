/**
 * AI for police fleets - patrols and chases pirates.
 * @class PoliceFleetAI
 * @extends FleetAI
 */
class PoliceFleetAI extends FleetAI {
    calcTarget() {
        const criminalFleets = (gs.system.fleets || []).filter(f => (f !== this.fleet && f.faction.criminal));
        return this.findNearest(criminalFleets, 12);
    }
    calcDestination() {
        return rndMember([...gs.system.planets].filter(p=>(p !== this.home)))
    }
}
