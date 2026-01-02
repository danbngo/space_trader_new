/**
 * AI for diplomat fleets - travels between planets to conduct diplomacy.
 * @class DiplomatFleetAI
 * @extends FleetAI
 */
class DiplomatFleetAI extends FleetAI {
    calcDestination() {
        return rndMember([...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.spaceStations].filter(p=>(p !== this.origin)))
    }
}
