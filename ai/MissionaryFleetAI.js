/**
 * AI for missionary fleets - spreads faith to worlds without the same religion.
 * @class MissionaryFleetAI
 * @extends FleetAI
 */
class MissionaryFleetAI extends FleetAI {
    calcValidTargets() {
        return [];
    }
    
    calcDestination() {
        // Travel to planets that DON'T have the same state religion as home planet
        if (!this.fleet.planet || !this.fleet.planet.civilization || !this.fleet.planet.civilization.stateReligion) {
            return rndMember([...gs.system.planets].filter(p => p !== this.home));
        }
        
        const homeReligion = this.fleet.planet.civilization.stateReligion;
        const differentReligionPlanets = gs.system.planets.filter(p => 
            p !== this.fleet.planet && 
            p.civilization && 
            p.civilization.stateReligion !== homeReligion
        );
        
        if (differentReligionPlanets.length > 0) {
            return rndMember(differentReligionPlanets);
        }
        
        // Fallback to any planet
        return rndMember([...gs.system.planets].filter(p => p !== this.home));
    }
}
