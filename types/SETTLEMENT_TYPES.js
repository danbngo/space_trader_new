/**
 * @class SettlementType
 * @classdesc Represents a type of settlement with specific characteristics and requirements.
 * @property {string} name - The name of the settlement type.
 * @property {string} description - Description of the settlement type.
 * @property {number[]} color - The color associated with this settlement type (RGBA array).
 */
class SettlementType {
    /**
     * @param {string} name - The name of the settlement type.
     * @param {string} description - Description of the settlement type.
     * @param {number[]} color - The color associated with this settlement type (RGBA array).
     * @param {NewsType[]} forbiddenNewsTypes - News types that cannot occur on planets with this settlement type.
     * @param {NewsType[]} favoriteNewsTypes - News types that are 3x more likely on planets with this settlement type.
     */
    constructor(name, description, color, forbiddenNewsTypes = [], favoriteNewsTypes = []) {
        /** @type {string} */
        this.name = name
        /** @type {string} */
        this.description = description
        /** @type {number[]} */
        this.color = color
        /** @type {NewsType[]} */
        this.forbiddenNewsTypes = forbiddenNewsTypes
        /** @type {NewsType[]} */
        this.favoriteNewsTypes = favoriteNewsTypes
    }
}

const SETTLEMENT_TYPES = Object.freeze({
    // For Earth-like planets with optimal conditions
    PLANETARY_MEGACITY: new SettlementType(
        "Planetary Megacity",
        "Sprawling urban centers covering vast swaths of a highly habitable planet's surface",
        COLORS.Green,
        [],
        [NT.MEGACITY, NT.ECONOMIC_BOOM, NT.TOURISM]
    ),
    
    // For gas giants - settlements float in upper atmosphere
    CLOUD_CITY: new SettlementType(
        "Cloud City",
        "Floating platforms suspended in the upper atmosphere of gas giants, harvesting resources from the clouds",
        COLORS.LightBlue,
        [NT.DISASTER_EARTHQUAKES, NT.DISASTER_VOLCANO, NT.DISASTER_TSUNAMI],
        [NT.DISASTER_STORM]
    ),
    
    // For ocean worlds or water-covered planets
    FLOATING_CITY: new SettlementType(
        "Floating City",
        "Cities built on massive pontoons and structures floating on liquid surfaces",
        COLORS.Blue,
        [NT.DISASTER_EARTHQUAKES, NT.DISASTER_VOLCANO],
        [NT.DISASTER_TSUNAMI, NT.DISASTER_STORM]
    ),
    
    // For deep ocean worlds
    SUBMERGED_CITY: new SettlementType(
        "Submerged City",
        "Pressurized habitats beneath the waves, built into or around underwater geological features",
        COLORS.DarkBlue,
        [NT.DISASTER_EARTHQUAKES, NT.DISASTER_VOLCANO, NT.DISASTER_STORM],
        [NT.OCEAN_RESTORATION]
    ),
    
    // For extreme depth ocean trenches
    OCEAN_TRENCH_CITY: new SettlementType(
        "Ocean Trench City",
        "Deep-sea settlements in extreme pressure environments, often mining thermal vents and rare minerals",
        COLORS.DarkCyan,
        [NT.DISASTER_EARTHQUAKES, NT.DISASTER_VOLCANO, NT.DISASTER_STORM, NT.DISASTER_ASTEROID],
        [NT.OCEAN_RESTORATION]
    ),
    
    // For harsh surface conditions (extreme temperature, pressure, radiation)
    DOMED_CITY: new SettlementType(
        "Domed City",
        "Enclosed habitats protected by advanced shielding from hostile surface conditions",
        COLORS.LightGray,
        [NT.DISASTER_STORM],
        [NT.ATMOSPHERE_RESTORATION]
    ),
    
    // For planets with extreme surface conditions or minimal atmosphere
    UNDERGROUND_CITY: new SettlementType(
        "Underground City",
        "Subterranean settlements carved into rock, protected from surface radiation and temperature extremes",
        COLORS.Brown,
        [NT.DISASTER_STORM, NT.DISASTER_ASTEROID, NT.DISASTER_FLARE, NT.ATMOSPHERE_STRIPPED, NT.RADIATION_SICKNESS],
        [NT.DISASTER_EARTHQUAKES]
    ),
    
    // For tidally locked planets - settlements in the twilight zone
    TWILIGHT_REGION_CITY: new SettlementType(
        "Twilight Region City",
        "Settlements built in the narrow habitable band between scorching day-side and frozen night-side of tidally locked worlds",
        COLORS.Orange,
        [NT.GLOBAL_COOLING, NT.DISASTER_GREENHOUSE],
        []
    ),
    
    // For completely inhospitable planets - no surface settlement possible
    ORBITAL_PLATFORM: new SettlementType(
        "Orbital Platform",
        "Space stations orbiting inhospitable worlds, serving as trade hubs and resource processing centers",
        COLORS.DarkGray,
        [NT.DISASTER_EARTHQUAKES, NT.DISASTER_VOLCANO, NT.DISASTER_STORM, NT.DISASTER_TSUNAMI, NT.ICE_CAPS_MELT, NT.OCEAN_EVAPORATION, NT.DISASTER_GREENHOUSE, NT.GLOBAL_COOLING],
        [NT.SPACE_STATION, NT.SPACE_ELEVATOR, NT.COLONY_SHIP, NT.ORBITAL_SHIELDS]
    ),
    
    // Space Station Types - orbital habitats and structures
    TORUS_STATION: new SettlementType(
        "Torus Station",
        "A ring-shaped station that rotates to generate artificial gravity",
        COLORS.Gray,
        [NT.DISASTER_EARTHQUAKES, NT.DISASTER_VOLCANO, NT.DISASTER_STORM, NT.DISASTER_TSUNAMI, NT.ICE_CAPS_MELT, NT.OCEAN_EVAPORATION, NT.DISASTER_GREENHOUSE, NT.GLOBAL_COOLING],
        [NT.SPACE_STATION, NT.GRAVITY_HEALTH]
    ),
    
    ROTATING_DRUM: new SettlementType(
        "Rotating Drum",
        "A cylindrical station that spins along its central axis",
        COLORS.LightGray,
        [NT.DISASTER_EARTHQUAKES, NT.DISASTER_VOLCANO, NT.DISASTER_STORM, NT.DISASTER_TSUNAMI, NT.ICE_CAPS_MELT, NT.OCEAN_EVAPORATION, NT.DISASTER_GREENHOUSE, NT.GLOBAL_COOLING],
        [NT.SPACE_STATION]
    ),
    
    TETHERED_STATION: new SettlementType(
        "Tethered Station",
        "Two masses connected by a cable, spinning to create gravity",
        COLORS.White,
        [NT.DISASTER_EARTHQUAKES, NT.DISASTER_VOLCANO, NT.DISASTER_STORM, NT.DISASTER_TSUNAMI, NT.ICE_CAPS_MELT, NT.OCEAN_EVAPORATION, NT.DISASTER_GREENHOUSE, NT.GLOBAL_COOLING],
        [NT.SPACE_STATION]
    ),
    
    SPOKED_WHEEL: new SettlementType(
        "Spoked Wheel",
        "A classic wheel design with spokes connecting the hub to the rim",
        COLORS.DarkBlue,
        [NT.DISASTER_EARTHQUAKES, NT.DISASTER_VOLCANO, NT.DISASTER_STORM, NT.DISASTER_TSUNAMI, NT.ICE_CAPS_MELT, NT.OCEAN_EVAPORATION, NT.DISASTER_GREENHOUSE, NT.GLOBAL_COOLING],
        [NT.SPACE_STATION, NT.SCIENTIFIC_BREAKTHROUGH]
    ),
    
    BERNAL_SPHERE: new SettlementType(
        "Bernal Sphere",
        "A spherical station that rotates to provide gravity on its inner surface",
        COLORS.Blue,
        [NT.DISASTER_EARTHQUAKES, NT.DISASTER_VOLCANO, NT.DISASTER_STORM, NT.DISASTER_TSUNAMI, NT.ICE_CAPS_MELT, NT.OCEAN_EVAPORATION, NT.DISASTER_GREENHOUSE, NT.GLOBAL_COOLING],
        [NT.SPACE_STATION, NT.CULTURAL_RENAISSANCE]
    ),
    
    O_NEILL_CYLINDER: new SettlementType(
        "O'Neill Cylinder",
        "A massive cylindrical habitat with internal land area and artificial sun",
        COLORS.Green,
        [NT.DISASTER_EARTHQUAKES, NT.DISASTER_VOLCANO, NT.DISASTER_STORM, NT.DISASTER_TSUNAMI, NT.ICE_CAPS_MELT, NT.OCEAN_EVAPORATION, NT.DISASTER_GREENHOUSE, NT.GLOBAL_COOLING],
        [NT.SPACE_STATION, NT.TERRAFORMING, NT.COLONY_SHIP]
    ),
    
    STANFORD_TORUS: new SettlementType(
        "Stanford Torus",
        "A large donut-shaped station capable of housing thousands",
        COLORS.Orange,
        [NT.DISASTER_EARTHQUAKES, NT.DISASTER_VOLCANO, NT.DISASTER_STORM, NT.DISASTER_TSUNAMI, NT.ICE_CAPS_MELT, NT.OCEAN_EVAPORATION, NT.DISASTER_GREENHOUSE, NT.GLOBAL_COOLING],
        [NT.SPACE_STATION, NT.TOURISM]
    ),
    
    MODULAR_STATION: new SettlementType(
        "Modular Station",
        "A station built from interconnected modules and expandable sections",
        COLORS.Yellow,
        [NT.DISASTER_EARTHQUAKES, NT.DISASTER_VOLCANO, NT.DISASTER_STORM, NT.DISASTER_TSUNAMI, NT.ICE_CAPS_MELT, NT.OCEAN_EVAPORATION, NT.DISASTER_GREENHOUSE, NT.GLOBAL_COOLING],
        [NT.SPACE_STATION, NT.CONSTRUCTION]
    ),
    
    HABITAT_RING: new SettlementType(
        "Habitat Ring",
        "Multiple rotating rings attached to a central non-rotating hub",
        COLORS.Purple,
        [NT.DISASTER_EARTHQUAKES, NT.DISASTER_VOLCANO, NT.DISASTER_STORM, NT.DISASTER_TSUNAMI, NT.ICE_CAPS_MELT, NT.OCEAN_EVAPORATION, NT.DISASTER_GREENHOUSE, NT.GLOBAL_COOLING],
        [NT.SPACE_STATION]
    ),
    
    CRYSTAL_PALACE: new SettlementType(
        "Crystal Palace",
        "A geometric station with transparent sections and solar arrays",
        COLORS.White,
        [NT.DISASTER_EARTHQUAKES, NT.DISASTER_VOLCANO, NT.DISASTER_STORM, NT.DISASTER_TSUNAMI, NT.ICE_CAPS_MELT, NT.OCEAN_EVAPORATION, NT.DISASTER_GREENHOUSE, NT.GLOBAL_COOLING],
        [NT.SPACE_STATION, NT.SOLAR_HARVESTERS, NT.CULTURAL_RENAISSANCE]
    ),
    
    // For ice giant planets with frozen surface layers
    ICE_CITY: new SettlementType(
        "Ice City",
        "Settlements built within or beneath thick ice sheets, utilizing geothermal energy from the planet's core",
        COLORS.LightBlue,
        [NT.DISASTER_GREENHOUSE],
        [NT.GLOBAL_COOLING, NT.ICE_CAPS_MELT]
    ),
    
    // For volcanic/geologically active worlds
    LAVA_CITY: new SettlementType(
        "Lava City",
        "Heavily shielded settlements near active volcanic regions, harvesting geothermal energy and rare minerals",
        COLORS.Red,
        [NT.GLOBAL_COOLING],
        [NT.DISASTER_VOLCANO, NT.DISASTER_EARTHQUAKES, NT.MANTLE_HEATING]
    ),
    
    // For low-atmosphere rocky worlds
    CANYON_CITY: new SettlementType(
        "Canyon City",
        "Settlements built into deep canyons and ravines, offering natural protection from radiation and temperature extremes",
        COLORS.DarkOrange,
        [NT.DISASTER_STORM, NT.ATMOSPHERE_STRIPPED, NT.RADIATION_SICKNESS],
        [NT.DISASTER_EARTHQUAKES]
    ),
})

const SETTLEMENT_TYPES_ALL = Object.values(SETTLEMENT_TYPES)
