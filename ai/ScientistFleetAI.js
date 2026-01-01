/**
 * AI for scientist fleets - travels between planets for research expeditions.
 * @class ScientistFleetAI
 * @extends FleetAI
 */
class ScientistFleetAI extends FleetAI {
    calcValidTargets() {
        return gs.system.asteroids.filter(a=>a.parent.beltType == ASTEROID_BELT_TYPES.Icy && Math.random() < .2)
    }
    calcDestination() {
        return rndMember([...gs.system.planets].filter(p=>(p !== this.home)))
    }
}
