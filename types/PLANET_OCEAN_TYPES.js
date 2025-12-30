/**
 * @class PlanetOceanType
 * @classdesc Represents the chemical composition of a planet's oceans or liquid bodies.
 * @property {string} name - The name of the ocean type.
 * @property {string} description - A description of the ocean composition.
 * @property {number[]} color - The color associated with this ocean type (RGBA array).
 */
class PlanetOceanType {
    /**
     * @param {string} name - The name of the ocean type.
     * @param {string} description - A description of the ocean composition.
     * @param {number[]} color - The color associated with this ocean type (RGBA array).
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

const PLANET_OCEAN_TYPES = Object.freeze({
    WATER: new PlanetOceanType("Water Oceans", "Liquid water covering portions of the surface", COLORS.Blue),
    SUBSURFACE_WATER: new PlanetOceanType("Subsurface Water Ocean", "Liquid water ocean hidden beneath ice crust", COLORS.DarkBlue),
    LIQUID_METHANE: new PlanetOceanType("Liquid Methane", "Lakes and seas of liquid methane and ethane", COLORS.Orange),
    LIQUID_NITROGEN: new PlanetOceanType("Liquid Nitrogen", "Pools of liquid nitrogen at extremely low temperatures", COLORS.LightBlue),
    MOLTEN_LAVA: new PlanetOceanType("Molten Lava Seas", "Vast oceans of molten rock on the surface", COLORS.Red),
    SULFURIC_ACID: new PlanetOceanType("Sulfuric Acid", "Pools of concentrated sulfuric acid", COLORS.Yellow),
    BRINE: new PlanetOceanType("Briny Ocean", "Salty water with high concentrations of dissolved minerals", COLORS.Cyan),
});

const PLANET_OCEAN_TYPES_ALL = Object.values(PLANET_OCEAN_TYPES);
