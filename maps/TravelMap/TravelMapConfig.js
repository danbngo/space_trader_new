/**
 * Configuration for TravelMap rendering and behavior
 */
const TRAVEL_MAP_CONFIG = {
    // Ship rendering
    shipSpacingX: 60,
    shipSpacingY: 120,
    shipSize: 200,
    labelOffsetY: 30,
    
    // Ship positioning (as fraction of canvas width/zoom)
    playerShipsOffset: -0.2,  // Closer to center
    enemyShipsOffset: 0.2,     // Closer to center
    
    // Jitter settings
    defaultJitterX: 2,
    defaultJitterY: 1,
    jitterUpdateChance: 0.03,
    jitterSmoothness: 0.1,
    
    // Thruster settings
    thrusterSizeMultiplier: 0.2,
    thrusterFlickerMin: 0.9,
    thrusterFlickerMax: 1.0,
    
    // Animation
    enemyFadeInDuration: 2000, // ms
    tickRate: 1000 / 60, // 60 fps
    
    // Camera
    defaultZoom: 60,
    
    // Starfield
    starfieldStarCount: 2000,
    
    // Ship progress bars
    shipBarWidth: 50,
    shipBarHeight: 8,
    shipBarSpacing: 4,
    shipBarYOffset: -10,
    
    // Progress bars
    progressBarHeight: 6,
    progressBarGap: 2,
    progressBarMinWidth: 60,
    progressBarOffsetY: -25,
}
