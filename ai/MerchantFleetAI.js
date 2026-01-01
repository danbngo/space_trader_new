/**
 * AI for merchant fleets - travels between planets to trade.
 * @class MerchantFleetAI
 * @extends FleetAI
 */
class MerchantFleetAI extends FleetAI {
    calcDestination() {
        return rndMember([...gs.system.planets].filter(p=>(p !== this.home)))
    }
}
