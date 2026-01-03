/**
 * AI for performer fleets - travels to entertain audiences on various planets.
 * @class PerformerFleetAI
 * @extends FleetAI
 */
class PerformerFleetAI extends FleetAI {
    constructor(fleet = null, origin = null, starMap = null) {
        super(fleet, origin, starMap);
        /** @type {Fleet[]} - Fleets already visited to avoid repeat performances */
        this.visited = [];
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
            // Mark fleet as visited
            this.visited.push(this.target);
            
            // Increase home planet's culture every performance
            if (this.fleet.planet && this.fleet.planet.civilization) {
                this.fleet.planet.c.culture *= 1.0001; // .01% increase
                
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
                    this.target.captain.credits -= creditsToTake;
                    this.fleet.captain.credits += creditsToTake;
                    
                    console.log(`🎭 ${this.fleet.name} performed brilliantly for ${this.target.name} and earned ${creditsToTake} credits!`);
                    
                    // Show performance popup
                    if (this.starMap) {
                        this.starMap.addPopup(this.target.x, this.target.y, '🎭', COLORS.LightYellow);
                    }
                }
            } else {
                console.log(`🎭 ${this.fleet.name} performed for ${this.target.name} but received no payment`);
                
                // Show performance popup
                if (this.starMap) {
                    this.starMap.addPopup(this.target.x, this.target.y, '🎭', COLORS.DarkYellow);
                }
            }
            
            // Clear target and move on
            this.target = null;
            this.route = null;
        }
    }

    onNearDestination() {
        // Spread minor culture when passing through destinations (0.1% influence)
        if (this.destination instanceof Planet) {
            this.destination.addCulture(this.fleet.planet, 0.001);
        }
        
        super.onNearDestination()
    }
    
    onDestroyed() {
        // Losing performers slightly reduces culture and morale
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.culture *= 0.98;
        }
        super.onDestroyed()
    }
}
