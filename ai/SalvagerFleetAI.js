/**
 * AI for salvager fleets - travels around looking for debris and salvage opportunities.
 * @class SalvagerFleetAI
 * @extends FleetAI
 */
class SalvagerFleetAI extends FleetAI {
    calcDestination() {
        return rndMember([...gs.system.planets].filter(p=>(p !== this.home)))
    }
}
