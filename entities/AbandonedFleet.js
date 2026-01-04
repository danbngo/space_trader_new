/**
 * Represents an abandoned fleet (destroyed or derelict) in space.
 * @class AbandonedFleet
 * @extends {Fleet}
 */
class AbandonedFleet extends Fleet {
    /**
     * @param {Fleet} originalFleet - The fleet that was abandoned/destroyed.
     */
    constructor(originalFleet) {
        super(
            originalFleet.name,
            originalFleet.planet,
            originalFleet.fleetType,
            originalFleet.factionType,
            [...originalFleet.color].map(c => c * 0.5), // Dimmed color
            originalFleet.x,
            originalFleet.y
        );
        
        // Copy essential properties from original fleet
        this.ships = originalFleet.ships;
        this.cargo = originalFleet.cargo;
        this.equipment = originalFleet.equipment;
        this.captain = originalFleet.captain;
        this.officers = originalFleet.officers;
        this.flagship = originalFleet.flagship;
        this.angle = originalFleet.angle;
        
        // Mark as abandoned
        this.abandoned = true;
        this.abandonedYear = gs.year;
        
        // No AI for abandoned fleets
        this.fleetAI = null;
    }
}
