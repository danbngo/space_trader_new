/**
 * Generates anomalies in random locations within the star system.
 * @param {number} count - Number of anomalies to generate.
 * @param {number} minDistance - Minimum distance from system center in AU.
 * @param {number} maxDistance - Maximum distance from system center in AU.
 * @returns {Anomaly[]} Array of generated anomalies.
 */
function generateAnomalies(count = 1, minDistance = 5, maxDistance = SOLAR_SYSTEM_RADIUS_IN_AU) {
    const anomalies = [];
    const anomalyTypes = ANOMALY_TYPES_ALL;
    
    for (let i = 0; i < count; i++) {
        // Random position within the system
        const angle = Math.random() * Math.PI * 2;
        const distance = minDistance + Math.random() * (maxDistance - minDistance);
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        // Random anomaly type
        const anomalyType = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];
        
        // Generate unique name
        const name = `${anomalyType.name} ${String.fromCharCode(65 + i)}`;
        
        // Small radius (visual size)
        const radius = 0.05 + Math.random() * 0.1;
        
        const anomaly = new Anomaly(name, anomalyType, x, y, radius);
        anomalies.push(anomaly);
    }
    
    return anomalies;
}

/**
 * Generates a single anomaly at a random location.
 * @param {number} minDistance - Minimum distance from system center in AU.
 * @param {number} maxDistance - Maximum distance from system center in AU.
 * @returns {Anomaly} A generated anomaly.
 */
function generateAnomaly(minDistance = 5, maxDistance = SOLAR_SYSTEM_RADIUS_IN_AU) {
    return generateAnomalies(1, minDistance, maxDistance)[0];
}
