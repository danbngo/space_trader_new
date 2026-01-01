/**
 * AI for tourist fleets - travels to scenic locations.
 * @class TouristFleetAI
 * @extends FleetAI
 */
class TouristFleetAI extends FleetAI {
    calcDestination() {
        return rndMember([...gs.system.planets].filter(p=>(p !== this.home)))
    }
}
