/**
 * AI for colonist fleets - travels to establish new colonies.
 * @class ColonistFleetAI
 * @extends FleetAI
 */
class ColonistFleetAI extends FleetAI {
    calcDestination() {
        return rndMember([...gs.system.planets, ...gs.system.dwarfPlanets, ...gs.system.spaceStations].filter(p => {
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
        
        // Calculate population transfer ratio (10% of origin's relative population)
        const populationRatio = this.fleet.planet.c.population / (this.fleet.planet.c.population + this.destination.c.population) * 0.1
        
        // Transfer racial/ethnic values from origin to destination
        if (this.fleet.planet.c.races && this.destination.c.races) {
            for (const [race, amount] of this.fleet.planet.c.races.counts.entries()) {
                const transferAmount = amount * populationRatio
                this.destination.c.races.increment(race, transferAmount)
            }
            // Normalize to ensure total stays at 1
            this.destination.c.races.normalize()
        }

        super.onNearDestination()
    }
}
