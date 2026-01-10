/**
 * Configuration for CombatMap rendering and behavior
 */
const COMBAT_MAP_CONFIG = {
    // Ship rendering
    shipSpacing: 60,
    shipSize: 20,
    labelOffsetY: 30,
    
    // Ship positioning (as fraction of canvas width/zoom)
    playerShipsOffset: -0.375,  // 75% to left edge
    enemyShipsOffset: 0.375,     // 75% to right edge
    
    // Jitter settings
    defaultJitterX: 2,
    defaultJitterY: 1,
    jitterUpdateChance: 0.03,
    jitterSmoothness: 0.1,
    
    // Thruster settings
    thrusterSizeMultiplier: 0.2,
    thrusterFlickerMin: 0.7,
    thrusterFlickerMax: 1.0,
    
    // Animation
    enemyFadeInDuration: 2000, // ms
    tickRate: 1000 / 60, // 60 fps
    
    // Camera
    defaultZoom: 60,
    
    // Starfield
    starfieldStarCount: 300,
    
    // Progress bars
    progressBarHeight: 6,
    progressBarGap: 2,
    progressBarMinWidth: 60,
    progressBarOffsetY: -25,
}
