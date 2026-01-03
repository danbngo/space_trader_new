/**
 * AI for scientist fleets - travels between planets for research expeditions.
 * @class ScientistFleetAI
 * @extends FleetAI
 */
class ScientistFleetAI extends FleetAI {
    calcValidTargets() {
        return [...(gs.system.anomalies || []), ...gs.system.asteroids.filter(a=>a.belt.beltType == ASTEROID_BELT_TYPES.Icy && Math.random() < .2)]
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
}

