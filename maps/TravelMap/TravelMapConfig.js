/**
 * Configuration for TravelMap rendering and behavior
 */
const TRAVEL_MAP_CONFIG = {
    // Ship rendering
    shipSpacingX: 60,
    shipSpacingY: 120,
    shipSize: 200,
    shipHitRadius: 80,  // Smaller hit detection radius for more precise clicking
    labelOffsetY: 30,
    
    // Ship positioning (as fraction of canvas width/zoom)
    playerShipsOffset: -0.15,  // Closer to center
    enemyShipsOffset: 0.15,     // Closer to center
    
    // Jitter settings
    defaultJitterX: 2,
    defaultJitterY: 1,
    jitterUpdateChance: 0.03,
    jitterSmoothness: 0.1,
    
    // Thruster settings
    thrusterSizeMultiplier: 0.2,
    thrusterFlickerMin: 0.9,
    thrusterFlickerMax: 1.0,
    thrusterFadeDuration: 300, // ms - fade in/out duration for thrusters
    
    // Animation
    enemyFadeInDuration: 1000, // ms - fade-in duration for enemy ships
    enemyFadeOutDuration: 1000, // ms - fade-out duration for enemy ships
    tickRate: 1000 / 60, // 60 fps
    
    // Camera
    defaultZoom: 60,
    
    // Starfield
    starfieldStarCount: 2000,
    
    // Ship progress bars
    shipBarWidth: 75,
    shipBarHeight: 8,
    shipBarSpacing: 4,
    shipBarYOffset: 60,
    
    // Progress bars
    progressBarHeight: 6,
    progressBarGap: 2,
    progressBarMinWidth: 60,
    progressBarOffsetY: -25,
    
    // Floating text over ships
    floatingTextDuration: 1500, // ms - standardized duration for all floating text
    floatingTextColors: {
        missed: [100, 100, 100, 1],      // Dark gray
        shieldDamage: [100, 150, 255, 1], // Light blue
        hullDamage: [255, 255, 255, 1],   // White
        disabled: [255, 0, 0, 1],         // Red
        selfTotalDamage: [255, 200, 0, 1],     // Orange/yellow
        shieldHeal: [0, 150, 255, 1],     // Blue
        hullHeal: [0, 255, 100, 1],       // Green
    },
    
    // Selection arrow indicator
    selectionArrowSize: 30,      // Size of the arrow triangle
    selectionArrowDistance: 15,  // Distance from ship center
}
