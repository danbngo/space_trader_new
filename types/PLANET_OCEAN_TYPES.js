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
     * @param {Map<CargoType,number>} cargoModifiers - Modifiers for cargo prices based on ocean type.
     */
    constructor(name, description, color = COLORS.White, cargoModifiers = new Map()) {
        /** @type {string} */
        this.name = name
        /** @type {string} */
        this.description = description
        /** @type {number[]} */
        this.color = color
        /** @type {Map<CargoType,number>} */
        this.cargoModifiers = cargoModifiers
    }
}

const PLANET_OCEAN_TYPES = Object.freeze({
    WATER: new PlanetOceanType("Water Oceans", "Liquid water covering portions of the surface", COLORS.Blue, new Map([
        [CARGO_TYPES.WATER, CL.SLIGHTLY_HIGH],
        [CARGO_TYPES.FOOD, CL.SLIGHTLY_HIGH]
    ])),
    SUBSURFACE_WATER: new PlanetOceanType("Subsurface Water Ocean", "Liquid water ocean hidden beneath ice crust", COLORS.DarkBlue, new Map([
        [CARGO_TYPES.WATER, CL.SLIGHTLY_HIGH]
    ])),
    HYDROCARBONACEOUS: new PlanetOceanType("Liquid Hydrocarbons", "Lakes and seas of liquid methane and ethane", COLORS.Orange, new Map()),
    LIQUID_NITROGEN: new PlanetOceanType("Liquid Nitrogen", "Pools of liquid nitrogen at extremely low temperatures", COLORS.LightBlue, new Map()),
    MOLTEN_LAVA: new PlanetOceanType("Molten Lava Seas", "Vast oceans of molten rock on the surface", COLORS.Red, new Map([
        [CARGO_TYPES.METAL, CL.SLIGHTLY_HIGH]
    ])),
    SULFURIC_ACID: new PlanetOceanType("Sulfuric Acid", "Pools of concentrated sulfuric acid", COLORS.Yellow, new Map()),
    BRINE: new PlanetOceanType("Briny Ocean", "Salty water with high concentrations of dissolved minerals", COLORS.LightGreen, new Map([
        [CARGO_TYPES.WATER, CL.SLIGHTLY_LOW],
        [CARGO_TYPES.METAL, CL.SLIGHTLY_HIGH]
    ])),
});

const PLANET_OCEAN_TYPES_ALL = Object.values(PLANET_OCEAN_TYPES);
