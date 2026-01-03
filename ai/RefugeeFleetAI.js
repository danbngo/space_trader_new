/**
 * AI for refugee fleets - travels between planets seeking safe haven.
 * @class RefugeeFleetAI
 * @extends FleetAI
 */
class RefugeeFleetAI extends FleetAI {
    calcDestination() {
        return rndMember([...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.spaceStations].filter(p=>(p !== this.origin)))
    }
    onDestroyed() {
        // Losing refugees has humanitarian impact, slight population loss
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.population *= 0.98;
        }
        super.onDestroyed()
    }
}
