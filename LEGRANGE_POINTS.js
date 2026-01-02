/**
 * Lagrange points for major planets in the solar system.
 * These are gravitationally stable points where space stations can be placed.
 */

// Jupiter Lagrange Points
const JUPITER_L1 = new LagrangePoint(
    "Jupiter L1",
    COLORS.Orange,
    0.01,
    LagrangePoint.calculateLagrangeOrbit(JUPITER, 1, SOL),
    JUPITER,
    1
);

const JUPITER_L2 = new LagrangePoint(
    "Jupiter L2",
    COLORS.Orange,
    0.01,
    LagrangePoint.calculateLagrangeOrbit(JUPITER, 2, SOL),
    JUPITER,
    2
);

const JUPITER_L3 = new LagrangePoint(
    "Jupiter L3",
    COLORS.Orange,
    0.01,
    LagrangePoint.calculateLagrangeOrbit(JUPITER, 3, SOL),
    JUPITER,
    3
);

const JUPITER_L4 = new LagrangePoint(
    "Jupiter L4 (Greeks)",
    COLORS.Orange,
    0.01,
    LagrangePoint.calculateLagrangeOrbit(JUPITER, 4, SOL),
    JUPITER,
    4
);

const JUPITER_L5 = new LagrangePoint(
    "Jupiter L5 (Trojans)",
    COLORS.Orange,
    0.01,
    LagrangePoint.calculateLagrangeOrbit(JUPITER, 5, SOL),
    JUPITER,
    5
);

// Saturn Lagrange Points
const SATURN_L1 = new LagrangePoint(
    "Saturn L1",
    COLORS.Yellow,
    0.01,
    LagrangePoint.calculateLagrangeOrbit(SATURN, 1, SOL),
    SATURN,
    1
);

const SATURN_L2 = new LagrangePoint(
    "Saturn L2",
    COLORS.Yellow,
    0.01,
    LagrangePoint.calculateLagrangeOrbit(SATURN, 2, SOL),
    SATURN,
    2
);

const SATURN_L3 = new LagrangePoint(
    "Saturn L3",
    COLORS.Yellow,
    0.01,
    LagrangePoint.calculateLagrangeOrbit(SATURN, 3, SOL),
    SATURN,
    3
);

const SATURN_L4 = new LagrangePoint(
    "Saturn L4",
    COLORS.Yellow,
    0.01,
    LagrangePoint.calculateLagrangeOrbit(SATURN, 4, SOL),
    SATURN,
    4
);

const SATURN_L5 = new LagrangePoint(
    "Saturn L5",
    COLORS.Yellow,
    0.01,
    LagrangePoint.calculateLagrangeOrbit(SATURN, 5, SOL),
    SATURN,
    5
);

// Uranus Lagrange Points
const URANUS_L1 = new LagrangePoint(
    "Uranus L1",
    COLORS.Cyan,
    0.01,
    LagrangePoint.calculateLagrangeOrbit(URANUS, 1, SOL),
    URANUS,
    1
);

const URANUS_L2 = new LagrangePoint(
    "Uranus L2",
    COLORS.Cyan,
    0.01,
    LagrangePoint.calculateLagrangeOrbit(URANUS, 2, SOL),
    URANUS,
    2
);

const URANUS_L3 = new LagrangePoint(
    "Uranus L3",
    COLORS.Cyan,
    0.01,
    LagrangePoint.calculateLagrangeOrbit(URANUS, 3, SOL),
    URANUS,
    3
);

const URANUS_L4 = new LagrangePoint(
    "Uranus L4",
    COLORS.Cyan,
    0.01,
    LagrangePoint.calculateLagrangeOrbit(URANUS, 4, SOL),
    URANUS,
    4
);

const URANUS_L5 = new LagrangePoint(
    "Uranus L5",
    COLORS.Cyan,
    0.01,
    LagrangePoint.calculateLagrangeOrbit(URANUS, 5, SOL),
    URANUS,
    5
);

// Neptune Lagrange Points
const NEPTUNE_L1 = new LagrangePoint(
    "Neptune L1",
    COLORS.Blue,
    0.01,
    LagrangePoint.calculateLagrangeOrbit(NEPTUNE, 1, SOL),
    NEPTUNE,
    1
);

const NEPTUNE_L2 = new LagrangePoint(
    "Neptune L2",
    COLORS.Blue,
    0.01,
    LagrangePoint.calculateLagrangeOrbit(NEPTUNE, 2, SOL),
    NEPTUNE,
    2
);

const NEPTUNE_L3 = new LagrangePoint(
    "Neptune L3",
    COLORS.Blue,
    0.01,
    LagrangePoint.calculateLagrangeOrbit(NEPTUNE, 3, SOL),
    NEPTUNE,
    3
);

const NEPTUNE_L4 = new LagrangePoint(
    "Neptune L4",
    COLORS.Blue,
    0.01,
    LagrangePoint.calculateLagrangeOrbit(NEPTUNE, 4, SOL),
    NEPTUNE,
    4
);

const NEPTUNE_L5 = new LagrangePoint(
    "Neptune L5",
    COLORS.Blue,
    0.01,
    LagrangePoint.calculateLagrangeOrbit(NEPTUNE, 5, SOL),
    NEPTUNE,
    5
);

// Array of all Lagrange points
const ALL_LAGRANGE_POINTS = [
    JUPITER_L1, JUPITER_L2, JUPITER_L3, JUPITER_L4, JUPITER_L5,
    SATURN_L1, SATURN_L2, SATURN_L3, SATURN_L4, SATURN_L5,
    URANUS_L1, URANUS_L2, URANUS_L3, URANUS_L4, URANUS_L5,
    NEPTUNE_L1, NEPTUNE_L2, NEPTUNE_L3, NEPTUNE_L4, NEPTUNE_L5
];

console.log("Generated Lagrange points:", ALL_LAGRANGE_POINTS.length);
