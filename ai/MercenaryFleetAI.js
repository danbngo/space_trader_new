/**
 * AI for mercenary fleets - hired guns who patrol for their employers.
 * @class MercenaryFleetAI
 * @extends FleetAI
 */
class MercenaryFleetAI extends FleetAI {
    calcValidTargets() {
        const ourScore = this.fleet.combatRating
        return gs.system.fleets.filter(f => {
            if (f === this.fleet) return false;
            if (f.location) return false;
            // Don't attack targets that are 2x stronger
            if (f.combatRating > ourScore * 2) return false;
            
            // Attack fleets from planets our employer is at war/tense with
            if (this.fleet.planet && this.fleet.planet.civilization && f.planet && f.planet.civilization) {
                const relationship = this.fleet.planet.c.relationships.get(f.planet)
                if (relationship === RELATIONSHIP_TYPES.WAR) return true;
                if (relationship === RELATIONSHIP_TYPES.TENSE && Math.random() < 0.3) return true;
            }
            
            return false;
        });
    }
    calcDestination() {
        return rndMember([...gs.system.planets].filter(p=>(p !== this.origin)))
    }
    onNearTarget() {
        if (this.target instanceof Fleet && !this.target.location) {
            if (Math.random() > 0.4) {
                this.fightTarget();
            }
        }
    }
}
