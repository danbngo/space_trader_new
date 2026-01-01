/** @typedef {'Victory'|'Defeat'|'Surrendered'|'Escaped'} EncounterResultType */
/** @typedef {'Attack'|'Escape'|'Asteroid'} CombatStrategyType */
/** @typedef {'FilledCircle'|'EmptyCircle'|'FilledTriangle'|'EmptyTriangle'|'Text'|'Line'|'FilledOval'|'EmptyOval'|'FilledRectangle'} ShapeType */
/** @typedef {'Pilot'|'Stealth'|'Barter'|'Engineer'|'Salvage'} SkillType */
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

/**
 * Color values as RGBA tuples
 * @type {{ [key: string]: number[] }}
 */
const COLORS = Object.freeze({
    White: [255,255,255,1], // rgba(255,255,255,1)
    Black: [0,0,0,1], // rgba(0,0,0,1)
    Red: [255,0,0,1], // rgba(255,0,0,1)
    DarkRed: [180,0,0,1], // rgba(180,0,0,1)
    Cyan: [0,255,255,1], // rgba(0,255,255,1)
    Blue: [50,100,255,1], // rgba(50,100,255,1)
    DarkYellow: [180,180,0,1], // rgba(180,180,0,1)
    Yellow: [255,255,0,1], // rgba(255,255,0,1)
    LightYellow: [255,255,150,1], // rgba(255,255,150,1)
    Green: [0,255,0,1], // rgba(0,255,0,1)
    Orange: [255,180,50,1], // rgba(255,180,50,1)
    LightOrange: [255,200,100,1], // rgba(255,200,100,1)
    Purple: [170,50,170,1], // rgba(170,50,170,1)
    LightPurple: [200,162,200,1], // rgba(200,162,200,1)
    Gray: [160,160,160,1], // rgba(160,160,160,1)
    LightGray: [220,220,220,1], // rgba(220,220,220,1)
    DarkGray: [100,100,100,1], // rgba(100,100,100,1)
    LightGreen: [144,238,144,1], // rgba(144,238,144,1)
    LightBlue: [173,216,230,1], // rgba(173,216,230,1)
    LightRed: [255,102,102,1], // rgba(255,102,102,1)
    Brown: [160,120,80,1], // rgba(160,120,80,1)
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
    PlayerEncircle: 'PlayerEncircle', //player ships surround enemy ships
    PlayerEncircled: 'PlayerEncircled', //enemy ships surround player ships
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
