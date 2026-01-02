/**
 * AI for inquisitor fleets - enforces religious doctrine on worlds with the same faith.
 * @class InquisitorFleetAI
 * @extends FleetAI
 */
class InquisitorFleetAI extends FleetAI {
    calcValidTargets() {
        const ourScore = this.fleet.combatRating
        return gs.system.fleets.filter(f => {
            if (f === this.fleet) return false;
            if (f.location) return false;
            // Don't attack targets that are 2x stronger
            if (f.combatRating > ourScore * 2) return false;
            // Attack fleets from planets with different state religions
            if (this.fleet.planet && this.fleet.planet.civilization && this.fleet.planet.civilization.stateReligion &&
                f.planet && f.planet.civilization && f.planet.civilization.stateReligion) {
                if (this.fleet.planet.civilization.stateReligion !== f.planet.civilization.stateReligion) {
                    return true;
                }
            }
            
            return false;
        });
    }
    
    onNearTarget() {
        if (this.target instanceof Fleet && !this.target.location) {
            if (Math.random() > 0.5) {
                this.fightTarget();
            }
        }
    }
    
    calcDestination() {
        // Travel to planets with the same state religion as home planet
        if (!this.fleet.planet || !this.fleet.planet.civilization || !this.fleet.planet.civilization.stateReligion) {
            return rndMember([...gs.system.planets].filter(p => p !== this.home));
        }
        
        const homeReligion = this.fleet.planet.civilization.stateReligion;
        const sameReligionPlanets = gs.system.planets.filter(p => 
            p !== this.home && 
            p.civilization && 
            p.civilization.stateReligion === homeReligion
        );
        
        if (sameReligionPlanets.length > 0) {
            return rndMember(sameReligionPlanets);
        }
        
        // Fallback to any planet
        return rndMember([...gs.system.planets].filter(p => p !== this.home));
    }
}
