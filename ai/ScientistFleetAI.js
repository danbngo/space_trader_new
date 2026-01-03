/**
 * AI for scientist fleets - travels between planets for research expeditions.
 * @class ScientistFleetAI
 * @extends FleetAI
 */
class ScientistFleetAI extends FleetAI {
    calcValidTargets() {
        // Target detectable anomalies and icy asteroids
        const detectableAnomalies = (gs.system.anomalies || []).filter(anomaly => anomaly.detectable(this.fleet))
        const icyAsteroids = gs.system.asteroids.filter(a => a.belt.beltType == ASTEROID_BELT_TYPES.Icy && Math.random() < .2)
        return [...detectableAnomalies, ...icyAsteroids]
    }
    calcDestination() {
        return rndMember([...gs.system.planets].filter(p=>(p !== this.origin)))
    }
    
    onNearTarget() {
        // If target is an anomaly, investigate and remove it
        if (this.target && this.target instanceof Anomaly) {
            this.target.investigate();
            const index = gs.system.anomalies.indexOf(this.target);
            if (index !== -1) {
                gs.system.anomalies.splice(index, 1);
                
                // Award relics for studying the anomaly
                if (this.fleet.availableCargoSpace > 0) {
                    const relicsFound = Math.min(rng(3, 1), this.fleet.availableCargoSpace);
                    this.fleet.cargo.increment(CARGO_TYPES.RELICS, relicsFound);
                    console.log(`🔬 ${this.fleet.name} catalogued ${this.target.name} and discovered ${relicsFound} relics`);
                    
                    // Show discovery popup
                    this.starMap.addPopup(this.fleet.x, this.fleet.y, '✨', COLORS.LightCyan)
                } else {
                    console.log(`🔬 ${this.fleet.name} catalogued ${this.target.name}`);
                    
                    // Show discovery popup
                    this.starMap.addPopup(this.fleet.x, this.fleet.y, '✨', COLORS.LightCyan)
                }
            }
        }
    }
    onDestroyed() {
        // Losing scientists hurts research and education
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.education *= 0.99;
            this.fleet.planet.c.technology *= 0.99;
        }
        super.onDestroyed()
    }
}

