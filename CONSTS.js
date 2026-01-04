const DEFAULT_FONT_SIZE = 16

// Modeling the Solar System using Star and Planet classes

const SOLAR_SYSTEM_RADIUS_IN_AU = 200//1000//sol to inner edge of oort cloud //200*1000 //sol to outer edge of oort cloud
const INNER_SOLAR_SYSTEM_RADIUS_IN_AU = 30.1 //distance sol to neptune

const SOLAR_RADII_PER_AU = 215.032
const EARTH_RADII_PER_AU = 23454.8
const MILES_PER_AU = 432288*EARTH_RADII_PER_AU

//TODO: try to make some of these vars more dynamic in future - different sizes for ships, projectiles etc.
const FLEET_RADIUS = 1/1000 * 1/EARTH_RADII_PER_AU
const RUINS_RADIUS = 1/100 * 1/EARTH_RADII_PER_AU
const ANOMALY_RADIUS = 1/10 * 1/EARTH_RADII_PER_AU

const FLEET_COLLISION_DISTANCE = FLEET_RADIUS * 1000000

const PLANET_ENCOUNTER_CHANCE_PER_DAY = 0//0.01; //chance of random encounter per day when right next to an 'average' planet
const ASTEROIDS_ENCOUNTER_CHANCE_PER_DAY = 0.01//0.5; //chance of fooroid storms when in the middle of an asteroid belt
const BANK_BOUNTY_CHANCE_PER_DAY = 0.01;
const NEWS_CHANCE_PER_DAY = 1/30;
const META_NEWS_CHANCE_PER_DAY = 1/365;
const ANOMALY_CHANCE_PER_DAY = 1/30;
const MAX_NUM_ANOMALIES = 3;
const FLEET_SPAWN_CHANCE_PER_DAY = 1/30 / 20 //about 20 fleet types
const ENCOUNTER_IMMUNITY_DAYS = 1; //days of immunity after an encounter ends
const ENCOUNTER_DENIED_DAYS = 0.25; //days player can't bump into fleets after denying an encounter (0.25 = 6 hours)

//combat distances = miles, time = seconds
const ENCOUNTER_SHIP_MIN_SPAWN_DISTANCE_RATIO = 0.11
const ENCOUNTER_SHIP_MAX_SPAWN_DISTANCE_RATIO = 0.66
const ENCOUNTER_MAP_RADIUS_MILES = 100
const BASE_SHIP_RADIUS_IN_MILES = 1/2
const AVERAGE_SHIP_MASS = 1
const AVERAGE_FLEET_SPEED = 500 //in AU per year
const AVERGE_RAMMING_KNOCKBACK_DISTANCE = 1 //in miles
const ASTEROID_STORM_SPEED_MULTIPLIER = 8


const STARTING_SKILL_POINTS = 5;
const SKILL_POINTS_PER_LEVEL = 5;
const CAPTAIN_LEVELS_PER_OFFICER = 3;

const AVERAGE_EXP_FROM_COMBAT = 50;
const AVERAGE_EXP_FROM_MINING = 10;
const AVERAGE_EXP_FROM_ESCAPING = 10;

const MARKET_AVERAGE_CARGO_PER_TYPE = 100
const MARKET_AVERAGE_CREDITS = 200*1000*1000
const MARKET_MAX_CARGO_PRICE_MODIFIER = 5
const MARKET_MIN_CARGO_PRICE_MODIFIER = 1/5
const MARKET_AVERAGE_CARGO_PRICE_MODIFIER = (MARKET_MAX_CARGO_PRICE_MODIFIER + MARKET_MIN_CARGO_PRICE_MODIFIER) / 2
const ACADEMY_MAX_SKILL_PRICE_MODIFIER = 3
const ACADEMY_MIN_SKILL_PRICE_MODIFIER = 1/3
const ACADEMY_AVERAGE_SKILL_PRICE_MODIFIER = (ACADEMY_MAX_SKILL_PRICE_MODIFIER + ACADEMY_MIN_SKILL_PRICE_MODIFIER) / 2

const SHIPYARD_AVERAGE_NUM_SHIPS = 3
const SHIPYARD_AVERAGE_NUM_MODULES = 2
const CYBER_SURGEON_AVERAGE_NUM_IMPLANTS = 3
const GENETICIST_AVERAGE_NUM_MODIFICATIONS = 3
const GUILD_AVERAGE_NUM_OFFICERS = 3
const GUILD_AVERAGE_NUM_CONTRACTS = 5
const PALACE_AVERAGE_NUM_CONTRACTS = 3

