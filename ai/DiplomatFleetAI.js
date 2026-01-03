/**
 * AI for diplomat fleets - travels between planets to conduct diplomacy.
 * @class DiplomatFleetAI
 * @extends FleetAI
 */
class DiplomatFleetAI extends FleetAI {
    calcDestination() {
        return rndMember([...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.spaceStations].filter(p=>(p !== this.origin)))
    }
    
    onNearDestination() {
        if (this.fleet.planet && this.fleet.planet.civilization && this.destination instanceof Planet && this.destination.civilization) {
            // Grant small prestige boost to home planet
            this.fleet.planet.c.prestige *= 1.01
            
            // 10% chance to improve relationship
            if (Math.random() < 0.1) {
                const currentRelationship = this.fleet.planet.c.relationships.get(this.destination)
                
                // Improve relationship by one step
                if (currentRelationship === RELATIONSHIP_TYPES.WAR) {
                    this.fleet.planet.c.relationships.set(this.destination, RELATIONSHIP_TYPES.TENSE)
                    this.destination.c.relationships.set(this.fleet.planet, RELATIONSHIP_TYPES.TENSE)
                    console.log(`🕊️ ${this.fleet.name} improved relations: ${this.fleet.planet.name} and ${this.destination.name} are no longer at war`)
                } else if (currentRelationship === RELATIONSHIP_TYPES.TENSE) {
                    this.fleet.planet.c.relationships.set(this.destination, RELATIONSHIP_TYPES.NEUTRAL)
                    this.destination.c.relationships.set(this.fleet.planet, RELATIONSHIP_TYPES.NEUTRAL)
                    console.log(`🕊️ ${this.fleet.name} improved relations: ${this.fleet.planet.name} and ${this.destination.name} are now neutral`)
                } else if (currentRelationship === RELATIONSHIP_TYPES.NEUTRAL) {
                    this.fleet.planet.c.relationships.set(this.destination, RELATIONSHIP_TYPES.ALLY)
                    this.destination.c.relationships.set(this.fleet.planet, RELATIONSHIP_TYPES.ALLY)
                    console.log(`🕊️ ${this.fleet.name} improved relations: ${this.fleet.planet.name} and ${this.destination.name} formed an alliance`)
                }
                
                // Show diplomacy popup
                if (this.starMap) {
                    this.starMap.addPopup(this.fleet.x, this.fleet.y, '🕊️', COLORS.White)
                }
            }
        }
        
        super.onNearDestination()
    }
    onDestroyed() {
        // Losing diplomats hurts prestige and diplomatic standing
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.prestige *= 0.98;
        }
        super.onDestroyed()
    }
}
