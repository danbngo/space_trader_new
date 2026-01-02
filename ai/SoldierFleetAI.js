/**
 * AI for soldier/military fleets - patrols territory and responds to threats.
 * @class SoldierFleetAI
 * @extends FleetAI
 */
class SoldierFleetAI extends FleetAI {
    calcValidTargets() {
        return gs.system.fleets.filter(f => {
            if (f === this.fleet) return false;
            
            // Attack criminals
            if (f.factionType.criminal) return true;
            
            // Attack fleets from planets we're at war with
            if (this.fleet.planet && this.fleet.planet.civilization && f.planet && f.planet.civilization) {
                if (Civilization.areAtWar(this.fleet.planet, f.planet)) return true;
            }
            
            return false;
        });
    }
    calcDestination() {
        return rndMember([...gs.system.planets].filter(p=>(p !== this.home)))
    }
    onNearTarget() {
        if (this.target instanceof Fleet) {
            if (Math.random() > 0.5) {
                this.fightTarget();
            }
        }
    }
}
