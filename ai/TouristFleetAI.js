/**
 * AI for tourist fleets - travels to scenic locations.
 * @class TouristFleetAI
 * @extends FleetAI
 */
class TouristFleetAI extends FleetAI {
    calcDestination() {
        return rndMember([...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.spaceStations].filter(p=>(p !== this.origin)))
    }
    onDestroyed() {
        // Losing tourists hurts tourism economy and prestige
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.wealth *= 0.98;
        }
        super.onDestroyed()
    }
}
