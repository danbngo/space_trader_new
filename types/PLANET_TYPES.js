/**
 * @class PlanetType
 * @classdesc Represents a type of planet with specific visual characteristics.
 * @property {string} name - The name of the planet type.
 * @property {number[]} color - The default color for this planet type (RGBA array).
 */
class PlanetType {
    /**
     * @param {string} name - The name of the planet type.
     * @param {number[]} color - The default color for this planet type (RGBA array).
     */
    constructor(name, color) {
        /** @type {string} */
        this.name = name
        /** @type {number[]} */
        this.color = color
    }
}


const PLANET_TYPES = Object.freeze({
  EARTHLIKE: new PlanetType("Earthlike", COLORS.Blue),
  TERRESTRIAL: new PlanetType("Terrestrial", COLORS.Brown),
  GAS_GIANT: new PlanetType("Gas Giant", COLORS.Orange),
  GAS_DWARF: new PlanetType("Gas Dwarf", COLORS.LightOrange),
  ICE_GIANT: new PlanetType("Ice Giant", COLORS.Cyan),
  ICE_DWARF: new PlanetType("Ice Dwarf", COLORS.LightBlue),
});

const PLANET_TYPES_ALL = Object.values(PLANET_TYPES)
