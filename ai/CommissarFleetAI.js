/**
 * AI for commissar fleets - enforces political loyalty by executing ideologically impure officers.
 * @class CommissarFleetAI
 * @extends FleetAI
 */
class CommissarFleetAI extends FleetAI {
    constructor(fleet = null, origin = null, starMap = null) {
        super(fleet, origin, starMap);
    }
    
    calcValidTargets() {
        // Target fleets from the same planet without criminal flag
        if (!this.fleet.planet || !this.fleet.planet.civilization) {
            return [];
        }
        
        const ourPlanet = this.fleet.planet;
        
        return gs.system.fleets.filter(f => {
            if (f === this.fleet || f.location) return false;
            // Skip if already visited
            if (this.visited.includes(f)) return false;
            // Only target fleets from the same planet
            if (f.planet !== ourPlanet) return false;
            // Skip criminal fleets
            if (f.factionType.criminal) return false;
            // Need a captain to check
            if (!f.captain) return false;
            return true;
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
            
            const captain = this.target.captain;
            if (!captain || !this.fleet.planet || !this.fleet.planet.civilization) {
                this.target = null;
                this.fleet.route = null;
                return;
            }
            
            const civ = this.fleet.planet.civilization;
            let isPoliticallyImpure = false;
            
            // Check for different state religion
            if (civ.stateReligion && captain.religion !== civ.stateReligion) {
                isPoliticallyImpure = true;
            }
            
            // Check for different ethnicity from major race
            if (civ.races && civ.races.counts.size > 0) {
                // Find the major race (highest count)
                let majorRace = null;
                let maxCount = 0;
                for (const [race, count] of civ.races.counts.entries()) {
                    if (count > maxCount) {
                        maxCount = count;
                        majorRace = race;
                    }
                }
                if (majorRace && captain.race !== majorRace) {
                    isPoliticallyImpure = true;
                }
            }
            
            // Check for different culture from majority planet
            if (captain.planet !== this.fleet.planet) {
                // Captain is from a different cultural origin
                isPoliticallyImpure = true;
            }
            
            if (!isPoliticallyImpure) {
                // Captain is politically acceptable
                this.target = null;
                this.fleet.route = null;
                return;
            }
            
            // Politically impure captain detected
            const roll = Math.random();
            
            if (roll < 0.25) {
                // Execute the captain
                console.log(`☠️ ${this.fleet.name} executed ${captain.name} for political impurity`);
                this.addPopup('☠️', COLORS.DarkRed, this.target.x, this.target.y);
                
                // Transfer crew to rotate someone else into captain position
                // Then immediately execute the transferred officer
                const officersToExecute = [captain];
                for (const officer of officersToExecute) {
                    this.target.removeOfficer(officer);
                }
                
                // Try to restore captain from remaining officers if possible
                if (!this.target.captain && this.target.officers.length > 0) {
                    this.target.captain = this.target.officers[0];
                    console.log(`👤 ${this.target.officers[0].name} became new captain of ${this.target.name}`);
                }
                
                // If no officers remain, target fleet becomes abandoned (handled by transferOfficers)
                if (this.target.officers.length === 0 && this.target.fleetAI && !this.target.destroyed) {
                    console.log(`☠️ ${this.target.name} has no crew remaining - moving to abandoned fleets`);
                    this.target.fleetAI.onDestroyed(this.fleet);
                }
                
                // Home planet gains security, loses culture
                if (this.fleet.planet.civilization) {
                    this.fleet.planet.c.security *= 1.01;
                    this.fleet.planet.c.culture *= 0.99;
                }
            } else if (roll < 0.5) {
                // Combat
                console.log(`⚔️ ${this.fleet.name} engaging ${this.target.name} for political impurity`);
                this.fightTarget();
                
                // Home planet gains security, loses culture
                if (this.fleet.planet && this.fleet.planet.civilization) {
                    this.fleet.planet.c.security *= 1.01;
                    this.fleet.planet.c.culture *= 0.99;
                }
                return;
            }
            // else: 50% chance nothing happens
            
            this.target = null;
            this.fleet.route = null;
        }
    }
    
    fightTarget() {
        // Reduce culture for both sides when commissars fight
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.culture *= 0.99;
        }
        if (this.target && this.target.planet && this.target.planet.civilization) {
            this.target.planet.c.culture *= 0.99;
        }
        
        return super.fightTarget();
    }
    
    calcDestination() {
        // Patrol near home planet or planets with similar government
        if (!this.fleet.planet) {
            return rndMember([...gs.system.planets].filter(p => p !== this.origin));
        }
        
        const homeGov = this.fleet.planet.civilization?.governmentType;
        if (homeGov) {
            const similarGovPlanets = gs.system.planets.filter(p => 
                p !== this.origin && 
                p.civilization && 
                p.civilization.governmentType === homeGov
            );
            
            if (similarGovPlanets.length > 0) {
                return rndMember(similarGovPlanets);
            }
        }
        
        // Fallback to any planet
        return rndMember([...gs.system.planets].filter(p => p !== this.origin));
    }
    
    onDestroyed(destroyedBy = null) {
        // Losing commissars weakens security and increases freedom/culture
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.security *= 0.98;
            this.fleet.planet.c.culture *= 1.02;
        }
        super.onDestroyed(destroyedBy);
    }
}
