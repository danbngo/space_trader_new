/**
 * AI for mercenary fleets - hired guns who patrol for their employers.
 * @class MercenaryFleetAI
 * @extends FleetAI
 */
class MercenaryFleetAI extends FleetAI {
    constructor(fleet = null, origin = null, starMap = null) {
        super(fleet, origin, starMap);
    }
    
    calcValidTargets() {
        const ourScore = this.fleet.combatRating
        return gs.system.fleets.filter(f => {
            if (f === this.fleet) return false;
            if (f.location) return false;
            // Skip if already visited
            if (this.visited.includes(f)) return false;
            // Only target fleets with cargo
            if (!f.cargo || f.cargo.total === 0) return false;
            // Don't attack targets that are 2x stronger
            if (f.combatRating > ourScore * 2) return false;
            
            // Attack fleets from planets our employer is at war/tense with
            if (this.fleet.planet && this.fleet.planet.civilization && f.planet && f.planet.civilization) {
                const relationship = this.fleet.planet.c.relationships.get(f.planet)
                if (relationship === RELATIONSHIP_TYPES.WAR) return true;
                if (relationship === RELATIONSHIP_TYPES.TENSE) return true;
            }
            
            return false;
        });
    }
    calcDestination() {
        return rndMember([...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.spaceStations].filter(p=>(p !== this.origin)))
    }
    
    onNearDestination() {
        // Sell stolen cargo at destination and restock (like merchants)
        if (this.destination && this.destination instanceof Planet) {
            this.sellCargoAtMarket(this.destination);
            this.buyCargoFromMarket(this.destination);
        }
        
        super.onNearDestination()
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
            
            if (Math.random() > 0.5) {
                this.fightTarget();
            }
        }
    }
    fightTarget() {
        return super.fightTarget(true)
    }
    onDestroyed(destroyedBy = null) {
        // Losing mercenaries hurts military capacity
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.army *= 0.99;
            this.fleet.planet.c.taxes *= 0.99;
        }
        super.onDestroyed(destroyedBy)
    }
}
