/**
 * AI for soldier/military fleets - patrols territory and responds to threats.
 * @class SoldierFleetAI
 * @extends FleetAI
 */
class SoldierFleetAI extends FleetAI {
    calcValidTargets() {
        const ourScore = this.fleet.combatRating
        return gs.system.fleets.filter(f => {
            if (f === this.fleet) return false;
            if (f.location) return false;
            // Don't attack targets that are 2x stronger
            if (f.combatRating > ourScore * 2) return false;
            
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
        return rndMember([...gs.system.planets].filter(p=>(p !== this.origin)))
    }
    onNearTarget() {
        if (this.target instanceof Fleet && !this.target.location) {
            if (Math.random() > 0.5) {
                this.fightTarget();
            }
        }
    }
    onDestroyed() {
        // Losing soldiers weakens military strength and defense
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.army *= 0.99;
            this.fleet.planet.c.navy *= 0.98;
            this.fleet.planet.c.prestige *= 0.99;
        }
        super.onDestroyed()
    }
}
