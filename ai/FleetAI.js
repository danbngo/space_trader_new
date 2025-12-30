/**
 * Base class for AI that controls NPC fleet behavior in the solar system.
 * @class FleetAI
 */
class FleetAI {
    /**
     * @param {Fleet} fleet - The fleet controlled by this AI.
     * @param {Planet} homePlanet - The planet this fleet originated from.
     * @param {Planet} destinationPlanet - The primary destination planet.
     */
    constructor(fleet = null, homePlanet = null, destinationPlanet = null) {
        /** @type {Fleet} */
        this.fleet = fleet;
        /** @type {Planet} */
        this.homePlanet = homePlanet;
        /** @type {Planet} */
        this.destinationPlanet = destinationPlanet;
        /** @type {SpaceObject} */
        this.destination = destinationPlanet;
        /** @type {boolean} */
        this.shouldRemove = false;
        /** @type {any} */
        this.target = null
    }

    /**
     * Updates AI behavior each game tick.
     * @param {number} elapsedYears - Time elapsed since last tick.
     */
    tick(elapsedYears = 0) {
        if (!this.fleet || !this.destination) return;
        
        // Move fleet towards destination
        this.moveTowardsDestination(elapsedYears);
        
        // Check if arrived at destination
        if (this.hasArrivedAtDestination()) {
            this.onArrival();
        }
    }

    /**
     * Moves fleet towards its current destination.
     * @param {number} elapsedYears - Time elapsed.
     */
    moveTowardsDestination(elapsedYears = 0) {
        if (!this.fleet || !this.destination) return;
        
        const dx = this.destination.x - this.fleet.x;
        const dy = this.destination.y - this.fleet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0.001) {
            const speed = this.fleet.speed * elapsedYears;
            const moveDistance = Math.min(speed, distance);
            
            this.fleet.x += (dx / distance) * moveDistance;
            this.fleet.y += (dy / distance) * moveDistance;
        }
    }

    /**
     * Checks if fleet has arrived at destination.
     * @returns {boolean}
     */
    hasArrivedAtDestination() {
        if (!this.fleet || !this.destination) return false;
        
        const dx = this.destination.x - this.fleet.x;
        const dy = this.destination.y - this.fleet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < 0.01; // Within 0.01 AU
    }

    /**
     * Called when fleet arrives at destination.
     */
    onArrival() {
        // Override in subclasses
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
