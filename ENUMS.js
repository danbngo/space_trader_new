/** @typedef {'Victory'|'Defeat'|'Surrendered'|'Escaped'} EncounterResultType */
/** @typedef {'Attack'|'Escape'|'Asteroid'} CombatStrategyType */
/** @typedef {'FilledCircle'|'EmptyCircle'|'FilledTriangle'|'EmptyTriangle'|'Text'|'Line'|'FilledOval'|'EmptyOval'|'FilledRectangle'} ShapeType */
/** @typedef {'Pilot'|'Stealth'|'Barter'|'Engineer'|'Salvage'} SkillType */
/** @typedef {'Earthlike'|'Terrestrial'|'Gas Giant'|'Gas Dwarf'|'Ice Giant'|'Ice Dwarf'} PlanetTypeValue */
/** @typedef {'Move'|'Laser'|'Ram'|'Recharge'|'Wait'|'Blink'|'Booster'|'Cloak'|'Warhead'|'EMPPulse'|'Magnetize'|'SmokeBomb'} MoveType */
/** @typedef {'FaceOff'|'Storm'} FormationType */
/** @typedef {'Ship'|'Asteroid'} AIType */
/** @typedef {'Rocky'|'Icy'|'Plasma'} AsteroidBeltType */

/** @enum {EncounterResultType} */
const ENCOUNTER_RESULTS = Object.freeze({
    Victory: 'Victory',
    Defeat: 'Defeat',
    Surrendered: 'Surrendered',
    Escaped: 'Escaped'
})

/** @enum {CombatStrategyType} */
const COMBAT_STRATEGIES = Object.freeze({
    Attack: 'Attack',
    Escape: 'Escape',
    Asteroid: 'Asteroid'
})

/** @enum {ShapeType} */
const SHAPES = Object.freeze({
    FilledCircle: 'FilledCircle',
    EmptyCircle: 'EmptyCircle',
    FilledTriangle: 'FilledTriangle', //these tend to be rotated. starts pointing right, in line with radian chart
    EmptyTriangle: 'EmptyTriangle',
    Text: 'Text', //renders some text in monospace
    Line: 'Line',
    FilledOval: 'FilledOval',
    EmptyOval: 'EmptyOval',
    FilledRectangle: 'FilledRectangle',
})

/** @enum {SkillType} */
const SKILLS = Object.freeze({
    Pilot: 'Pilot', //avoid hazards, fleet (not ships) goes faster
    Stealth: 'Stealth', //avoid fleet encounters, sneak attacks
    Barter: 'Barter', //lowers prices in markets, shipyards etc.
    Engineer: 'Engineer', //gain some hull back after encounters, upgrade modules are more effective?
    Salvage: 'Salvage', //gain more cargo after destroying asteroids, etc.
    //Science: 'Science', //hmmm
    //Doctor: 'Doctor', //your officers gain health during travel - add this later w/ more officer-specific content
    //Leadership: 'Leadership' //lets you have more officers - would like a better system for this
})

const SKILLS_ALL = Object.values(SKILLS)

/** @enum {PlanetTypeValue} */
const PLANET_TYPES = Object.freeze({
  EARTHLIKE: "Earthlike",
  TERRESTRIAL: "Terrestrial",
  GAS_GIANT: "Gas Giant",
  GAS_DWARF: "Gas Dwarf",
  ICE_GIANT: "Ice Giant",
  ICE_DWARF: "Ice Dwarf",
});

const PLANET_TYPES_ALL = Object.values(PLANET_TYPES)

/**
 * Color values as RGBA tuples
 * @type {{ [key: string]: number[] }}
 */
const COLORS = Object.freeze({
    White: [255,255,255,1], // rgba(255,255,255,1)
    Black: [0,0,0,1], // rgba(0,0,0,1)
    Red: [255,0,0,1], // rgba(255,0,0,1)
    DarkRed: [139,0,0,1], // rgba(139,0,0,1)
    Cyan: [0,255,255,1], // rgba(0,255,255,1)
    Blue: [0,0,255,1], // rgba(0,0,255,1)
    Yellow: [255,255,0,1], // rgba(255,255,0,1)
    LightYellow: [255,255,150,1], // rgba(255,255,150,1)
    Green: [0,255,0,1], // rgba(0,255,0,1)
    Orange: [255,165,0,1], // rgba(255,165,0,1)
    LightOrange: [255,200,100,1], // rgba(255,200,100,1)
    Purple: [128,0,128,1], // rgba(128,0,128,1)
    LightPurple: [200,162,200,1], // rgba(200,162,200,1)
    Gray: [128,128,128,1], // rgba(128,128,128,1)
    LightGray: [192,192,192,1], // rgba(192,192,192,1)
    DarkGray: [64,64,64,1], // rgba(64,64,64,1)
    LightGreen: [144,238,144,1], // rgba(144,238,144,1)
    LightBlue: [173,216,230,1], // rgba(173,216,230,1)
    LightRed: [255,102,102,1], // rgba(255,102,102,1)
    Brown: [124,92,64,1], // rgba(124,92,64,1)
    Targeting: [0,255,0,0.5], // rgba(0,255,0,0.1)
    TargetingConfirm: [0,255,0,1], // rgba(0,255,0,0.7)
})

