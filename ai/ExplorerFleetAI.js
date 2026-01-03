/**
 * AI for explorer fleets - travels to distant frontiers and investigates anomalies.
 * @class ExplorerFleetAI
 * @extends FleetAI
 */
class ExplorerFleetAI extends FleetAI {
    constructor(fleet = null, origin = null, starMap = null) {
        super(fleet, origin, starMap);
        /** @type {Ruins[]} - Ruins already visited to avoid repeat explorations */
        this.visitedRuins = [];
    }
    
    calcValidTargets() {
        // Check for nearby anomalies that are detectable
        const nearbyAnomalies = (gs.system.anomalies || []).filter(anomaly => {
            return anomaly.detectable(this.fleet)
        })
        
        if (nearbyAnomalies.length > 0) {
            return nearbyAnomalies
        }
        
        // Check for nearby ruins that haven't been visited
        const nearbyRuins = (gs.system.ruins || []).filter(ruins => {
            if (this.visitedRuins.includes(ruins)) return false
            const distance = calcDistance(this.fleet.x, this.fleet.y, ruins.x, ruins.y)
            return distance <= 5 // Within exploration range
        })
        
        if (nearbyRuins.length > 0) {
            return nearbyRuins
        }
        
        return []
    }
    
    calcDestination() {
        // Travel to the 50% furthest planets/stations
        const allDestinations = [...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.spaceStations].filter(p => p !== this.origin)
        
        if (allDestinations.length === 0) {
            return this.origin
        }
        
        // Calculate distances from origin
        const destinationsWithDistance = allDestinations.map(dest => ({
            destination: dest,
            distance: calcDistance(this.origin.x, this.origin.y, dest.x, dest.y)
        }))
        
        // Sort by distance (furthest first)
        destinationsWithDistance.sort((a, b) => b.distance - a.distance)
        
        // Select from the furthest 50%
        const furthestHalf = destinationsWithDistance.slice(0, Math.max(1, Math.ceil(destinationsWithDistance.length * 0.5)))
        
        return rndMember(furthestHalf).destination
    }
    
    onNearTarget() {
        // If target is an anomaly, investigate and catalog it
        if (this.target && this.target instanceof Anomaly) {
            this.target.investigate();
            const index = gs.system.anomalies.indexOf(this.target);
            if (index !== -1) {
                gs.system.anomalies.splice(index, 1);
                
                // Award relics for charting the anomaly
                if (this.fleet.availableCargoSpace > 0) {
                    const relicsFound = Math.min(rng(2, 1), this.fleet.availableCargoSpace);
                    this.fleet.cargo.increment(CARGO_TYPES.RELICS, relicsFound);
                    console.log(`🧭 ${this.fleet.name} charted ${this.target.name} and discovered ${relicsFound} relics`);
                    
                    // Show discovery popup
                    this.addPopup('✨', COLORS.Green)
                } else {
                    console.log(`🧭 ${this.fleet.name} charted ${this.target.name}`);
                    
                    // Show discovery popup
                    this.addPopup('✨', COLORS.Green)
                }
            }
        }
        
        // If target is ruins, explore with risks
        if (this.target && this.target instanceof Ruins) {
            // Mark ruins as visited
            this.visitedRuins.push(this.target);
            
            const roll = Math.random();
            
            // 33% chance to find relics
            if (roll < 0.33) {
                const relicsFound = Math.floor(this.fleet.availableCargoSpace * Math.random());
                if (relicsFound > 0) {
                    this.fleet.cargo.increment(CARGO_TYPES.RELICS, relicsFound);
                    console.log(`🧭 ${this.fleet.name} explored ${this.target.name} and discovered ${relicsFound} relics!`);
                    
                    // Show success popup
                    if (this.starMap) {
                        this.addPopup('💎', COLORS.Green)
                    }
                } else {
                    console.log(`🧭 ${this.fleet.name} explored ${this.target.name} but found nothing of value`);
                    
                    // Show neutral popup
                    if (this.starMap) {
                        this.addPopup('🔍', COLORS.White)
                    }
                }
            }
            // 33% chance to be destroyed
            else if (roll < 0.66) {
                console.log(`☠️ ${this.fleet.name} was destroyed exploring ${this.target.name}!`);
                this.onDestroyed();
                return;
            }
            // 33% chance to lose crew and take heavy damage
            else {
                // Remove all subordinates (lose all crew except captain)
                if (this.fleet.captain && this.fleet.subordinates) {
                    const crewLost = this.fleet.subordinates.length;
                    for (const o of this.fleet.subordinates) this.fleet.removeOfficer(o);
                    console.log(`⚠️ ${this.fleet.name} lost ${crewLost} crew members exploring ${this.target.name}!`);
                }
                
                // Damage all ships (lose up to 100% hull)
                for (const ship of this.fleet.ships) {
                    const damagePercent = Math.random(); // 0-100%
                    const damageAmount = ship.hull[1] * damagePercent;
                    ship.takeDamage(damageAmount, true);
                }
                
                console.log(`⚠️ ${this.fleet.name} sustained heavy damage exploring ${this.target.name}!`);
                
                // Show danger popup
                if (this.starMap) {
                    this.addPopup('⚠️', COLORS.Orange)
                }
            }
            
            // Clear target and move on
            this.target = null;
            this.route = null
        }
    }
    
    onDestroyed() {
        // Losing explorers reduces knowledge and exploration efforts
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.technology *= 0.99;
        }
        super.onDestroyed()
    }
}
