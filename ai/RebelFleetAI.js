/**
 * AI for rebel fleets - travels around seeking to oppose authority, specifically targeting fleets from their home planet.
 * @class RebelFleetAI
 * @extends FleetAI
 */
class RebelFleetAI extends FleetAI {
    calcDestination() {
        return rndMember([...gs.system.planets].filter(p=>(p !== this.home)))
    }
    calcValidTargets() {
        const ourScore = this.fleet.combatRating
        return gs.system.fleets.filter(f => {
            if (f === this.fleet || f.planet !== this.home || f.location) return false
            // Don't attack targets that are 2x stronger
            return f.combatRating <= ourScore * 2
        })
    }
    onNearTarget() {
        if (this.target instanceof Fleet && !this.target.location) {
            // Always fight fleets from their home planet
            this.fightTarget();
        }
    }
}
