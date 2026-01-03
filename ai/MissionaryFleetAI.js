/**
 * AI for missionary fleets - spreads faith by converting captains of other fleets.
 * @class MissionaryFleetAI
 * @extends FleetAI
 */
class MissionaryFleetAI extends FleetAI {
    constructor(fleet = null, origin = null, starMap = null) {
        super(fleet, origin, starMap);
        /** @type {Fleet[]} - Fleets already visited to avoid repeat conversions */
        this.visited = [];
    }
    
    calcValidTargets() {
        // Target fleets with captains of different religion
        if (!this.fleet.captain || !this.fleet.captain.religion) {
            return [];
        }
        
        const ourReligion = this.fleet.captain.religion;
        
        return gs.system.fleets.filter(f => {
            if (f === this.fleet || f.location) return false;
            // Skip criminal and religious fleets
            if (f.factionType.criminal || f.factionType.religious) return false;
            // Skip if already visited
            if (this.visited.includes(f)) return false;
            // Target fleets whose captain has a different religion
            if (!f.captain || !f.captain.religion) return false;
            return f.captain.religion !== ourReligion;
        });
    }
    
    calcDestination() {
        return rndMember([...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.spaceStations].filter(p => p !== this.origin));
    }
    
    onNearTarget() {
        if (this.target instanceof Fleet && !this.target.location) {
            // Mark fleet as visited
            this.visited.push(this.target);
            
            const roll = Math.random();
            
            // 10% chance to be destroyed
            if (roll < 0.1) {
                console.log(`☠️ ${this.fleet.name} was destroyed by ${this.target.name} while proselytizing!`);
                
                // Show skull popup at missionary's death location
                this.starMap.addPopup(this.fleet.x, this.fleet.y, '💀', COLORS.Red);
                
                this.onDestroyed()
                return;
            }
            // 20% chance to convert
            else if (roll < 0.3) {
                const ourReligion = this.fleet.captain.religion;
                this.target.captain.religion = ourReligion;
                
                console.log(`✝️ ${this.fleet.name} converted ${this.target.captain.name} to ${ourReligion.name}!`);
                
                // Show conversion popup
                this.starMap.addPopup(this.target.x, this.target.y, '✝️', COLORS.White);
            } else {
                console.log(`${this.fleet.name} failed to convert ${this.target.captain.name}`);
            }
            
            // Clear target and move on
            this.target = null;
            this.route = null;
        }
    }
    onDestroyed() {
        // Losing missionaries reduces religious cultural influence
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.culture *= 0.99;
            this.fleet.planet.c.prestige *= 0.99;
        }
        super.onDestroyed()
    }
}
