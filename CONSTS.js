let DEBUG_MODE = true //change this back before goign to prod
const DEFAULT_FONT_SIZE = 16

// Modeling the Solar System using Star and Planet classes

const SOLAR_SYSTEM_RADIUS_IN_AU = 200//1000//sol to inner edge of oort cloud //200*1000 //sol to outer edge of oort cloud
const INNER_SOLAR_SYSTEM_RADIUS_IN_AU = 30.1 //distance sol to neptune

const SOLAR_RADII_PER_AU = 215.032
const EARTH_RADII_PER_AU = 23454.8
const MILES_PER_AU = 432288*EARTH_RADII_PER_AU

//TODO: try to make some of these vars more dynamic in future - different sizes for ships, projectiles etc.
const FLEET_RADIUS = 1/1000 * 1/EARTH_RADII_PER_AU

const ASTEROID_MIN_SCREEN_RADIUS = 1 // Hide asteroids when they would appear smaller than 1px radius
const REPAIR_COST_PER_1_HULL = 10 // Base cost to repair 1 hull point at shipyard
const BASE_FUEL_COST_PER_UNIT = 5 // Base cost per unit of fuel at shipyard
const FUEL_COST_PER_1_AU = 5 // Fuel units consumed per AU traveled

const NEWS_CHANCE_PER_DAY = 1/30;

//combat distances = miles, time = seconds
const BASE_SHIP_RADIUS_IN_MILES = 1/2
const AVERAGE_SHIP_MASS = 1
const AVERAGE_FLEET_SPEED = Math.pow(250,2) //in AU per year. must be pow2 as its sqrted later

const STARTING_SKILL_POINTS = 5;
const SKILL_POINTS_PER_LEVEL = 5;
const CAPTAIN_LEVELS_PER_OFFICER = 3;

const AVERAGE_EXP_FROM_COMBAT = 50;
const AVERAGE_EXP_FROM_MINING = 10;
const AVERAGE_EXP_FROM_ESCAPING = 10;
const AVERAGE_EXP_FROM_TRADING = 10;

const MARKET_AVERAGE_CARGO_PER_TYPE = 100
const MARKET_AVERAGE_CREDITS = 200*1000*1000
const MARKET_MAX_CARGO_PRICE_MODIFIER = 5
const MARKET_MIN_CARGO_PRICE_MODIFIER = 1/5
const MARKET_AVERAGE_CARGO_PRICE_MODIFIER = (MARKET_MAX_CARGO_PRICE_MODIFIER + MARKET_MIN_CARGO_PRICE_MODIFIER) / 2

const SHIPYARD_AVERAGE_NUM_SHIPS = 3
const SHIPYARD_AVERAGE_NUM_MODULES = 2
const GUILD_AVERAGE_NUM_OFFICERS = 3
const GUILD_AVERAGE_NUM_MISSIONS = 5

const AVERAGE_TAX_RATE = 0.05
const AVERAGE_INFLATION_RATE = 0.05

const STARTING_CREDITS = 5*1000

const AVERAGE_SHIP_HULL = 15
const AVERAGE_SHIP_SHIELDS = 10
const AVERAGE_SHIP_LASERS = 5
const AVERAGE_SHIP_ENGINE = 5
const AVERAGE_SHIP_CARGO_SPACE = 5
const AVERAGE_SHIP_RADARS = 5
const AVERAGE_SHIP_FUEL_CAPACITY = 50

const AVERAGE_SHIP_LASER_DMG = 5
const AVERAGE_SHIP_RAM_DMG = 2.5

const BANK_MAX_LOAN_YEARS = 5
const BANK_MIN_LOAN_AMOUNT = 100
const BANK_AVERAGE_CREDITS = 50*1000

const GAME_START_YEAR = 3000
const GAME_END_YEAR = 3100

const MAXIMUM_RETIREMENT_AGE = 100
const MINIMUM_OFFICER_AGE = 20
const AVERAGE_OFFICER_LEVEL = 10

const STAR_MAP_YEARS_PER_MS = 1/365/24/60 * 2
const MAX_FRAMES_PER_SECOND = 120

const NEWS_MAX_AGE = 60

const ENCOUNTER_BASE_FINE_ON_ATTACK =  1000 //if the enemy has positive reputationMultiplier, multiply bounty increase by this amount. otherwisee bounty increase is always 0
const ENCOUNTER_MAX_BOUNTY_OR_JAIL_RATIO = 1 //if police or bounty hunters catch you, this happens to you
const JAIL_DAYS_PER_1000CR_FINE = 5 //5 days of jail time per 1000CR of fine
const ENCOUNTER_BASE_REPUTATION_EFFECT_ON_VICTORY = -5 //winning a battle grants you some notoriety if the target was good, fame if the target was bad
const ENCOUNTER_BASE_REPUTATION_EFFECT_ON_NO_SURRENDER = -3 //this is applied as an inverse amount, ie, your rep shrinks by base/reputationMultiplier. surrendering to powerful foes is less shameful.
const ENCOUNTER_BASE_REPUTATION_EFFECT_ON_ATTACK = -5 //attacking a fleet gains you notoriety if they're good and fame if they're bad

const CIVILIZATION_BONUS_RATE_PER_YEAR = 0.1 //each year a democracy will MULTIPLY its economy by 1 + this, for instance

const SIMULATE_HISTORY_NUM_YEARS = 1
const STAR_MAP_AVERAGE_VIEW_DISTANCE = 5 // in au 

const SUN_MIN_SCREEN_SIZE = 18
const PLANET_MIN_SCREEN_SIZE = 14
const DWARF_PLANET_MIN_SCREEN_SIZE = 10
const SPACE_STATION_MIN_SCREEN_SIZE = 10

const DWARF_PLANET_MIN_BUILDINGS = 2
const SPACE_STATION_MIN_BUILDINGS = 1

const CRIMINAL_MAX_BOUNTY_PER_LEVEL = 500

const YEARS_PER_TRAVEL_TICK = 1/365/24/10 //1 hour per 10 tick
const BASE_ENCOUNTER_CHANCE_PER_DAY = 0.9 //1 encounter per day
const TRAVEL_MAP_PROGRESS_PERCENT_PER_MS = 1/1000 // Progress percentage per millisecond

const MAX_SHIPS_PER_FLEET = 7