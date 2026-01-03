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
        super(name, OBJECT_TYPES.ANOMALY, anomalyType.color, radius, x, y);
        /** @type {AnomalyType} */
        this.anomalyType = anomalyType;
    }

    /**
     * Checks if this anomaly is detectable by a fleet.
     * @param {Fleet} fleet - The fleet attempting to detect the anomaly.
     * @returns {boolean} True if the anomaly is within detection range.
     */
    detectable(fleet) {
        if (!fleet) return false;
        
        const distance = calcDistance(this.x, this.y, fleet.x, fleet.y);
        
        // Base detection range: 10 AU
        // Science skill: +20% per 50 skill (doubles at 50 skill)
        // Radar: +10% per radar unit
        const scienceSkill = fleet.totalSkills.getAmount(SKILLS.Science) || 0;
        const radarBonus = fleet.totalRadar || 0;
        
        const detectionRange = 10 * (1 + scienceSkill / 50) * (1 + radarBonus / 10);
        
        return distance <= detectionRange;
    }

    /**
     * Called when an entity investigates this anomaly.
     */
    investigate() {
        console.log(`🔬 ${this.name} investigated: ${this.anomalyType.description}`);
    }
}
