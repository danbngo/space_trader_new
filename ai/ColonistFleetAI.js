/**
 * AI for colonist fleets - travels to establish new colonies.
 * @class ColonistFleetAI
 * @extends FleetAI
 */
class ColonistFleetAI extends FleetAI {
    calcDestination() {
        return rndMember([...gs.system.dwarfPlanets, ...gs.system.spaceStations].filter(p => {
            if (p === this.origin || p === this.fleet.planet) return false
            
            // Don't travel to planets we're at war or tense with
            if (this.fleet.planet && this.fleet.planet.civilization && p.civilization) {
                const relationship = this.fleet.planet.c.relationships.get(p)
                if (relationship === RELATIONSHIP_TYPES.WAR || relationship === RELATIONSHIP_TYPES.TENSE) {
                    return false
                }
            }
            
            return true
        }))
    }

    onNearDestination() {
        if (!(this.fleet.planet instanceof Planet) || !(this.destination instanceof Planet)) {
            return super.onNearDestination()
        }
        
        // Transfer racial/ethnic values from origin to destination (2% influence)
        if (this.fleet.planet.c.races) {
            for (const [race] of this.fleet.planet.c.races.counts.entries()) {
                this.destination.addRace(race, 0.02);
            }
        }
        
        // Transfer cultural values from origin to destination (2% influence)
        if (this.destination instanceof Planet) {
            this.destination.addCulture(this.fleet.planet, 0.05); //mayflower like effect
            this.destination.c.population *= 1.01 //stimulate population growth
            this.destination.c.wealth *= 0.99
            this.destination.c.prestige *= 0.99 //dude you're being colonized!
            this.destination.c.culture *= 0.99
            this.fleet.planet.c.wealth *= 1.01
            this.fleet.planet.c.culture *= 1.01
            this.fleet.planet.c.taxes *= 0.99
        }

        super.onNearDestination()
    }
    onDestroyed() {
        // Losing colonists hurts population growth and morale
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.population *= 0.98;
        }
        super.onDestroyed()
    }
}
