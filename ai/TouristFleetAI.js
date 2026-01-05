/**
 * AI for tourist fleets - travels to scenic locations.
 * @class TouristFleetAI
 * @extends FleetAI
 */
class TouristFleetAI extends FleetAI {
    constructor(fleet = null, origin = null, starMap = null) {
        super(fleet, origin, starMap);
        /** @type {(Anomaly|Ruins)[]} - Attractions already visited to avoid repeat tours */
        this.visitedAttractions = [];
    }

    calcValidTargets() {
        // Target unvisited scenic anomalies and ruins
        const unvisitedAnomalies = (gs.system.anomalies || []).filter(anomaly => {
            if (this.visitedAttractions.includes(anomaly)) return false
            return anomaly.detectable(this.fleet)
        })
        
        const unvisitedRuins = (gs.system.ruins || []).filter(ruins => {
            return !this.visitedAttractions.includes(ruins)
        })
        
        return [...unvisitedAnomalies, ...unvisitedRuins]
    }

    calcDestination() {
        return rndMember([...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.spaceStations].filter(p=>(p !== this.origin)))
    }

    onNearTarget() {
        // When visiting an attraction, mark it as visited and boost culture
        if (this.target && (this.target instanceof Anomaly || this.target instanceof Ruins)) {
            this.visitedAttractions.push(this.target)
            // Home planet gains culture from tourism documentation
            if (this.fleet.planet && this.fleet.planet.civilization) {
                this.fleet.planet.c.culture *= 1.01
            }
        }
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
