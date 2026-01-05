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
        // If cargo is full, return to a major planet to unload
        if (this.fleet.availableCargoSpace <= 0) {
            return rndMember([...gs.system.planets].filter(p => p !== this.origin));
        }
        
        // Always travel to a random waypoint in the outer regions (at least 0.75x radius from center)
        // This ensures explorers travel to distant frontiers like the Kuiper belt
        const minDistance = gs.system.radius * 0.75;
        let x, y, distance;
        
        // Keep generating random points until we get one far enough from center
        do {
            x = rng(gs.system.radius * 2) - gs.system.radius;
            y = rng(gs.system.radius * 2) - gs.system.radius;
            distance = Math.sqrt(x * x + y * y);
        } while (distance < minDistance);
        
        return new Waypoint(x, y);
    }
    
    onNearTarget() {
        // If target is an anomaly, investigate it
        if (this.target && this.target instanceof Anomaly) {
            this.investigateAnomaly(this.target, '🧭', COLORS.Green)
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
                    
                    // Home planet gains technology and education from exploration
                    if (this.fleet.planet && this.fleet.planet.civilization) {
                        this.fleet.planet.c.technology *= 1.01
                        this.fleet.planet.c.education *= 1.01
                    }
                    
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
            this.fleet.route = null
        }
    }
    
    onNearDestination() {
        // Unload relics at destination if it's a major planet
        if (this.destination instanceof Planet && this.fleet.cargo.total > 0) {
            // Check if selling relics
            const hasRelics = this.fleet.cargo.getAmount(CARGO_TYPES.RELICS) > 0
            
            // Boost technology for exploration discoveries
            if (this.destination.civilization) {
                this.destination.c.technology *= 1.01;
                if (hasRelics) {
                    this.destination.c.culture *= 1.01;
                    this.destination.c.education *= 1.01;
                }
            }
            
            // Home planet gains wealth and reduces taxes when selling relics
            if (hasRelics && this.fleet.planet && this.fleet.planet.civilization) {
                this.fleet.planet.c.wealth *= 1.01
                this.fleet.planet.c.taxes *= 0.99
            }
            
            this.sellCargoAtMarket(this.destination);
        }
        
        super.onNearDestination();
    }
    
    onDestroyed(destroyedBy = null) {
        // Losing explorers reduces knowledge and exploration efforts
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.technology *= 0.99;
        }
        super.onDestroyed(destroyedBy)
    }
}
