const DEFAULT_FONT_SIZE = 16

// Modeling the Solar System using Star and Planet classes

const SOLAR_SYSTEM_RADIUS_IN_AU = 200//1000//sol to inner edge of oort cloud //200*1000 //sol to outer edge of oort cloud
const INNER_SOLAR_SYSTEM_RADIUS_IN_AU = 30.1 //distance sol to neptune

const SOLAR_RADII_PER_AU = 215.032
const EARTH_RADII_PER_AU = 23454.8
const MILES_PER_AU = 432288*EARTH_RADII_PER_AU

//TODO: try to make some of these vars more dynamic in future - different sizes for ships, projectiles etc.
const FLEET_RADIUS = 1/1000 * 1/EARTH_RADII_PER_AU

const ENCOUNTER_CHANCE_PER_DAY = 0.5;

//combat distances = miles, time = seconds
const ENCOUNTER_SHIP_MAX_SPAWN_DISTANCE_RATIO = 0.5
const ENCOUNTER_MAP_RADIUS_MILES = 100
const BASE_SPACE_SHIP_RADIUS_IN_MILES = 1/100
const BASE_SPACE_SHIP_MASS = 1

const STARTING_SKILL_POINTS = 5;
const SKILL_POINTS_PER_LEVEL = 5;
const CAPTAIN_LEVELS_PER_OFFICER = 3;

const MARKET_MAX_CARGO_PER_TYPE = 50
const MARKET_MAX_CREDITS = 200*1000

const STARTING_CREDITS = 5*1000

const AVERAGE_SHIP_HULL = 15
const AVERAGE_SHIP_SHIELDS = 10
const AVERAGE_SHIP_LASERS = 5
const AVERAGE_SHIP_ENGINE = 5
const AVERAGE_SHIP_CARGO_SPACE = 5
const AVERAGE_SHIP_RADARS = 5


const BANK_MAX_LOAN_YEARS = 5
const BANK_MIN_LOAN_AMOUNT = 100

const SHIP_NUM_MOVES_PER_TURN = 2