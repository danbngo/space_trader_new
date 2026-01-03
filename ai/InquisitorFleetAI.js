/**
 * AI for inquisitor fleets - enforces religious doctrine by converting or purging heretics.
 * @class InquisitorFleetAI
 * @extends FleetAI
 */
class InquisitorFleetAI extends FleetAI {
    constructor(fleet = null, origin = null, starMap = null) {
        super(fleet, origin, starMap);
        /** @type {Fleet[]} */
        this.visited = [];
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
            // Mark as visited
            this.visited.push(this.target);
            
            const ourReligion = this.fleet.planet.civilization.stateReligion;
            
            // Check if there's at least one person of our religion aboard target ship
            let hasOurReligion = false;
            if (this.target.captain && this.target.captain.religion === ourReligion) {
                hasOurReligion = true;
            }
            if (this.target.captain && this.target.subordinates) {
                for (const officer of this.target.subordinates) {
                    if (officer.religion === ourReligion) {
                        hasOurReligion = true;
                        break;
                    }
                }
            }
            
            // If we have co-religionists aboard, 50% chance to purge heretics
            if (hasOurReligion && Math.random() < 0.5) {
                // Take all officers who don't share our religion
                const hereticOfficers = [];
                if (this.target.captain && this.target.subordinates) {
                    for (const officer of this.target.subordinates) {
                        if (officer.religion !== ourReligion) {
                            hereticOfficers.push(officer);
                        }
                    }
                }
                
                // Transfer heretic officers
                for (const officer of hereticOfficers) {
                    this.target.removeOfficer(officer);
                    //this.fleet.captain.addSubordinate(officer); //no need
                }
                
                if (hereticOfficers.length > 0) {
                    console.log(`⚖️ ${this.fleet.name} purged ${hereticOfficers.length} heretics from ${this.target.name}`);
                    
                    // Show purge popup
                    if (this.starMap) {
                        this.starMap.addPopup(this.target.x, this.target.y, '⚖️', COLORS.DarkRed);
                    }
                }
                
                this.target = null;
                this.route = null;
                return;
            }
            
            // 50% chance to convert captain, 50% chance to fight
            if (Math.random() < 0.5) {
                // Convert captain to our religion
                this.target.captain.religion = ourReligion;
                console.log(`✝️ ${this.fleet.name} converted ${this.target.captain.name} to ${ourReligion.name}`);
                
                // Show conversion popup
                if (this.starMap) {
                    this.starMap.addPopup(this.target.x, this.target.y, '✝️', COLORS.White);
                }
                
                this.target = null;
                this.route = null;
            } else {
                this.fightTarget();
            }
        }
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
    onDestroyed() {
        // Losing inquisitors weakens religious authority and control
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.culture *= 1.01;
            this.fleet.planet.c.education *= 1.01;
            this.fleet.planet.c.security *= 0.98;
        }
        super.onDestroyed()
    }
}
