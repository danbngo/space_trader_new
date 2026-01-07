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
     * Battleship - Large angular forward shape with broad shoulders
     * @returns {Polygon}
     */
    BATTLESHIP: () => new Polygon([
        [1, 0],        // Front point (rotated 90° CCW)
        [0.3, -0.8],   // Right shoulder
        [-0.6, -0.7],  // Right rear
        [-0.9, 0],     // Center rear notch
        [-0.6, 0.7],   // Left rear
        [0.3, 0.8]     // Left shoulder
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
     * Passenger Ship - Wide forward-swept passenger cruiser
     * @returns {Polygon}
     */
    PASSENGER_SHIP: () => new Polygon([
        [1, 0],        // Front nose (rotated 90° CCW)
        [0.2, -0.7],   // Right mid-section
        [-0.7, -0.6],  // Right rear
        [-0.9, 0],     // Rear center
        [-0.7, 0.6],   // Left rear
        [0.2, 0.7]     // Left mid-section
    ]),

    /**
     * Supply Ship - Broad cargo hauler with forward taper
     * @returns {Polygon}
     */
    SUPPLY_SHIP: () => new Polygon([
        [0.9, 0],      // Front center (rotated 90° CCW)
        [0.5, -0.6],   // Right front
        [0, -0.8],     // Right cargo hold
        [-0.7, -0.7],  // Right rear
        [-0.9, 0],     // Rear center
        [-0.7, 0.7],   // Left rear
        [0, 0.8],      // Left cargo hold
        [0.5, 0.6]     // Left front
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
     * Jammer - Forward antenna array with emitter dishes
     * @returns {Polygon}
     */
    JAMMER: () => new Polygon([
        [1.1, 0],      // Front antenna (rotated 90° CCW)
        [0.4, -0.6],   // Right front dish
        [0, -0.8],     // Right side emitter
        [-0.6, -0.5],  // Right rear
        [-0.9, 0],     // Rear center
        [-0.6, 0.5],   // Left rear
        [0, 0.8],      // Left side emitter
        [0.4, 0.6]     // Left front dish
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
     * Tug Ship - Forward gripping arms with main body
     * @returns {Polygon}
     */
    TUG_SHIP: () => new Polygon([
        [1, 0],        // Front grip center (rotated 90° CCW)
        [0.7, -0.5],   // Right grip arm
        [0.2, -0.7],   // Right body
        [-0.8, -0.5],  // Right rear
        [-0.8, 0.5],   // Left rear
        [0.2, 0.7],    // Left body
        [0.7, 0.5]     // Left grip arm
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
     * Observer - Forward scanning vessel with sensor arrays
     * @returns {Polygon}
     */
    OBSERVER: () => new Polygon([
        [1, 0],        // Front scanner (rotated 90° CCW)
        [0.4, -0.6],   // Right front sensor
        [0.1, -0.8],   // Right sensor array
        [-0.5, -0.6],  // Right side
        [-0.9, 0],     // Rear center
        [-0.5, 0.6],   // Left side
        [0.1, 0.8],    // Left sensor array
        [0.4, 0.6]     // Left front sensor
    ]),

    /**
     * Starting Ship - Basic balanced triangle
     * @returns {Polygon}
     */
    STARTING_SHIP: () => new Polygon([
        [-0.953, -0.093],
        [-0.767, -0.093],
        [-0.767, -0.186],
        [-0.860, -0.186],
        [-0.860, -0.465],
        [-0.581, -0.465],
        [-0.953, -0.837],
        [-0.953, -0.930],
        [-0.023, -0.930],
        [-0.023, -0.837],
        [-0.488, -0.837],
        [-0.302, -0.558],
        [0.349, -0.558],
        [0.349, -0.465],
        [-0.023, -0.465],
        [0.163, -0.186],
        [0.628, -0.186],
        [1.000, -0.093],
        [1.000, 0.093],
        [0.628, 0.186],
        [0.163, 0.186],
        [-0.023, 0.465],
        [0.349, 0.465],
        [0.349, 0.558],
        [-0.302, 0.558],
        [-0.488, 0.837],
        [-0.023, 0.837],
        [-0.023, 0.930],
        [-0.953, 0.930],
        [-0.953, 0.837],
        [-0.581, 0.465],
        [-0.860, 0.465],
        [-0.860, 0.186],
        [-0.767, 0.186],
        [-0.767, 0.093],
        [-0.953, 0.093],
        [-0.953, -0.093]
    ])
}