const MAX_TAX_RATE = 0.75

const STARTING_CREDITS = 5*1000

const AVERAGE_SHIP_HULL = 15
const AVERAGE_SHIP_SHIELDS = 10
const AVERAGE_SHIP_LASERS = 5
const AVERAGE_SHIP_ENGINE = 5
const AVERAGE_SHIP_CARGO_SPACE = 5
const AVERAGE_SHIP_RADARS = 5

const AVERAGE_SHIP_MOVE_DISTANCE = 7.5
const AVERAGE_SHIP_ATTACK_DISTANCE = 40 //have increased this a lot because you can miss now
const AVERAGE_SHIP_LASER_DMG = 5
const AVERAGE_SHIP_RAM_DMG = 2.5

const BANK_MAX_LOAN_YEARS = 5
const BANK_MIN_LOAN_AMOUNT = 100
const BANK_AVERAGE_CREDITS = 50*1000

const SHIP_NUM_MOVES_PER_TURN = 2

const GAME_START_YEAR = 3000
const GAME_END_YEAR = 3100

const AMBIENT_EFFECT_MIN_RADIUS_MODIFIER = 2
const AMBIENT_EFFECT_MAX_RADIUS_MODIFIER = 2

const STAR_MAP_YEARS_PER_MS = 1/365/24/60 * 2
const MAX_FRAMES_PER_SECOND = 30

const NEWS_MAX_AGE = 60

const ENCOUNTER_MAX_LOSE_CARGO_RATIO = 0.75 //if pirates or rebels defeat you they'll take up to this much cargo (min 1)
const ENCOUNTER_MAX_LOSE_OFFICERS_RATIO = 0.5 //if slavers defeat you they'll take up to this many crew members (min 1)
const ENCOUNTER_MAX_LOSE_CREDITS_RATIO = 0.75 //pirates, mercenaries will take up to this from you (min 100)
const ENCOUNTER_BASE_FINE_ON_ATTACK =  1000 //if the enemy has positive reputationMultiplier, multiply bounty increase by this amount. otherwisee bounty increase is always 0
const ENCOUNTER_MAX_BOUNTY_OR_JAIL_RATIO = 1 //if police or bounty hunters catch you, this happens to you
const JAIL_DAYS_PER_1000CR_FINE = 5 //5 days of jail time per 1000CR of fine
const ENCOUNTER_BASE_REPUTATION_SHRINK_ON_DEFEAT = 3 //losing a battle moves your reputation closer to 0
const ENCOUNTER_BASE_REPUTATION_EFFECT_ON_VICTORY = -5 //winning a battle grants you some notoriety if the target was good, fame if the target was bad
const ENCOUNTER_BASE_REPUTATION_SHRINK_ON_SURRENDER = 5 //surrendering moves your reputation closer to 0
const ENCOUNTER_BASE_REPUTATION_EFFECT_ON_NO_SURRENDER = 5 //this is applied as an inverse amount, ie, your rep shrinks by base/reputationMultiplier. surrendering to powerful foes is less shameful.
const ENCOUNTER_BASE_REPUTATION_EFFECT_ON_ATTACK = -5 //attacking a fleet gains you notoriety if they're good and fame if they're bad
const ENCOUNTER_MAX_TAX_RATIO = 0.2 //if tax collectors catch you, they'll take up to this much of your credits (min 100)
const ENCOUNTER_MAX_EXTORT_RATIO = 0.5 //if syndicates catch you, they'll take up to this much of your credits (min 100)

const CIVILIZATION_BONUS_RATE_PER_YEAR = 0.1 //each year a democracy will MULTIPLY its economy by 1 + this, for instance
const CIVILIZATION_CONVERT_CULTURE_PER_YEAR = 0.1 //each year a civilization will convert this fraction of its population to its dominant culture
const CIVILIZATION_CULTURE_DISAPPEAR_THRESHOLD = 0.0001


const SIMULATE_FLEET_ACTIVITY_YEARS = 0.1
const SIMULATE_HISTORY_NUM_YEARS = 1
const CLOAK_REGEN_RATE = 30*4 //takes 1 week to fully cloak
const NPC_FLEET_MAX_PURCHASE_CARGO_RATIO = 0.5 //max fraction of market cargo NPC fleets will buy when trading