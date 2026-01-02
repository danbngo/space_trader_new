/**
 * AI for pilgrim fleets - travels to holy sites with the same state religion.
 * @class PilgrimFleetAI
 * @extends FleetAI
 */
class PilgrimFleetAI extends FleetAI {
    calcValidTargets() {
        return [];
    }
    
    calcDestination() {
        // Travel to planets with the same state religion as home planet
        if (!this.fleet.planet || !this.fleet.planet.civilization || !this.fleet.planet.civilization.stateReligion) {
            return rndMember([...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.spaceStations].filter(p => p !== this.origin));
        }
        
        const homeReligion = this.fleet.planet.civilization.stateReligion;
        const sameReligionPlanets = [...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.spaceStations].filter(p => 
            p !== this.fleet.planet && 
            p.civilization && 
            p.civilization.stateReligion === homeReligion
        );
        
        if (sameReligionPlanets.length > 0) {
            return rndMember(sameReligionPlanets);
        }
        
        // Fallback to any planet
        return rndMember([...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.spaceStations].filter(p => p !== this.origin));
    }
}
