/**
 * AI for scientist fleets - travels between planets for research expeditions.
 * @class ScientistFleetAI
 * @extends FleetAI
 */
class ScientistFleetAI extends FleetAI {
    calcTarget() {
        const phenomena = gs.system.asteroids.filter(a=>a.parent.beltType == ASTEROID_BELT_TYPES.Icy && Math.random() < .2)
        return this.findNearest(phenomena, 10);
    }
    calcDestination() {
        return rndMember([...gs.system.planets].filter(p=>(p !== this.home)))
    }
}
