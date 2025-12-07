// Modeling the Solar System using Star and Planet classes

const SOLAR_SYSTEM_RADIUS_IN_AU = 1000//sol to inner edge of oort cloud //200*1000 //sol to outer edge of oort cloud

const SOLAR_RADII_PER_AU = 215.032
const EARTH_RADII_PER_AU = 23454.8
const MILES_PER_AU = 432288*EARTH_RADII_PER_AU

const SPACE_SHIP_SIZE_IN_EARTH_RADII = 1/(1000*1000)
const FLEET_SIZE_IN_EARTH_RADII = 1/1000

const ENCOUNTER_CHANCE_PER_DAY = 0.2;

//combat distances = miles, time = seconds
const ENCOUNTER_MAP_RADIUS_MILES = 50*1000
const TIME_TO_SHOOT_LASER_IN_SECONDS = 0.5
const TIME_TO_RECHARGE_LASER_IN_SECONDS = 2.5
const TIME_TO_RECHARGE_SHIELDS_IN_SECONDS = 15
const TIME_TO_TURN_SHIP_WITH_ONE_THRUSTER_IN_SECONDS = 450
const ENCOUNTER_THRUSTER_PENALTY = 1/(10*1000) //ships are already going fast, cant move much due to inertia
