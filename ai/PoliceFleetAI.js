/**
 * AI for police fleets - patrols and chases pirates.
 * @class PoliceFleetAI
 * @extends FleetAI
 */
class PoliceFleetAI extends FleetAI {
    calcValidTargets() {
        const ourScore = this.fleet.combatRating
        return gs.system.fleets.filter(f => {
            if (f === this.fleet || !f.factionType.criminal || f.location) return false
            // Don't attack targets that are 2x stronger
            return f.combatRating <= ourScore * 2
        })
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
        // Losing police increases crime and reduces security
        if (this.fleet.planet && this.fleet.planet.civilization) {
            this.fleet.planet.c.crime *= 1.01;
            this.fleet.planet.c.security *= 0.99;
        }
        super.onDestroyed()
    }
}
