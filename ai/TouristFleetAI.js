/**
 * AI for tourist fleets - travels to scenic locations.
 * @class TouristFleetAI
 * @extends FleetAI
 */
class TouristFleetAI extends FleetAI {
    calcDestination() {
        return rndMember([...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.spaceStations].filter(p=>(p !== this.origin)))
    }
    
    onNearDestination() {
        // Spread minor culture when arriving at destinations (0.1% influence)
        if (this.destination instanceof Planet) {
            this.destination.addCulture(this.fleet.planet, 0.001);
            this.destination.c.wealth *= 1.02 //stimulate the local economy
        }
        
        super.onNearDestination()
    }
    
    onDestroyed(destroyedBy = null) {
        // Losing tourists hurts tourism economy and prestige
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.wealth *= 0.98;
        }
        super.onDestroyed(destroyedBy)
    }
}
