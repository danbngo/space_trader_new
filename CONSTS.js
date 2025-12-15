const DEFAULT_FONT_SIZE = 16

// Modeling the Solar System using Star and Planet classes

const SOLAR_SYSTEM_RADIUS_IN_AU = 200//1000//sol to inner edge of oort cloud //200*1000 //sol to outer edge of oort cloud
const INNER_SOLAR_SYSTEM_RADIUS_IN_AU = 30.1 //distance sol to neptune

const SOLAR_RADII_PER_AU = 215.032
const EARTH_RADII_PER_AU = 23454.8
const MILES_PER_AU = 432288*EARTH_RADII_PER_AU

//TODO: try to make some of these vars more dynamic in future - different sizes for ships, projectiles etc.
const BASE_SPACE_SHIP_RADIUS_IN_MILES = 1000
const BASE_PROJECTILE_RADIUS_IN_MILES = 200
const FLEET_RADIUS_IN_EARTH_RADII = 1/1000

const ENCOUNTER_CHANCE_PER_DAY = 0.2;

//combat distances = miles, time = seconds
const ENCOUNTER_SHIP_MAX_SPAWN_DISTANCE_RATIO = 0.1
const ENCOUNTER_MAP_RADIUS_MILES = 500*1000
const TIME_TO_SHOOT_LASER_IN_SECONDS = 0.5
const TIME_TO_RECHARGE_LASER_IN_SECONDS = 2
const TIME_TO_RECHARGE_SHIELDS_IN_SECONDS = 2
const TIME_TO_TURN_SHIP_WITH_ONE_THRUSTER_IN_SECONDS = 2000
const ENCOUNTER_THRUSTER_PENALTY = 1/(1*1000) //ships are already going fast, cant move much due to inertia
const PROJECTILE_SPEED_IN_MILES_PER_SECOND = 25*1000
const PROJECTILE_SPEED_INCREASE_FACTOR_PER_SECOND = 1//1.33

const DECELERATION_SPEED_RATIO = 0.8 //decelerating is slower than acceleration (make sure you face the right direction!)

const STARTING_SKILL_POINTS = 5;
const SKILL_POINTS_PER_LEVEL = 5;
const CAPTAIN_LEVELS_PER_OFFICER = 3;

const MARKET_MAX_CARGO_PER_TYPE = 50
const MARKET_MAX_CREDITS = 200*1000

const STARTING_CREDITS = 5*1000

const AVERAGE_SHIP_HULL = 20
const AVERAGE_SHIP_SHIELDS = 10

const BANK_MAX_LOAN_YEARS = 5
const BANK_MIN_LOAN_AMOUNT = 100