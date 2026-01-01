/**
 * Represents a space anomaly that can be investigated by scientists.
 * @class Anomaly
 * @extends SpaceObject
 */
class Anomaly extends SpaceObject {
    /**
     * @param {string} name - The name of the anomaly.
     * @param {AnomalyType} anomalyType - The type of anomaly.
     * @param {number} x - The x-coordinate in AU.
     * @param {number} y - The y-coordinate in AU.
     * @param {number} radius - The radius of the anomaly in AU.
     */
    constructor(name = "Unknown Anomaly", anomalyType = ANOMALY_TYPES.QUANTUM_FLUCTUATION, x = 0, y = 0, radius = 0.1) {
        super(name, anomalyType.color, radius, x, y);
        /** @type {AnomalyType} */
        this.anomalyType = anomalyType;
    }

    /**
     * Called when an entity investigates this anomaly.
     */
    investigate() {
        console.log(`🔬 ${this.name} investigated: ${this.anomalyType.description}`);
    }
}
