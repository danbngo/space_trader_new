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
     * @param {Map<CargoType,number>} cargoModifiers - Modifiers for cargo prices on this planet type.
     */
    constructor(name, color, cargoModifiers) {
        /** @type {string} */
        this.name = name
        /** @type {number[]} */
        this.color = color
        /** @type {Map<CargoType,number>} */
        this.cargoModifiers = cargoModifiers || new Map()
    }
}


const PLANET_TYPES = Object.freeze({
  EARTHLIKE: new PlanetType("Earthlike", COLORS.Blue, new Map([
    [CARGO_TYPES.FOOD, 0.7],
    [CARGO_TYPES.WATER, 0.7],
    [CARGO_TYPES.MEDICINE, 0.9],
    [CARGO_TYPES.METAL, 0.9]
  ])),
  TERRESTRIAL: new PlanetType("Terrestrial", COLORS.Brown, new Map([
    [CARGO_TYPES.FOOD, 0.85],
    [CARGO_TYPES.WATER, 0.85],
    [CARGO_TYPES.METAL, 0.8],
    [CARGO_TYPES.ISOTOPES, 1.1]
  ])),
  GAS_GIANT: new PlanetType("Gas Giant", COLORS.Orange, new Map([
    [CARGO_TYPES.ISOTOPES, 0.6],
    [CARGO_TYPES.FOOD, 2.5],
    [CARGO_TYPES.METAL, 1.5],
    [CARGO_TYPES.WATER, 1.3]
  ])),
  GAS_DWARF: new PlanetType("Gas Dwarf", COLORS.LightOrange, new Map([
    [CARGO_TYPES.ISOTOPES, 0.75],
    [CARGO_TYPES.FOOD, 2.0],
    [CARGO_TYPES.METAL, 1.3],
    [CARGO_TYPES.WATER, 1.2]
  ])),
  ICE_GIANT: new PlanetType("Ice Giant", COLORS.LightBlue, new Map([
    [CARGO_TYPES.WATER, 0.5],
    [CARGO_TYPES.ISOTOPES, 0.7],
    [CARGO_TYPES.FOOD, 2.3],
    [CARGO_TYPES.METAL, 1.4]
  ])),
  ICE_DWARF: new PlanetType("Ice Dwarf", COLORS.Blue, new Map([
    [CARGO_TYPES.WATER, 0.6],
    [CARGO_TYPES.FOOD, 2.0],
    [CARGO_TYPES.METAL, 1.3]
  ])),
});

const PLANET_TYPES_ALL = Object.values(PLANET_TYPES)
