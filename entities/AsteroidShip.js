
/**
 * Represents an asteroid ship with specialized properties for space debris.
 * @class AsteroidShip
 * @extends Ship
 */
class AsteroidShip extends Ship {
    /**
     * @param {string} name - The name of the asteroid.
     * @param {ShipType} shipType - The type of the asteroid (should be from ASTEROID_SHIP_TYPES).
     * @param {number[]} color - The RGB color of the asteroid.
     * @param {number[]} hull - The current and maximum hull integrity [current, max].
     * @param {number[]} shields - The current and maximum shield strength [current, max].
     * @param {number} lasers - The laser power of the asteroid.
     * @param {number} engine - The engine power of the asteroid.
     * @param {number} cargoSpace - The cargo space available on the asteroid.
     * @param {number} radars - The radar capability of the asteroid.
     * @param {number} fuelCapacity - The fuel capacity of the asteroid.
     * @param {number} maxActionsPerTurn - The maximum number of actions per turn.
     */
    constructor(name = "Unnamed", shipType = ASTEROID_SHIP_TYPES.ASTEROID, color = COLORS.White, hull = [0, 0], shields = [0, 0], lasers = 0, engine = 0, cargoSpace = 0, radars = 0, fuelCapacity = 0, maxActionsPerTurn = SHIP_NUM_MOVES_PER_TURN) {
        super(name, shipType, color, hull, shields, lasers, engine, cargoSpace, radars, fuelCapacity, maxActionsPerTurn);
        
        // Override radiusModifier for asteroid-specific range
        /** @type {number} */
        this.radiusModifier = this.shipType ? rng(this.shipType.maxRadiusModifier, this.shipType.minRadiusModifier, false) : 4;
        
        // Asteroid-specific properties
        /** @type {number} */
        this.widthModifier = Math.random() + 0.5; // Random width between 0.5 and 1.5 for oval shapes
        
        /** @type {Array<[number, number]>|null} */
        this.asteroidVertices = AsteroidShip.generateShape(); // Generated polygon vertices for rendering
        
        // Apply stat modifier based on asteroid size
        const statModifier = Math.sqrt(this.radiusModifier);
        this.engine = Math.ceil(this.engine / statModifier);
        this.hull[0] = Math.ceil(statModifier * this.hull[0]);
        this.hull[1] = Math.ceil(statModifier * this.hull[1]);
    }

    /**
     * Generates a randomized asteroid shape as an array of vertices.
     * Creates an octagon-like shape with triangle chunks cut out for a rough, rocky appearance.
     * @param {number} baseRadius - The approximate radius of the asteroid (default: 1.0)
     * @param {number} irregularity - How irregular the shape is (0-1, default: 0.35)
     * @param {number} chunkiness - How many chunks are cut out (0-1, default: 0.4)
     * @returns {Array<[number, number]>} Array of [x, y] vertex coordinates normalized to baseRadius
     */
    static generateShape(baseRadius = 1.0, irregularity = 0.35, chunkiness = 0.4) {
        // Start with 8-12 points around a circle (octagon-ish base)
        const numPoints = rng(12, 8);
        const angleStep = (Math.PI * 2) / numPoints;
        /** @type {Array<[number, number]>} */
        const vertices = [];
        
        for (let i = 0; i < numPoints; i++) {
            const angle = angleStep * i;
            // Add irregularity to radius (each point varies)
            const radiusVariation = 1.0 + (Math.random() - 0.5) * irregularity;
            const r = baseRadius * radiusVariation;
            
            // Randomly decide if this should be a "chunk" (indentation)
            const isChunk = Math.random() < chunkiness;
            const chunkDepth = isChunk ? 0.6 + Math.random() * 0.3 : 1.0; // 60-90% depth for chunks
            
            const x = Math.cos(angle) * r * chunkDepth;
            const y = Math.sin(angle) * r * chunkDepth;
            
            vertices.push([x, y]);
        }
        
        return vertices;
    }
}
