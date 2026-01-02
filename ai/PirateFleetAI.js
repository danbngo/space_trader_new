/**
 * AI for pirate fleets - hunts merchant ships and raids.
 * @class PirateFleetAI
 * @extends FleetAI
 */
class PirateFleetAI extends FleetAI {
    calcValidTargets() {
        const ourScore = this.fleet.combatRating
        return gs.system.fleets.filter(f => {
            if (f === this.fleet || f.factionType.criminal || f.factionType.authority || f.location) return false
            // Don't attack targets that are 2x stronger
            return f.combatRating <= ourScore * 2
        })
    }
    calcDestination() {
        return rndMember([...gs.system.dwarfPlanets].filter(p=>(p !== this.home)))
    }
    onNearTarget() {
        if (this.target instanceof Fleet && !this.target.location) {
            if (Math.random() > 0.5) {
                this.fightTarget();
            }
        }
    }
}
