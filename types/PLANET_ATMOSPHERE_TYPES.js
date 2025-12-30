/**
 * @class PlanetAtmosphereType
 * @classdesc Represents the chemical composition of a planet's atmosphere.
 * @property {string} name - The name of the atmosphere type.
 * @property {string} description - A description of the atmosphere composition.
 * @property {number[]} color - The color associated with this atmosphere type (RGBA array).
 */
class PlanetAtmosphereType {
    /**
     * @param {string} name - The name of the atmosphere type.
     * @param {string} description - A description of the atmosphere composition.
     * @param {number[]} color - The color associated with this atmosphere type (RGBA array).
     */
    constructor(name, description, color = COLORS.White) {
        /** @type {string} */
        this.name = name
        /** @type {string} */
        this.description = description
        /** @type {number[]} */
        this.color = color
    }
}

const PLANET_ATMOSPHERE_TYPES = Object.freeze({
    NONE: new PlanetAtmosphereType("No Atmosphere", "Airless body with no significant atmosphere", COLORS.Gray),
    OXYGEN_NITROGEN: new PlanetAtmosphereType("Oxygen-Nitrogen", "Breathable atmosphere dominated by nitrogen and oxygen", COLORS.LightBlue),
    CARBON_DIOXIDE: new PlanetAtmosphereType("Carbon Dioxide", "Dense CO₂ atmosphere, often with greenhouse heating", COLORS.Orange),
    HYDROGEN_HELIUM: new PlanetAtmosphereType("Hydrogen-Helium", "Primordial atmosphere of light gases typical of gas giants", COLORS.Yellow),
    METHANE: new PlanetAtmosphereType("Methane", "Methane-rich atmosphere giving a blue-green appearance", COLORS.Cyan),
    NITROGEN: new PlanetAtmosphereType("Nitrogen", "Nitrogen-dominated atmosphere", COLORS.Blue),
    SULFURIC_ACID: new PlanetAtmosphereType("Sulfuric Acid Clouds", "Thick clouds of sulfuric acid droplets", COLORS.Yellow),
    AMMONIA: new PlanetAtmosphereType("Ammonia", "Ammonia-rich atmosphere with distinctive clouds", COLORS.LightOrange),
    WATER_VAPOR: new PlanetAtmosphereType("Water Vapor", "Steam atmosphere from extreme heat", COLORS.White),
});

const PLANET_ATMOSPHERE_TYPES_ALL = Object.values(PLANET_ATMOSPHERE_TYPES);
