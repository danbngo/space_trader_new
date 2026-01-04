/**
 * AI for geneticist fleets - travels between planets researching genetic modifications and offering medical services.
 * @class GeneticistFleetAI
 * @extends FleetAI
 */
class GeneticistFleetAI extends FleetAI {
    constructor(fleet = null, origin = null, starMap = null) {
        super(fleet, origin, starMap);
    }
    
    calcValidTargets() {
        // Geneticists target planets with high population for research opportunities
        const planets = [...gs.system.planets, ...gs.system.dwarfPlanets].filter(p => {
            if (p === this.origin) return false;
            if (!p.civilization) return false;
            if (this.visited.includes(p)) return false;
            return p.civilization.population > 1000000;
        });
        
        return planets;
    }
    
    calcDestination() {
        // Travel to populated planets for research
        const targets = [...gs.system.planets, ...gs.system.dwarfPlanets].filter(p => {
            return p !== this.origin && p.civilization && p.civilization.population > 0;
        });
        
        if (targets.length > 0) {
            return rndMember(targets);
        }
        
        return rndMember([...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.spaceStations].filter(p => p !== this.origin));
    }
    
    onNearTarget() {
        if (this.target && this.target.civilization) {
            this.visited.push(this.target);
            this.conductGeneticResearch(this.target);
        }
    }
    
    conductGeneticResearch(planet) {
        // Geneticists improve health/genetics of target civilization
        if (planet.civilization) {
            // Small boost to population growth from improved health
            planet.civilization.population *= 1.005;
            
            console.log(`🧬 ${this.fleet.name} conducted genetic research at ${planet.name}`);
            this.addPopup('🧬', COLORS.Green, planet.x, planet.y);
        }
    }
    
    onDestroyed() {
        // Losing geneticists slightly reduces health/technology in their origin civilization
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.civilization.population *= 0.98;
        }
        super.onDestroyed();
    }
}
