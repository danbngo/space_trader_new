/**
 * AI for miner fleets - mines asteroids and returns home when cargo is full.
 * @class MinerFleetAI
 * @extends FleetAI
 */
class MinerFleetAI extends FleetAI {
    calcTarget() {
        //introduce some fuzz so ship will move around
        const asteroids = (gs.system.asteroids || []).filter(a=>(Math.random() < .2))
        return this.findNearest(asteroids, 8);
    }
    calcDestination() {
        return rndMember([...gs.system.planets].filter(p=>(p !== this.home)))
    }
}
