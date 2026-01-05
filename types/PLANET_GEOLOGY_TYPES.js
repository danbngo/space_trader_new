/**
 * @class PlanetGeologyType
 * @classdesc Represents the geological composition of a planet's crust and interior.
 * @property {string} name - The name of the geology type.
 * @property {string} description - A description of the geological composition.
 * @property {number[]} color - The color associated with this geology type (RGBA array).
 */
class PlanetGeologyType {
    /**
     * @param {string} name - The name of the geology type.
     * @param {string} description - A description of the geological composition.
     * @param {number[]} color - The color associated with this geology type (RGBA array).
     * @param {Map<CargoType,number>} cargoModifiers - Modifiers for cargo prices based on geology.
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

const PLANET_GEOLOGY_TYPES = Object.freeze({
    SILICATE_IRON: new PlanetGeologyType("Silicate-Iron", "Rocky crust with iron-nickel core, typical of terrestrial planets", COLORS.Brown, new Map([
        [CARGO_TYPES.METAL, CL.SLIGHTLY_HIGH]
    ])),
    BASALTIC: new PlanetGeologyType("Basaltic", "Dark volcanic rock forming the crust", COLORS.DarkGray, new Map([
        [CARGO_TYPES.METAL, CL.SLIGHTLY_HIGH]
    ])),
    GRANITE: new PlanetGeologyType("Granitic", "Continental crust of lighter granitic rock", COLORS.Gray, new Map()),
    CARBONACEOUS: new PlanetGeologyType("Carbon-Rich", "Geology dominated by carbon compounds, possible diamond layers", COLORS.DarkGray, new Map()),
    WATER_ICE: new PlanetGeologyType("Water Ice", "Frozen water forming the primary surface material", COLORS.White, new Map([
        [CARGO_TYPES.WATER, CL.SLIGHTLY_HIGH]
    ])),
    METHANE_ICE: new PlanetGeologyType("Methane Ice", "Frozen methane and other hydrocarbons", COLORS.LightOrange, new Map()),
    NITROGEN_ICE: new PlanetGeologyType("Nitrogen Ice", "Frozen nitrogen forming surface features", COLORS.LightBlue, new Map()),
    MIXED_ICE: new PlanetGeologyType("Mixed Ices", "Combination of water, methane, and nitrogen ices", COLORS.LightGray, new Map([
        [CARGO_TYPES.WATER, CL.SLIGHTLY_HIGH]
    ])),
    METALLIC: new PlanetGeologyType("Metallic", "Metal-rich composition, possibly exposed core material", COLORS.Silver, new Map([
        [CARGO_TYPES.METAL, CL.HIGH],
        [CARGO_TYPES.ISOTOPES, CL.SLIGHTLY_HIGH]
    ])),
});

const PLANET_GEOLOGY_TYPES_ALL = Object.values(PLANET_GEOLOGY_TYPES);
