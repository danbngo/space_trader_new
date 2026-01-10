/*
StarMap
ticket speed: 1 hour per real life second
default zoom distances: 1200px = half the size of the solar system
*/

/**
 * Debug configuration for StarMap rendering performance
 * Set any value to false to skip that element's computation and rendering entirely
 */
const STARMAP_DEBUG_CONFIG = {
    displayBackgroundStars: true,    // Background stars (5000+ pixels updated every frame)
    displayAsteroids: true,           // Floating asteroids
    displayOrbits: true,              // Orbital path circles
    displayStars: true,               // Sun/stars
    displayPlanets: true,             // Planets and dwarf planets (with shadows)
    displayPlanetLabels: true,        // Planet name labels
    displaySpaceStations: true,       // Space stations
    displayAnomalies: true,           // Anomalies
    displayRuins: true,               // Ancient ruins
    displayFleets: true,              // All fleets (player + NPC)
    displayFleetLabels: true,         // Fleet name labels
    displayFleetPaths: true,          // Fleet route lines
    displayFleetThrusters: true,      // Fleet thruster effects
    displayAbandonedFleets: true,     // Abandoned/destroyed fleets
    
    // Performance monitoring
    logPerformance: false,            // Log render times to console
};
