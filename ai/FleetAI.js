/**
 * Base class for AI that controls NPC fleet behavior in the solar system.
 * @class FleetAI
 */
class FleetAI {
    /**
     * @param {Fleet} fleet - The fleet controlled by this AI.
     * @param {SpaceObject} home - The planet this fleet originated from.
     */
    constructor(fleet = null, home = null) {
        /** @type {Fleet} */
        this.fleet = fleet;
        /** @type {SpaceObject} */
        this.home = home;
        /** @type {SpaceObject} */
        this.destination = this.calcDestination();
        /** @type {any} */
        this.target = null
        this.voyageYearsRemaining = Infinity
        this.resetVoyageDuration()
    }
    /**
     * Updates AI behavior each game tick.
     */
    tick(elapsedYears = 1) {
        if (!this.fleet || !this.destination) return;
        this.voyageYearsRemaining -= elapsedYears;
        if (this.isNearHome()) {
            this.onNearHome()
            return
        }
        else if (this.isNearDestination()) {
            this.onNearDestination();
            return
        }
        else if (this.isNearTarget()) {
            this.onNearTarget();
            return
        }
        else {
            if (this.voyageYearsRemaining > 0) {
                const target = this.calcTarget()
                if (target && (!this.fleet.route  || this.fleet.route.destination !== target)) {
                    this.setTarget(target);
                    return
                }
            }
        }
        if (!this.fleet.route) {
            this.resumeVoyage()
        }
    }
    /** @returns {Fleet|SpaceObject|null} */
    calcTarget() {        
        //override in subclasses
        return null
    }
    /** @returns {SpaceObject|null} */
    calcDestination() {
        return rndMember(gs.system.planets.filter(p=>(p !== this.home)))
    }

    resetVoyageDuration() {
        this.voyageYearsRemaining = rng(this.fleet.fleetType.voyageMaxYears, this.fleet.fleetType.voyageMinYears);
    }

    setTarget(target) {
        this.target = target
        this.fleet.route = new Route(this.fleet, target)
    }

    /**
     * Checks if fleet has arrived at destination.
     * @returns {boolean}
     */
    isNearDestination() {
        return this.destination && this.isNearby(this.destination)
    }

    isNearHome() {
        return this.isNearby(this.home) && this.voyageYearsRemaining <= 0
    }

    isNearTarget() {
        return this.target && this.isNearby(this.target)
    }

    isNearby(object = new SpaceObject()) {
        if (!this.fleet.route || this.fleet.route.destination !== object) return false;
        return calcDistance(this.fleet.x, this.fleet.y, object.x, object.y) < 0.1 // Within 0.01 AU
    }

    resumeVoyage() {
        this.target = null
        if (this.destination) this.fleet.route = new Route(this.fleet, this.destination)
        else this.fleet.route = new Route(this.fleet, this.home)
    }

    /**
     * Called when fleet arrives at destination.
     */
    onNearHome() {
        this.removeFleet()
    }

    onNearDestination() {
        this.destination = null
        this.resetVoyageDuration()
    }

    onNearTarget() {
        //override in subclass
    }

    removeFleet() {
        console.log(`🗑️ Removing fleet ${this.fleet.name} (mission complete)`)
        gs.system.fleets.splice(gs.system.fleets.indexOf(this.fleet), 1)
    }
    /**
     * Finds nearest object of a given type.
     * @param {SpaceObject[]} objects - Array of space objects to search.
     * @param {number} maxDistance - Maximum distance in AU.
     * @returns {SpaceObject|null}
     */
    findNearest(objects = [], maxDistance = Infinity) {
        if (!this.fleet) return null;
        
        let nearest = null;
        let nearestDist = maxDistance;
        
        for (const obj of objects) {
            const dx = obj.x - this.fleet.x;
            const dy = obj.y - this.fleet.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < nearestDist) {
                nearest = obj;
                nearestDist = dist;
            }
        }
        return nearest;
    }
}
