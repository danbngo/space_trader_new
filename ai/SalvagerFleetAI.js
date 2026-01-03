/**
 * AI for salvager fleets - travels around looking for debris and salvage opportunities.
 * @class SalvagerFleetAI
 * @extends FleetAI
 */
class SalvagerFleetAI extends FleetAI {
    calcDestination() {
        return rndMember([...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.spaceStations].filter(p=>(p !== this.origin)))
    }
    onDestroyed() {
        // Losing salvagers hurts resource recovery and industry
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.industry *= 0.99;
            this.fleet.planet.c.economy *= 0.99;
        }
        super.onDestroyed()
    }
}
