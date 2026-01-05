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
     * @param {CivilizationParams} civMultipliers - Modifiers for cargo prices at this settlement type.
     */
    constructor(name, description, color, civMultipliers) {
        /** @type {string} */
        this.name = name
        /** @type {string} */
        this.description = description
        /** @type {number[]} */
        this.color = color
        /** @type {CivilizationParams} */
        this.civMultipliers = civMultipliers
    }
}

const SETTLEMENT_TYPES = Object.freeze({
    // For Earth-like planets with optimal conditions
    PLANETARY_MEGACITY: new SettlementType(
        "Planetary Megacity",
        "Sprawling urban centers covering vast swaths of a highly habitable planet's surface",
        COLORS.Green,
        {
            population: 1.25,
            economy: 1.25,
            culture: 0.75,
            security: 0.75,
        }
    ),
    
    // For gas giants - settlements float in upper atmosphere
    CLOUD_CITY: new SettlementType(
        "Cloud City",
        "Floating platforms suspended in the upper atmosphere of gas giants, harvesting resources from the clouds",
        COLORS.LightBlue,
        {
            technology: 1.15,
            industry: 1.2,
            population: 0.8,
            reserves: 1.1,
        }
    ),
    
    // For ocean worlds or water-covered planets
    FLOATING_CITY: new SettlementType(
        "Floating City",
        "Cities built on massive pontoons and structures floating on liquid surfaces",
        COLORS.Blue,
        {
            economy: 1.15,
            reserves: 1.2,
            culture: 1.1,
            territory: 0.85,
        }
    ),
    
    // For deep ocean worlds
    SUBMERGED_CITY: new SettlementType(
        "Submerged City",
        "Pressurized habitats beneath the waves, built into or around underwater geological features",
        COLORS.DarkBlue,
        {
            technology: 1.2,
            education: 1.15,
            population: 0.85,
            territory: 0.7,
        }
    ),
    
    // For extreme depth ocean trenches
    OCEAN_TRENCH_CITY: new SettlementType(
        "Ocean Trench City",
        "Deep-sea settlements in extreme pressure environments, often mining thermal vents and rare minerals",
        COLORS.DarkCyan,
        {
            technology: 1.25,
            industry: 1.3,
            population: 0.7,
            territory: 0.6,
            reserves: 1.15,
        }
    ),
    
    // For harsh surface conditions (extreme temperature, pressure, radiation)
    DOMED_CITY: new SettlementType(
        "Domed City",
        "Enclosed habitats protected by advanced shielding from hostile surface conditions",
        COLORS.LightGray,
        {
            technology: 1.2,
            security: 1.15,
            culture: 0.85,
            population: 0.9,
        }
    ),
    
    // For planets with extreme surface conditions or minimal atmosphere
    UNDERGROUND_CITY: new SettlementType(
        "Underground City",
        "Subterranean settlements carved into rock, protected from surface radiation and temperature extremes",
        COLORS.Brown,
        {
            security: 1.25,
            reserves: 1.2,
            industry: 1.15,
            culture: 0.75,
            economy: 0.85,
        }
    ),
    
    // For tidally locked planets - settlements in the twilight zone
    TWILIGHT_REGION_CITY: new SettlementType(
        "Twilight Region City",
        "Settlements built in the narrow habitable band between scorching day-side and frozen night-side of tidally locked worlds",
        COLORS.Orange,
        {
            education: 1.1,
            technology: 1.1,
            territory: 0.75,
            population: 0.9,
        }
    ),
    
    // For completely inhospitable planets - no surface settlement possible
    ORBITAL_PLATFORM: new SettlementType(
        "Orbital Platform",
        "Space stations orbiting inhospitable worlds, serving as trade hubs and resource processing centers",
        COLORS.DarkGray,
        {
            technology: 1.25,
            economy: 1.3,
            industry: 1.15,
            population: 0.7,
            territory: 0.5,
        }
    ),
    
    // Space Station Types - orbital habitats and structures
    TORUS_STATION: new SettlementType(
        "Torus Station",
        "A ring-shaped station that rotates to generate artificial gravity",
        COLORS.Gray,
        {
            technology: 1.15,
            economy: 1.2,
            population: 0.75,
            security: 1.1,
        }
    ),
    
    ROTATING_DRUM: new SettlementType(
        "Rotating Drum",
        "A cylindrical station that spins along its central axis",
        COLORS.LightGray,
        {
            technology: 1.15,
            economy: 1.15,
            population: 0.8,
            culture: 0.9,
        }
    ),
    
    TETHERED_STATION: new SettlementType(
        "Tethered Station",
        "Two masses connected by a cable, spinning to create gravity",
        COLORS.White,
        {
            technology: 1.2,
            industry: 1.1,
            population: 0.7,
            security: 0.85,
        }
    ),
    
    SPOKED_WHEEL: new SettlementType(
        "Spoked Wheel",
        "A classic wheel design with spokes connecting the hub to the rim",
        COLORS.DarkBlue,
        {
            technology: 1.2,
            economy: 1.15,
            education: 1.1,
            population: 0.75,
        }
    ),
    
    BERNAL_SPHERE: new SettlementType(
        "Bernal Sphere",
        "A spherical station that rotates to provide gravity on its inner surface",
        COLORS.Blue,
        {
            education: 1.2,
            culture: 1.15,
            technology: 1.1,
            population: 0.8,
        }
    ),
    
    O_NEILL_CYLINDER: new SettlementType(
        "O'Neill Cylinder",
        "A massive cylindrical habitat with internal land area and artificial sun",
        COLORS.Green,
        {
            population: 1.15,
            culture: 1.2,
            economy: 1.15,
            territory: 1.1,
        }
    ),
    
    STANFORD_TORUS: new SettlementType(
        "Stanford Torus",
        "A large donut-shaped station capable of housing thousands",
        COLORS.Orange,
        {
            population: 1.1,
            economy: 1.2,
            culture: 1.15,
            education: 1.1,
        }
    ),
    
    MODULAR_STATION: new SettlementType(
        "Modular Station",
        "A station built from interconnected modules and expandable sections",
        COLORS.Yellow,
        {
            technology: 1.25,
            industry: 1.2,
            economy: 1.1,
            population: 0.85,
        }
    ),
    
    HABITAT_RING: new SettlementType(
        "Habitat Ring",
        "Multiple rotating rings attached to a central non-rotating hub",
        COLORS.Purple,
        {
            population: 1.05,
            economy: 1.15,
            technology: 1.15,
            culture: 1.05,
        }
    ),
    
    CRYSTAL_PALACE: new SettlementType(
        "Crystal Palace",
        "A geometric station with transparent sections and solar arrays",
        COLORS.White,
        {
            wealth: 1.3,
            culture: 1.25,
            prestige: 1.2,
            population: 0.7,
        }
    ),
    
    // For ice giant planets with frozen surface layers
    ICE_CITY: new SettlementType(
        "Ice City",
        "Settlements built within or beneath thick ice sheets, utilizing geothermal energy from the planet's core",
        COLORS.LightBlue,
        {
            reserves: 1.3,
            industry: 1.15,
            technology: 1.1,
            culture: 0.85,
        }
    ),
    
    // For volcanic/geologically active worlds
    LAVA_CITY: new SettlementType(
        "Lava City",
        "Heavily shielded settlements near active volcanic regions, harvesting geothermal energy and rare minerals",
        COLORS.Red,
        {
            industry: 1.35,
            reserves: 1.25,
            technology: 1.15,
            security: 0.8,
            population: 0.75,
        }
    ),
    
    // For low-atmosphere rocky worlds
    CANYON_CITY: new SettlementType(
        "Canyon City",
        "Settlements built into deep canyons and ravines, offering natural protection from radiation and temperature extremes",
        COLORS.DarkOrange,
        {
            security: 1.2,
            reserves: 1.15,
            population: 0.85,
            economy: 0.9,
        }
    ),
})

const SETTLEMENT_TYPES_ALL = Object.values(SETTLEMENT_TYPES)
