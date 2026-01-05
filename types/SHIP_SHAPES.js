/**
 * @fileoverview Shape generators for different ship types.
 * Each function returns normalized vertices for polygon rendering.
 */

const SHIP_SHAPES = {
    /**
     * Scout - Long, skinny triangle for speed
     * @returns {Array<[number, number]>}
     */
    SCOUT: () => [
        [0, 1.2],      // Sharp nose
        [-0.3, -1],    // Left rear
        [0, -0.8],     // Center rear notch
        [0.3, -1]      // Right rear
    ],

    /**
     * Tanker - Rectangular with snub nose (top half of hexagon)
     * @returns {Array<[number, number]>}
     */
    TANKER: () => [
        [-0.3, 0.8],   // Left front
        [0.3, 0.8],    // Right front
        [0.6, 0],      // Right middle
        [0.6, -0.8],   // Right rear
        [-0.6, -0.8],  // Left rear
        [-0.6, 0]      // Left middle
    ],

    /**
     * Fighter - Compact triangle with wide wings
     * @returns {Array<[number, number]>}
     */
    FIGHTER: () => [
        [0, 0.9],      // Nose
        [-0.8, -0.3],  // Left wing
        [-0.3, -0.8],  // Left rear
        [0.3, -0.8],   // Right rear
        [0.8, -0.3]    // Right wing
    ],

    /**
     * Battleship - Large hexagonal shape
     * @returns {Array<[number, number]>}
     */
    BATTLESHIP: () => [
        [0, 1],        // Front
        [0.7, 0.5],    // Right front
        [0.7, -0.5],   // Right rear
        [0, -1],       // Rear
        [-0.7, -0.5],  // Left rear
        [-0.7, 0.5]    // Left front
    ],

    /**
     * Frigate - Balanced military triangle
     * @returns {Array<[number, number]>}
     */
    FRIGATE: () => [
        [0, 1],        // Nose
        [-0.5, -0.7],  // Left rear
        [0, -0.5],     // Center rear indent
        [0.5, -0.7]    // Right rear
    ],

    /**
     * Destroyer - Elongated pentagon with weapon pods
     * @returns {Array<[number, number]>}
     */
    DESTROYER: () => [
        [0, 1.1],      // Front point
        [0.6, 0.2],    // Right weapon pod
        [0.4, -0.9],   // Right rear
        [-0.4, -0.9],  // Left rear
        [-0.6, 0.2]    // Left weapon pod
    ],

    /**
     * Courier Ship - Sleek, aerodynamic delta
     * @returns {Array<[number, number]>}
     */
    COURIER_SHIP: () => [
        [0, 1.3],      // Long nose
        [-0.4, -0.9],  // Left
        [0.4, -0.9]    // Right
    ],

    /**
     * Passenger Ship - Wide oval/ellipse shape
     * @returns {Array<[number, number]>}
     */
    PASSENGER_SHIP: () => [
        [0, 0.9],      // Front
        [0.6, 0.3],    // Right front
        [0.6, -0.3],   // Right rear
        [0, -0.9],     // Rear
        [-0.6, -0.3],  // Left rear
        [-0.6, 0.3]    // Left front
    ],

    /**
     * Supply Ship - Box-like with rounded corners
     * @returns {Array<[number, number]>}
     */
    SUPPLY_SHIP: () => [
        [-0.5, 0.7],   // Left front
        [0.5, 0.7],    // Right front
        [0.7, 0.5],    // Right front corner
        [0.7, -0.5],   // Right rear corner
        [0.5, -0.7],   // Right rear
        [-0.5, -0.7],  // Left rear
        [-0.7, -0.5],  // Left rear corner
        [-0.7, 0.5]    // Left front corner
    ],

    /**
     * Blockade Runner - Sleek, narrow wedge
     * @returns {Array<[number, number]>}
     */
    BLOCKADE_RUNNER: () => [
        [0, 1.1],      // Sharp nose
        [-0.25, -1],   // Left rear (narrow)
        [0.25, -1]     // Right rear (narrow)
    ],

    /**
     * Interceptor - Angular aggressive shape
     * @returns {Array<[number, number]>}
     */
    INTERCEPTOR: () => [
        [0, 0.9],      // Front
        [0.7, 0.2],    // Right wing
        [0.5, -0.8],   // Right rear
        [0, -0.6],     // Center notch
        [-0.5, -0.8],  // Left rear
        [-0.7, 0.2]    // Left wing
    ],

    /**
     * Jammer - Dish-like shape with protrusions
     * @returns {Array<[number, number]>}
     */
    JAMMER: () => [
        [0, 0.7],      // Front
        [0.5, 0.5],    // Right front antenna
        [0.7, 0],      // Right side
        [0.5, -0.5],   // Right rear antenna
        [0, -0.7],     // Rear
        [-0.5, -0.5],  // Left rear antenna
        [-0.7, 0],     // Left side
        [-0.5, 0.5]    // Left front antenna
    ],

    /**
     * Fire Ship - Flame-like irregular triangle
     * @returns {Array<[number, number]>}
     */
    FIRE_SHIP: () => [
        [0, 1],        // Front point
        [0.4, 0.3],    // Right flame
        [0.7, -0.5],   // Right wing
        [0.2, -0.9],   // Right rear
        [-0.2, -0.9],  // Left rear
        [-0.7, -0.5],  // Left wing
        [-0.4, 0.3]    // Left flame
    ],

    /**
     * Tug Ship - Compact rectangular with arms
     * @returns {Array<[number, number]>}
     */
    TUG_SHIP: () => [
        [-0.4, 0.6],   // Left arm front
        [-0.8, 0.3],   // Left arm
        [-0.8, -0.3],  // Left arm rear
        [-0.4, -0.6],  // Left body rear
        [0.4, -0.6],   // Right body rear
        [0.8, -0.3],   // Right arm rear
        [0.8, 0.3],    // Right arm
        [0.4, 0.6]     // Right arm front
    ],

    /**
     * Drilling Rig - Industrial box with drill point
     * @returns {Array<[number, number]>}
     */
    DRILLING_RIG: () => [
        [0, 1.2],      // Drill point
        [0.3, 0.8],    // Right drill side
        [0.6, 0.5],    // Right body
        [0.6, -0.8],   // Right rear
        [-0.6, -0.8],  // Left rear
        [-0.6, 0.5],   // Left body
        [-0.3, 0.8]    // Left drill side
    ],

    /**
     * Escort Ship - Shield-like protective shape
     * @returns {Array<[number, number]>}
     */
    ESCORT_SHIP: () => [
        [0, 0.8],      // Front
        [0.7, 0.4],    // Right front
        [0.8, -0.2],   // Right side
        [0.5, -0.8],   // Right rear
        [-0.5, -0.8],  // Left rear
        [-0.8, -0.2],  // Left side
        [-0.7, 0.4]    // Left front
    ],

    /**
     * Utility Ship - Multi-purpose hexagon with tools
     * @returns {Array<[number, number]>}
     */
    UTILITY_SHIP: () => [
        [0, 0.9],      // Front
        [0.6, 0.4],    // Right front
        [0.7, -0.2],   // Right tool
        [0.4, -0.9],   // Right rear
        [-0.4, -0.9],  // Left rear
        [-0.7, -0.2],  // Left tool
        [-0.6, 0.4]    // Left front
    ],

    /**
     * Starting Ship - Basic balanced triangle
     * @returns {Array<[number, number]>}
     */
    STARTING_SHIP: () => [
        [0, 0.9],      // Nose
        [-0.5, -0.8],  // Left
        [0.5, -0.8]    // Right
    ]
}
