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
    [CARGO_TYPES.FOOD, CL.SLIGHTLY_HIGH],
    [CARGO_TYPES.WATER, CL.SLIGHTLY_HIGH],
    [CARGO_TYPES.MEDICINE, CL.SLIGHTLY_HIGH]
  ])),
  TERRESTRIAL: new PlanetType("Terrestrial", COLORS.Brown, new Map([
    [CARGO_TYPES.METAL, CL.SLIGHTLY_HIGH],
    [CARGO_TYPES.ISOTOPES, CL.SLIGHTLY_LOW]
  ])),
  GAS_GIANT: new PlanetType("Gas Giant", COLORS.Orange, new Map([
    [CARGO_TYPES.ISOTOPES, CL.HIGH],
    [CARGO_TYPES.FOOD, CL.VERY_LOW],
    [CARGO_TYPES.METAL, CL.LOW],
    [CARGO_TYPES.WATER, CL.SLIGHTLY_LOW]
  ])),
  GAS_DWARF: new PlanetType("Gas Dwarf", COLORS.LightOrange, new Map([
    [CARGO_TYPES.ISOTOPES, CL.SLIGHTLY_HIGH],
    [CARGO_TYPES.FOOD, CL.LOW],
    [CARGO_TYPES.METAL, CL.SLIGHTLY_LOW]
  ])),
  ICE_GIANT: new PlanetType("Ice Giant", COLORS.LightBlue, new Map([
    [CARGO_TYPES.WATER, CL.HIGH],
    [CARGO_TYPES.ISOTOPES, CL.SLIGHTLY_HIGH],
    [CARGO_TYPES.FOOD, CL.VERY_LOW],
    [CARGO_TYPES.METAL, CL.SLIGHTLY_LOW]
  ])),
  ICE_DWARF: new PlanetType("Ice Dwarf", COLORS.Blue, new Map([
    [CARGO_TYPES.WATER, CL.SLIGHTLY_HIGH],
    [CARGO_TYPES.FOOD, CL.LOW],
    [CARGO_TYPES.METAL, CL.SLIGHTLY_LOW]
  ])),
});

const PLANET_TYPES_ALL = Object.values(PLANET_TYPES)
