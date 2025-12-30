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

const PLANET_GEOLOGY_TYPES = Object.freeze({
    SILICATE_IRON: new PlanetGeologyType("Silicate-Iron", "Rocky crust with iron-nickel core, typical of terrestrial planets", COLORS.Brown),
    BASALTIC: new PlanetGeologyType("Basaltic", "Dark volcanic rock forming the crust", COLORS.DarkGray),
    GRANITE: new PlanetGeologyType("Granitic", "Continental crust of lighter granitic rock", COLORS.Gray),
    CARBONACEOUS: new PlanetGeologyType("Carbon-Rich", "Geology dominated by carbon compounds, possible diamond layers", COLORS.DarkGray),
    WATER_ICE: new PlanetGeologyType("Water Ice", "Frozen water forming the primary surface material", COLORS.White),
    METHANE_ICE: new PlanetGeologyType("Methane Ice", "Frozen methane and other hydrocarbons", COLORS.LightOrange),
    NITROGEN_ICE: new PlanetGeologyType("Nitrogen Ice", "Frozen nitrogen forming surface features", COLORS.LightBlue),
    MIXED_ICE: new PlanetGeologyType("Mixed Ices", "Combination of water, methane, and nitrogen ices", COLORS.LightGray),
    METALLIC: new PlanetGeologyType("Metallic", "Metal-rich composition, possibly exposed core material", COLORS.Silver),
});

const PLANET_GEOLOGY_TYPES_ALL = Object.values(PLANET_GEOLOGY_TYPES);
