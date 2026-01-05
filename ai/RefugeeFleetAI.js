/**
 * AI for refugee fleets - travels between planets seeking safe haven.
 * @class RefugeeFleetAI
 * @extends FleetAI
 */
class RefugeeFleetAI extends FleetAI {
    calcDestination() {
        return rndMember([...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.spaceStations].filter(p=>(p !== this.origin)))
    }
    
    onNearDestination() {
        if (!(this.fleet.planet instanceof Planet) || !(this.destination instanceof Planet)) {
            return super.onNearDestination()
        }
        
        // Transfer racial/ethnic values from origin to destination (2% influence)
        if (this.fleet.planet.c.races) {
            for (const [race] of this.fleet.planet.c.races.counts.entries()) {
                this.destination.addRace(race, 0.02);
            }
        }
        
        // Transfer cultural values from origin to destination (1% influence, way less than colonists)
        if (this.destination instanceof Planet) {
            this.destination.addCulture(this.fleet.planet, 0.1);
            this.destination.c.population *= 1.01 //stimulate population growth
            this.destination.c.wealth *= 0.99 //refugees strain local economy
            this.destination.c.economy *= 1.01
            this.destination.c.taxes *= 1.01
            this.destination.c.security *= 0.99 //refugees can cause unrest
            this.fleet.planet.c.population *= 0.99
        }

        super.onNearDestination()
    }
    
    onDestroyed(destroyedBy = null) {
        // Losing refugees has humanitarian impact, slight population loss
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.population *= 0.98;
        }
        super.onDestroyed(destroyedBy)
    }
}
