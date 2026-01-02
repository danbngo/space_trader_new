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
     */
    constructor(name, description, color) {
        /** @type {string} */
        this.name = name
        /** @type {string} */
        this.description = description
        /** @type {number[]} */
        this.color = color
    }
}

const SETTLEMENT_TYPES = Object.freeze({
    // For Earth-like planets with optimal conditions
    PLANETARY_MEGACITY: new SettlementType(
        "Planetary Megacity",
        "Sprawling urban centers covering vast swaths of a highly habitable planet's surface",
        COLORS.Green
    ),
    
    // For gas giants - settlements float in upper atmosphere
    CLOUD_CITY: new SettlementType(
        "Cloud City",
        "Floating platforms suspended in the upper atmosphere of gas giants, harvesting resources from the clouds",
        COLORS.LightBlue
    ),
    
    // For ocean worlds or water-covered planets
    FLOATING_CITY: new SettlementType(
        "Floating City",
        "Cities built on massive pontoons and structures floating on liquid surfaces",
        COLORS.Blue
    ),
    
    // For deep ocean worlds
    SUBMERGED_CITY: new SettlementType(
        "Submerged City",
        "Pressurized habitats beneath the waves, built into or around underwater geological features",
        COLORS.DarkBlue
    ),
    
    // For extreme depth ocean trenches
    OCEAN_TRENCH_CITY: new SettlementType(
        "Ocean Trench City",
        "Deep-sea settlements in extreme pressure environments, often mining thermal vents and rare minerals",
        COLORS.DarkCyan
    ),
    
    // For harsh surface conditions (extreme temperature, pressure, radiation)
    DOMED_CITY: new SettlementType(
        "Domed City",
        "Enclosed habitats protected by advanced shielding from hostile surface conditions",
        COLORS.LightGray
    ),
    
    // For planets with extreme surface conditions or minimal atmosphere
    UNDERGROUND_CITY: new SettlementType(
        "Underground City",
        "Subterranean settlements carved into rock, protected from surface radiation and temperature extremes",
        COLORS.Brown
    ),
    
    // For tidally locked planets - settlements in the twilight zone
    TWILIGHT_REGION_CITY: new SettlementType(
        "Twilight Region City",
        "Settlements built in the narrow habitable band between scorching day-side and frozen night-side of tidally locked worlds",
        COLORS.Orange
    ),
    
    // For completely inhospitable planets - no surface settlement possible
    ORBITAL_PLATFORM: new SettlementType(
        "Orbital Platform",
        "Space stations orbiting inhospitable worlds, serving as trade hubs and resource processing centers",
        COLORS.DarkGray
    ),
    
    // Space Station Types - orbital habitats and structures
    TORUS_STATION: new SettlementType(
        "Torus Station",
        "A ring-shaped station that rotates to generate artificial gravity",
        COLORS.Gray
    ),
    
    ROTATING_DRUM: new SettlementType(
        "Rotating Drum",
        "A cylindrical station that spins along its central axis",
        COLORS.LightGray
    ),
    
    TETHERED_STATION: new SettlementType(
        "Tethered Station",
        "Two masses connected by a cable, spinning to create gravity",
        COLORS.White
    ),
    
    SPOKED_WHEEL: new SettlementType(
        "Spoked Wheel",
        "A classic wheel design with spokes connecting the hub to the rim",
        COLORS.DarkBlue
    ),
    
    BERNAL_SPHERE: new SettlementType(
        "Bernal Sphere",
        "A spherical station that rotates to provide gravity on its inner surface",
        COLORS.Blue
    ),
    
    O_NEILL_CYLINDER: new SettlementType(
        "O'Neill Cylinder",
        "A massive cylindrical habitat with internal land area and artificial sun",
        COLORS.Green
    ),
    
    STANFORD_TORUS: new SettlementType(
        "Stanford Torus",
        "A large donut-shaped station capable of housing thousands",
        COLORS.Orange
    ),
    
    MODULAR_STATION: new SettlementType(
        "Modular Station",
        "A station built from interconnected modules and expandable sections",
        COLORS.Yellow
    ),
    
    HABITAT_RING: new SettlementType(
        "Habitat Ring",
        "Multiple rotating rings attached to a central non-rotating hub",
        COLORS.Purple
    ),
    
    CRYSTAL_PALACE: new SettlementType(
        "Crystal Palace",
        "A geometric station with transparent sections and solar arrays",
        COLORS.White
    ),
    
    // For ice giant planets with frozen surface layers
    ICE_CITY: new SettlementType(
        "Ice City",
        "Settlements built within or beneath thick ice sheets, utilizing geothermal energy from the planet's core",
        COLORS.LightBlue
    ),
    
    // For volcanic/geologically active worlds
    LAVA_CITY: new SettlementType(
        "Lava City",
        "Heavily shielded settlements near active volcanic regions, harvesting geothermal energy and rare minerals",
        COLORS.Red
    ),
    
    // For low-atmosphere rocky worlds
    CANYON_CITY: new SettlementType(
        "Canyon City",
        "Settlements built into deep canyons and ravines, offering natural protection from radiation and temperature extremes",
        COLORS.DarkOrange
    ),
})

const SETTLEMENT_TYPES_ALL = Object.values(SETTLEMENT_TYPES)