/** @enum {MoveType} */
const MOVE_TYPES = Object.freeze({
    Move: 'Move',
    Laser: 'Laser',
    Ram: 'Ram',
    Recharge: 'Recharge',
    Wait: 'Wait',
    Blink: 'Blink',
    Booster: 'Booster',
    Cloak: 'Cloak',
    Warhead: 'Warhead',
    EMPPulse: 'EMPPulse',
    Magnetize: 'Magnetize',
    SmokeBomb: 'SmokeBomb'
})
const MOVE_TYPES_ALL = Object.values(MOVE_TYPES)

/** @enum {FormationType} */
const FORMATION_TYPES = Object.freeze({
    //Ambush: 'Ambush',
    FaceOff: 'FaceOff', //ships all facing each other initially
    Storm: 'Storm', //ships all moving in an arbitrary direction - could be used for asteroid encounters
})
const FORMATION_TYPES_ALL = Object.values(FORMATION_TYPES)

/** @enum {AIType} */
const AI_TYPES = Object.freeze({
    Ship: 'Ship',
    Asteroid: 'Asteroid', //mostly move in same direction unless able to ram
})

/** @enum {AsteroidBeltType} */
const ASTEROID_BELT_TYPES = Object.freeze({
    Rocky: 'Rocky',
    Icy: 'Icy',
    Plasma: 'Plasma',
})

const CL = Object.freeze({
    EXTREMELY_LOW: 8/16,
    VERY_LOW: 8/12,
    LOW: 8/10,
    SLIGHTLY_LOW: 8/9,
    NONE: 1,
    SLIGHTLY_HIGH: 9/8,
    HIGH: 10/8,
    VERY_HIGH: 12/8,
    EXTREMELY_HIGH: 16/8,
    ASTRONOMICAL: 32/8,
    NO_REGRESSION: 1,
    MEDIUM: 1
})

const ATMOSPHERIC_PRESSURE = Object.freeze({
    NONE: 0,
    EXTREMELY_LOW: 8/16,
    VERY_LOW: 8/12,
    LOW: 8/10,
    SLIGHTLY_LOW: 8/9,
    MEDIUM: 1,
    SLIGHTLY_HIGH: 9/8,
    HIGH: 10/8,
    VERY_HIGH: 12/8,
    EXTREMELY_HIGH: 16/8,
    CRUSHING: 32/8,
})

const TEMPERATURE = Object.freeze({
    NONE: 0,
    FROZEN: 8/16,
    FRIGID: 8/12,
    COLD: 8/10,
    COOL: 8/9,
    TEMPERATE: 1,
    WARM: 9/8,
    HOT: 10/8,
    SCORCHING: 12/8,
    INFERNAL: 16/8,
    MOLTEN: 32/8,
})

const GRAVITY = Object.freeze({
    NONE: 0,
    EXTREMELY_LOW: 8/16,
    VERY_LOW: 8/12,
    LOW: 8/10,
    SLIGHTLY_LOW: 8/9,
    STANDARD: 1,
    SLIGHTLY_HIGH: 9/8,
    HIGH: 10/8,
    VERY_HIGH: 12/8,
    EXTREMELY_HIGH: 16/8,
    CRUSHING: 32/8,
})

const OCEAN_COVERAGE = Object.freeze({
    NONE: 0,
    TRACE: 8/16,
    MINIMAL: 8/12,
    LOW: 8/10,
    MODERATE: 8/9,
    MEDIUM: 1,
    EXTENSIVE: 9/8,
    VAST: 10/8,
    OCEANIC: 12/8,
    GLOBAL_OCEAN: 16/8,
    SUBMERGED: 32/8,
})

const GEOLOGICAL_ACTIVITY = Object.freeze({
    NONE: 0,
    DORMANT: 8/16,
    MINIMAL: 8/12,
    LOW: 8/10,
    SLIGHT: 8/9,
    MODERATE: 1,
    ACTIVE: 9/8,
    HIGHLY_ACTIVE: 10/8,
    VOLCANIC: 12/8,
    CATACLYSMIC: 16/8,
    HELLSCAPE: 32/8,
})

