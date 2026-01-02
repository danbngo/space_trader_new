/**
 * AI for diplomat fleets - travels between planets to conduct diplomacy.
 * @class DiplomatFleetAI
 * @extends FleetAI
 */
class DiplomatFleetAI extends FleetAI {
    calcDestination() {
        return rndMember([...gs.system.planets].filter(p=>(p !== this.home)))
    }
}
