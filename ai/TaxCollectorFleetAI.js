/**
 * AI for tax collector fleets - travels between planets to collect taxes.
 * @class TaxCollectorFleetAI
 * @extends FleetAI
 */
class TaxCollectorFleetAI extends FleetAI {
    calcDestination() {
        return rndMember([...gs.system.dwarfPlanets].filter(p=>(p !== this.home)))
    }
}
