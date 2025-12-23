/** @enum {string} */
const ENCOUNTER_RESULTS = Object.freeze({
    Victory: 'Victory',
    Defeat: 'Defeat',
    Surrendered: 'Surrendered',
    Escaped: 'Escaped'
})

/** @enum {string} */
const COMBAT_STRATEGIES = Object.freeze({
    Attack: 'Attack',
    Escape: 'Escape',
    Asteroid: 'Asteroid'
})

/** @enum {string} */
const SHAPES = Object.freeze({
    FilledCircle: 'FilledCircle',
    EmptyCircle: 'EmptyCircle',
    Triangle: 'Triangle', //these tend to be rotated. starts pointing right, in line with radian chart
    Text: 'Text', //renders some text in monospace
    Line: 'Line',
    FilledOval: 'FilledOval',
})

/** @enum {string} */
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

/** @enum {string} */
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
    Targeting: [0,255,0,0.1], // rgba(0,255,0,0.1)
    TargetingConfirm: [0,255,0,0.7], // rgba(0,255,0,0.7)
})

/** @enum {string} */
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
    GravitonBeam: 'GravitonBeam',
    SmokeBomb: 'SmokeBomb'
})
const MOVE_TYPES_ALL = Object.values(MOVE_TYPES)

/** @enum {string} */
const FORMATION_TYPES = Object.freeze({
    //Ambush: 'Ambush',
    FaceOff: 'FaceOff', //ships all facing each other initially
    Storm: 'Storm', //ships all moving in an arbitrary direction - could be used for asteroid encounters
})
const FORMATION_TYPES_ALL = Object.values(FORMATION_TYPES)

/** @enum {string} */
const AI_TYPES = Object.freeze({
    Ship: 'Ship',
    Asteroid: 'Asteroid', //mostly move in same direction unless able to ram
})

/** @enum {string} */
const ASTEROID_BELT_TYPES = Object.freeze({
    Rocky: 'Rocky',
    Icy: 'Icy',
    Plasma: 'Plasma',
})