/**
 * AI for inquisitor fleets - enforces religious doctrine by converting or purging heretics.
 * @class InquisitorFleetAI
 * @extends FleetAI
 */
class InquisitorFleetAI extends FleetAI {
    constructor(fleet = null, origin = null, starMap = null) {
        super(fleet, origin, starMap);
    }
    
    calcValidTargets() {
        const ourScore = this.fleet.combatRating
        
        // Need our planet to have a state religion
        if (!this.fleet.planet || !this.fleet.planet.civilization || !this.fleet.planet.civilization.stateReligion) {
            return [];
        }
        
        const ourReligion = this.fleet.planet.civilization.stateReligion;
        
        return gs.system.fleets.filter(f => {
            if (f === this.fleet || f.location) return false;
            // Skip if already visited
            if (this.visited.includes(f)) return false;
            // Don't attack targets that are 2x stronger
            if (f.combatRating > ourScore * 2) return false;
            // Target fleets whose captain has a different religion
            if (!f.captain || !f.captain.religion) return false;
            return f.captain.religion !== ourReligion;
        });
    }
    
    onNearTarget() {
        if (this.target instanceof Fleet && !this.target.location) {
            // Don't automatically interact with player fleet - they get an encounter instead
            if (this.target === gs.fleet) {
                this.target = null;
                this.fleet.route = null;
                return;
            }
            
            // Mark as visited
            this.visited.push(this.target);
            
            const ourReligion = this.fleet.planet.civilization.stateReligion;
            
            // Find co-religionists using utility
            const coReligionists = this.target.findOfficersMatching(o => o.religion === ourReligion);
            
            // If we have co-religionists aboard, 50% chance to abduct heretics
            if (coReligionists.length > 0 && Math.random() < 0.5) {
                // Find heretics - can include captain IF there's a co-religionist to replace them
                const captainIsHeretic = this.target.captain && this.target.captain.religion !== ourReligion;
                const canRemoveCaptain = captainIsHeretic && coReligionists.length > 0; // At least 1 replacement
                
                // Take ALL heretics regardless of rank using transferOfficers
                const hereticFilter = (o) => o.religion !== ourReligion;
                this.transferOfficers(this.target, this.fleet, hereticFilter, '⚖️', COLORS.DarkRed, '💔', COLORS.Gray);
                
                this.target = null;
                this.fleet.route = null;
                return;
            }
            
            // 60% chance to let target go (up from 50%), 40% chance to convert or fight
            if (Math.random() < 0.6) {
                // Let them go - "Their sins are minor, not worth our attention"
                this.target = null;
                this.fleet.route = null;
                return;
            }
            
            // 50% chance to convert captain, 50% chance to fight
            if (Math.random() < 0.5) {
                // Convert captain using utility
                this.convertToReligion(this.target, ourReligion);
                
                // Home planet gains culture and prestige from successful conversion
                if (this.fleet.planet && this.fleet.planet.civilization) {
                    this.fleet.planet.c.culture *= 1.01
                    this.fleet.planet.c.prestige *= 1.01
                }
                
                this.target = null;
                this.fleet.route = null;
            } else {
                this.fightTarget();
            }
        }
    }
    
    fightTarget() {
        // Reduce corruption and culture for both sides when inquisitors fight
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.corruption *= 0.99
            this.fleet.planet.c.culture *= 0.99
        }
        if (this.target && this.target.planet && this.target.planet.civilization) {
            this.target.planet.c.corruption *= 0.99
            this.target.planet.c.culture *= 0.99
        }
        
        return super.fightTarget()
    }
    
    calcDestination() {
        // Travel to planets with the same state religion as origin planet
        if (!this.fleet.planet || !this.fleet.planet.civilization || !this.fleet.planet.civilization.stateReligion) {
            return rndMember([...gs.system.planets].filter(p => p !== this.origin));
        }
        
        const homeReligion = this.fleet.planet.civilization.stateReligion;
        const sameReligionPlanets = gs.system.planets.filter(p => 
            p !== this.origin && 
            p.civilization && 
            p.civilization.stateReligion === homeReligion
        );
        
        if (sameReligionPlanets.length > 0) {
            return rndMember(sameReligionPlanets);
        }
        
        // Fallback to any planet
        return rndMember([...gs.system.planets].filter(p => p !== this.origin));
    }
    onDestroyed(destroyedBy = null) {
        // Losing inquisitors weakens religious authority and control
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.culture *= 1.01;
            this.fleet.planet.c.education *= 1.01;
            this.fleet.planet.c.security *= 0.98;
        }
        super.onDestroyed(destroyedBy)
    }
}
