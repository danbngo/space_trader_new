/**
 * @fileoverview Shape generators for different ship types.
 * Each function returns a Polygon instance with normalized vertices.
 */

const SHIP_SHAPES = {
    /**
     * Scout - Long, skinny triangle for speed
     * @returns {Polygon}
     */
    SCOUT: () => new Polygon([
        [1.2, 0],      // Sharp nose (rotated 90° CCW)
        [-1, 0.3],     // Left rear
        [-0.8, 0],     // Center rear notch
        [-1, -0.3]     // Right rear
    ]),

    /**
     * Tanker - Rectangular with snub nose (top half of hexagon)
     * @returns {Polygon}
     */
    TANKER: () => new Polygon([
        [0.8, 0.3],    // Left front (rotated 90° CCW)
        [0.8, -0.3],   // Right front
        [0, -0.6],     // Right middle
        [-0.8, -0.6],  // Right rear
        [-0.8, 0.6],   // Left rear
        [0, 0.6]       // Left middle
    ]),

    /**
     * Fighter - Compact triangle with wide wings
     * @returns {Polygon}
     */
    FIGHTER: () => new Polygon([
        [0.9, 0],      // Nose (rotated 90° CCW)
        [-0.3, 0.8],   // Left wing
        [-0.8, 0.3],   // Left rear
        [-0.8, -0.3],  // Right rear
        [-0.3, -0.8]   // Right wing
    ]),

    /**
     * Battleship - Large hexagonal shape
     * @returns {Polygon}
     */
    BATTLESHIP: () => new Polygon([
        [1, 0],        // Front (rotated 90° CCW)
        [0.5, -0.7],   // Right front
        [-0.5, -0.7],  // Right rear
        [-1, 0],       // Rear
        [-0.5, 0.7],   // Left rear
        [0.5, 0.7]     // Left front
    ]),

    /**
     * Frigate - Balanced military triangle
     * @returns {Polygon}
     */
    FRIGATE: () => new Polygon([
        [1, 0],        // Nose (rotated 90° CCW)
        [-0.7, 0.5],   // Left rear
        [-0.5, 0],     // Center rear indent
        [-0.7, -0.5]   // Right rear
    ]),

    /**
     * Destroyer - Elongated pentagon with weapon pods
     * @returns {Polygon}
     */
    DESTROYER: () => new Polygon([
        [1.1, 0],      // Front point (rotated 90° CCW)
        [0.2, -0.6],   // Right weapon pod
        [-0.9, -0.4],  // Right rear
        [-0.9, 0.4],   // Left rear
        [0.2, 0.6]     // Left weapon pod
    ]),

    /**
     * Courier Ship - Sleek, aerodynamic delta
     * @returns {Polygon}
     */
    COURIER_SHIP: () => new Polygon([
        [1.3, 0],      // Long nose (rotated 90° CCW)
        [-0.9, 0.4],   // Left
        [-0.9, -0.4]   // Right
    ]),

    /**
     * Passenger Ship - Wide oval/ellipse shape
     * @returns {Polygon}
     */
    PASSENGER_SHIP: () => new Polygon([
        [0.9, 0],      // Front (rotated 90° CCW)
        [0.3, -0.6],   // Right front
        [-0.3, -0.6],  // Right rear
        [-0.9, 0],     // Rear
        [-0.3, 0.6],   // Left rear
        [0.3, 0.6]     // Left front
    ]),

    /**
     * Supply Ship - Box-like with rounded corners
     * @returns {Polygon}
     */
    SUPPLY_SHIP: () => new Polygon([
        [0.7, 0.5],    // Left front (rotated 90° CCW)
        [0.7, -0.5],   // Right front
        [0.5, -0.7],   // Right front corner
        [-0.5, -0.7],  // Right rear corner
        [-0.7, -0.5],  // Right rear
        [-0.7, 0.5],   // Left rear
        [-0.5, 0.7],   // Left rear corner
        [0.5, 0.7]     // Left front corner
    ]),

    /**
     * Blockade Runner - Sleek, narrow wedge
     * @returns {Polygon}
     */
    BLOCKADE_RUNNER: () => new Polygon([
        [1.1, 0],      // Sharp nose (rotated 90° CCW)
        [-1, 0.25],    // Left rear (narrow)
        [-1, -0.25]    // Right rear (narrow)
    ]),

    /**
     * Interceptor - Angular aggressive shape
     * @returns {Polygon}
     */
    INTERCEPTOR: () => new Polygon([
        [0.9, 0],      // Front (rotated 90° CCW)
        [0.2, -0.7],   // Right wing
        [-0.8, -0.5],  // Right rear
        [-0.6, 0],     // Center notch
        [-0.8, 0.5],   // Left rear
        [0.2, 0.7]     // Left wing
    ]),

    /**
     * Jammer - Dish-like shape with protrusions
     * @returns {Polygon}
     */
    JAMMER: () => new Polygon([
        [0.7, 0],      // Front (rotated 90° CCW)
        [0.5, -0.5],   // Right front antenna
        [0, -0.7],     // Right side
        [-0.5, -0.5],  // Right rear antenna
        [-0.7, 0],     // Rear
        [-0.5, 0.5],   // Left rear antenna
        [0, 0.7],      // Left side
        [0.5, 0.5]     // Left front antenna
    ]),

    /**
     * Fire Ship - Flame-like irregular triangle
     * @returns {Polygon}
     */
    FIRE_SHIP: () => new Polygon([
        [1, 0],        // Front point (rotated 90° CCW)
        [0.3, -0.4],   // Right flame
        [-0.5, -0.7],  // Right wing
        [-0.9, -0.2],  // Right rear
        [-0.9, 0.2],   // Left rear
        [-0.5, 0.7],   // Left wing
        [0.3, 0.4]     // Left flame
    ]),

    /**
     * Tug Ship - Compact rectangular with arms
     * @returns {Polygon}
     */
    TUG_SHIP: () => new Polygon([
        [0.6, 0.4],    // Left arm front (rotated 90° CCW)
        [0.3, 0.8],    // Left arm
        [-0.3, 0.8],   // Left arm rear
        [-0.6, 0.4],   // Left body rear
        [-0.6, -0.4],  // Right body rear
        [-0.3, -0.8],  // Right arm rear
        [0.3, -0.8],   // Right arm
        [0.6, -0.4]    // Right arm front
    ]),

    /**
     * Drilling Rig - Industrial box with drill point
     * @returns {Polygon}
     */
    DRILLING_RIG: () => new Polygon([
        [1.2, 0],      // Drill point (rotated 90° CCW)
        [0.8, -0.3],   // Right drill side
        [0.5, -0.6],   // Right body
        [-0.8, -0.6],  // Right rear
        [-0.8, 0.6],   // Left rear
        [0.5, 0.6],    // Left body
        [0.8, 0.3]     // Left drill side
    ]),

    /**
     * Escort Ship - Shield-like protective shape
     * @returns {Polygon}
     */
    ESCORT_SHIP: () => new Polygon([
        [0.8, 0],      // Front (rotated 90° CCW)
        [0.4, -0.7],   // Right front
        [-0.2, -0.8],  // Right side
        [-0.8, -0.5],  // Right rear
        [-0.8, 0.5],   // Left rear
        [-0.2, 0.8],   // Left side
        [0.4, 0.7]     // Left front
    ]),

    /**
     * Utility Ship - Multi-purpose hexagon with tools
     * @returns {Polygon}
     */
    UTILITY_SHIP: () => new Polygon([
        [0.9, 0],      // Front (rotated 90° CCW)
        [0.4, -0.6],   // Right front
        [-0.2, -0.7],  // Right tool
        [-0.9, -0.4],  // Right rear
        [-0.9, 0.4],   // Left rear
        [-0.2, 0.7],   // Left tool
        [0.4, 0.6]     // Left front
    ]),

    /**
     * Starting Ship - Basic balanced triangle
     * @returns {Polygon}
     */
    STARTING_SHIP: () => new Polygon([
        [0.9, 0],      // Nose (rotated 90° CCW)
        [-0.8, 0.5],   // Left
        [-0.8, -0.5]   // Right
    ])
}
