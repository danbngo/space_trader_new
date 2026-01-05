/**
 * AI for scientist fleets - travels between planets for research expeditions.
 * @class ScientistFleetAI
 * @extends FleetAI
 */
class ScientistFleetAI extends FleetAI {
    calcValidTargets() {
        // Target detectable anomalies and icy asteroids
        const detectableAnomalies = (gs.system.anomalies || []).filter(anomaly => anomaly.detectable(this.fleet))
        const icyAsteroids = gs.system.asteroids.filter(a => a.belt.asteroidBeltType == ASTEROID_BELT_TYPES.Icy && Math.random() < .2)
        return [...detectableAnomalies, ...icyAsteroids]
    }
    calcDestination() {
        // If cargo is full, return to a major planet to unload
        if (this.fleet.availableCargoSpace <= 0) {
            return rndMember([...gs.system.planets].filter(p => p !== this.origin));
        }
        
        // Always travel to a random waypoint in space for research expedition
        const x = rng(gs.system.radius * 2) - gs.system.radius;
        const y = rng(gs.system.radius * 2) - gs.system.radius;
        return new Waypoint(x, y);
    }
    
    onNearTarget() {
        // If target is an anomaly, investigate it
        if (this.target && this.target instanceof Anomaly) {
            this.investigateAnomaly(this.target, '🔬', COLORS.LightCyan)
        }
    }
    
    onNearDestination() {
        // Unload relics at destination if it's a major planet
        if (this.destination instanceof Planet && this.fleet.cargo.total > 0) {
            // Boost education and technology for scientific discoveries
            if (this.destination.civilization) {
                this.destination.c.education *= 1.01;
                this.destination.c.technology *= 1.01;
            }
            this.sellCargoAtMarket(this.destination);
        }
        
        super.onNearDestination();
    }
    onDestroyed(destroyedBy = null) {
        // Losing scientists hurts research and education
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.education *= 0.99;
            this.fleet.planet.c.technology *= 0.99;
        }
        super.onDestroyed(destroyedBy)
    }
}

