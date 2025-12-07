// Modeling the Solar System using Star and Planet classes

const SOLAR_SYSTEM_RADIUS_IN_AU = 1000//sol to inner edge of oort cloud //200*1000 //sol to outer edge of oort cloud
const SOL = new Star("Sol", new Graphics('circle', '#ffff44', 109), 109, 0, 0);

const MERCURY = new Planet("Mercury", new Graphics('circle', '#aaaaaa', 0.383), 0.383, 0, 0, new Orbit(0.39));
const VENUS = new Planet("Venus", new Graphics('circle', '#e5c07b', 0.949), 0.949, 0, 0, new Orbit(0.72));
const EARTH = new Planet("Earth", new Graphics('circle', '#4a90e2', 1.0), 1.0, 0, 0, new Orbit(1.0));
const MARS = new Planet("Mars", new Graphics('circle', '#b22222', 0.532), 0.532, 0, 0, new Orbit(1.52));
const JUPITER = new Planet("Jupiter", new Graphics('circle', '#d2b48c', 11.21), 11.21, 0, 0, new Orbit(5.2));
const SATURN = new Planet("Saturn", new Graphics('circle', '#f5deb3', 9.45), 9.45, 0, 0, new Orbit(9.58));
const URANUS = new Planet("Uranus", new Graphics('circle', '#afeeee', 4.01), 4.01, 0, 0, new Orbit(19.2));
const NEPTUNE = new Planet("Neptune", new Graphics('circle', '#4169e1', 3.88), 3.88, 0, 0, new Orbit(30.05));
const PLANETS = [MERCURY, VENUS, EARTH, MARS, JUPITER, SATURN, URANUS, NEPTUNE]

SOL.addChildren(PLANETS)

const SOLAR_SYSTEM = new StarSystem('Sol System', new Graphics('circle', '#ffffff', 1), 1, 0, 0, SOL, [SOL], PLANETS, [], [])

const SOLAR_RADII_PER_AU = 215.032
const EARTH_RADII_PER_AU = 23454.8
const MILES_PER_AU = 432288*EARTH_RADII_PER_AU

const SPACE_SHIP_SIZE_IN_EARTH_RADII = 1/(1000*1000)
const FLEET_SIZE_IN_EARTH_RADII = 1/1000

const ENCOUNTER_CHANCE_PER_DAY = 0.2;

//combat distances = miles, time = seconds
const ENCOUNTER_MAP_RADIUS_MILES = 50*1000
const TIME_TO_SHOOT_LASER_IN_SECONDS = 1
const TIME_TO_RECHARGE_LASER_IN_SECONDS = 5
const TIME_TO_RECHARGE_SHIELDS_IN_SECONDS = 30
const TIME_TO_TURN_SHIP_WITH_ONE_THRUSTER_IN_SECONDS = 60
const ENCOUNTER_THRUSTER_PENALTY = 1/1000 //ships are already going fast, cant move much due to inertia
