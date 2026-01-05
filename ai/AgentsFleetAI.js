/**
 * AI for covert intelligence operatives - spies, assassins, and black ops.
 * @class AgentsFleetAI
 * @extends FleetAI
 */
class AgentsFleetAI extends FleetAI {
    constructor(fleet = null, origin = null, starMap = null) {
        super(fleet, origin, starMap);
    }
    
    calcValidTargets() {
        const ourScore = this.fleet.combatRating
        const targets = gs.system.fleets.filter(f => {
            if (f === this.fleet || f.location) return false
            // Skip if already visited
            if (this.visited.includes(f)) return false
            
            // Target criminals (but NOT militant ones - we avoid direct combat)
            if (f.factionType.criminal && !f.factionType.militant) {
                // Don't target if they're much stronger
                if (f.combatRating <= ourScore * 2) {
                    return true
                }
            }
            
            // Target cloaked fleets from hostile/tense planets (counter-intelligence operations)
            if (this.fleet.planet && f.planet && this.fleet.planet !== f.planet && f.factionType.cloaked) {
                const relationship = this.fleet.planet.c.relationships.get(f.planet)
                if (relationship === RELATIONSHIP_TYPES.WAR || relationship === RELATIONSHIP_TYPES.TENSE) {
                    return true
                }
            }
            
            return false
        })
        
        return targets
    }
    
    calcDestination() {
        // Patrol between planets
        return rndMember([...gs.system.planets].filter(p=>(p !== this.origin)))
    }
    
    onNearTarget() {
        if (this.target instanceof Fleet && !this.target.location) {
            // Mark as visited
            this.visited.push(this.target);
            
            // Don't automatically interact with player fleet - they get an encounter instead
            if (this.target === gs.fleet) {
                this.target = null;
                this.fleet.route = null;
                return;
            }
            
            const roll = Math.random()
            
            if (roll < 0.25) {
                // 25% - Engage in combat
                console.log(`🕵️ ${this.fleet.name} engages ${this.target.name} in combat!`)
                
                // Boost security stats
                if (this.fleet.planet && this.fleet.planet.civilization) {
                    this.fleet.planet.c.security *= 1.01
                    this.fleet.planet.c.corruption *= 0.99
                }
                
                this.addPopup('⚔️', COLORS.Red)
                this.fightTarget(true);
            } else if (roll < 0.50) {
                // 25% - Assassination: kill all officers (abandon the fleet)
                console.log(`🕵️ ${this.fleet.name} assassinates all officers on ${this.target.name}!`)
                
                // Transfer all officers away (effectively killing them)
                const officersKilled = this.target.officers.length
                this.target.officers = []
                this.target.destroyed = true
                this.target.destroyedBy = this.fleet
                this.target.cloakLevel = 0 // Disable cloaking
                
                // Mark fleet as abandoned
                if (!gs.system.abandonedFleets.includes(this.target)) {
                    gs.system.abandonedFleets.push(this.target)
                }
                
                // Boost intelligence stats for successful black ops
                if (this.fleet.planet && this.fleet.planet.civilization) {
                    this.fleet.planet.c.corruption *= 0.99
                    this.fleet.planet.c.security *= 1.01
                }
                
                // Target planet loses security from the attack
                if (this.target.planet && this.target.planet.civilization) {
                    this.target.planet.c.security *= 0.98
                    this.target.planet.c.corruption *= 0.99
                }
                
                this.addPopup('💀', COLORS.DarkRed)
                if (this.starMap) {
                    this.addPopup('☠️', COLORS.Black, this.target.x, this.target.y)
                }
            } else {
                // 50% - Just surveillance (do nothing visible)
                console.log(`🕵️ ${this.fleet.name} conducts surveillance on ${this.target.name}`)
                
                // Small intelligence boost for gathering info
                if (this.fleet.planet && this.fleet.planet.civilization) {
                    this.fleet.planet.c.security *= 1.001
                }
                
                this.addPopup('👁️', COLORS.Gray)
            }
            
            // Clear target and move on
            this.target = null
            this.fleet.route = null
        }
    }
    
    onDestroyed(destroyedBy = null) {
        // Losing agents reduces intelligence and security
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.corruption *= 1.01
            this.fleet.planet.c.security *= 0.99
        }
        super.onDestroyed(destroyedBy)
    }
}
