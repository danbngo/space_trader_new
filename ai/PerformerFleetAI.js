/**
 * AI for performer fleets - travels to entertain audiences on various planets.
 * @class PerformerFleetAI
 * @extends FleetAI
 */
class PerformerFleetAI extends FleetAI {
    constructor(fleet = null, origin = null, starMap = null) {
        super(fleet, origin, starMap);
    }
    
    calcValidTargets() {
        // Target fleets that aren't authority, criminal, or religious
        return gs.system.fleets.filter(f => {
            if (f === this.fleet || f.location) return false;
            // Skip authority, criminal, and religious fleets
            if (f.factionType.authority || f.factionType.criminal) return false;
            // Skip if already visited
            if (this.visited.includes(f)) return false;
            // Only target fleets with captains who have credits
            if (!f.captain || f.captain.credits <= 0) return false;
            return true;
        });
    }
    
    calcDestination() {
        // Travel to random planets, avoiding war/tense relationships
        return rndMember([...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.spaceStations].filter(p => {
            if (p === this.origin || p === this.fleet.planet) return false
            
            // Don't travel to planets we're at war or tense with
            if (this.fleet.planet && this.fleet.planet.civilization && p.civilization) {
                const relationship = this.fleet.planet.c.relationships.get(p)
                if (relationship === RELATIONSHIP_TYPES.WAR || relationship === RELATIONSHIP_TYPES.TENSE) {
                    return false
                }
            }
            
            return true
        }))
    }
    
    onNearTarget() {
        if (this.target instanceof Fleet && !this.target.location) {
            // Don't automatically interact with player fleet - they get an encounter instead
            if (this.target === gs.fleet) {
                this.target = null;
                this.fleet.route = null;
                return;
            }
            
            // Mark fleet as visited
            this.visited.push(this.target);
            
            // Both sides gain culture from performance
            if (this.fleet.planet && this.fleet.planet.civilization) {
                this.fleet.planet.c.culture *= 1.01
            }
            if (this.target.planet && this.target.planet.civilization) {
                this.target.planet.c.culture *= 1.01
            }
            
            // Increase home planet's culture and prestige every performance
            if (this.fleet.planet && this.fleet.planet.civilization) {
                // 10% chance for prestige increase
                if (Math.random() < 0.1) {
                    this.fleet.planet.c.prestige *= 1.01;
                }
            }
            
            // Spread culture to the target fleet's home planet (0.1% influence)
            if (this.target.planet instanceof Planet) {
                this.target.planet.addCulture(this.fleet.planet, 0.001);
            }
            
            // 50% chance of performing well and taking 20% of their credits
            if (Math.random() < 0.5) {
                const creditsToTake = Math.floor(this.target.captain.credits * 0.2);
                if (creditsToTake > 0) {
                    // Temporarily store 80% of target's credits, transfer all, then restore the 80%
                    const remainingCredits = this.target.captain.credits - creditsToTake;
                    this.transferCredits(this.target, this.fleet);
                    this.target.captain.credits = remainingCredits;
                    
                    // Home planet gains wealth, target loses wealth
                    if (this.fleet.planet && this.fleet.planet.civilization) {
                        this.fleet.planet.c.wealth *= 1.01
                    }
                    if (this.target.planet && this.target.planet.civilization) {
                        this.target.planet.c.wealth *= 0.99
                    }
                    
                    console.log(`🎭 ${this.fleet.name} performed brilliantly for ${this.target.name} and earned ${creditsToTake} credits!`);
                    
                    // Show performance popup
                    this.addPopup('🎭', COLORS.LightYellow);
                }
            } else {
                console.log(`🎭 ${this.fleet.name} performed for ${this.target.name} but received no payment`);
                
                // Show performance popup
                this.addPopup('🎭', COLORS.DarkYellow);
            }
            
            // Clear target and move on
            this.target = null;
            this.fleet.route = null;
        }
    }

    onNearDestination() {
        // Spread minor culture when passing through destinations (0.1% influence)
        if (this.destination instanceof Planet) {
            this.destination.addCulture(this.fleet.planet, 0.001);
        }
        
        super.onNearDestination()
    }
    
    onDestroyed(destroyedBy = null) {
        // Losing performers slightly reduces culture and morale
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.culture *= 0.98;
        }
        super.onDestroyed(destroyedBy)
    }
}
