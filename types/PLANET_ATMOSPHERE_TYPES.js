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
     * @param {Map<CargoType,number>} cargoModifiers - Modifiers for cargo prices based on atmosphere.
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

const PLANET_ATMOSPHERE_TYPES = Object.freeze({
    NONE: new PlanetAtmosphereType("No Atmosphere", "Airless body with no significant atmosphere", COLORS.Gray, new Map([
        [CARGO_TYPES.WATER, CL.SLIGHTLY_LOW],
        [CARGO_TYPES.FOOD, CL.SLIGHTLY_LOW]
    ])),
    OXYGEN_NITROGEN: new PlanetAtmosphereType("Oxygen-Nitrogen", "Breathable atmosphere dominated by nitrogen and oxygen", COLORS.LightBlue, new Map([
        [CARGO_TYPES.FOOD, CL.SLIGHTLY_HIGH],
        [CARGO_TYPES.MEDICINE, CL.SLIGHTLY_HIGH]
    ])),
    CARBONACEOUS_DIOXIDE: new PlanetAtmosphereType("Carbon Dioxide", "Dense CO₂ atmosphere, often with greenhouse heating", COLORS.Orange, new Map([
        [CARGO_TYPES.FOOD, CL.SLIGHTLY_LOW]
    ])),
    HYDROGEN_HELIUM: new PlanetAtmosphereType("Hydrogen-Helium", "Primordial atmosphere of light gases typical of gas giants", COLORS.Yellow, new Map([
        [CARGO_TYPES.ISOTOPES, CL.SLIGHTLY_HIGH]
    ])),
    METHANE: new PlanetAtmosphereType("Methane", "Methane-rich atmosphere giving a blue-green appearance", COLORS.LightGreen, new Map()),
    NITROGEN: new PlanetAtmosphereType("Nitrogen", "Nitrogen-dominated atmosphere", COLORS.Blue, new Map()),
    SULFURIC_ACID: new PlanetAtmosphereType("Sulfuric Acid Clouds", "Thick clouds of sulfuric acid droplets", COLORS.Yellow, new Map([
        [CARGO_TYPES.FOOD, CL.SLIGHTLY_LOW],
        [CARGO_TYPES.MEDICINE, CL.SLIGHTLY_LOW]
    ])),
    SULFUR_DIOXIDE: new PlanetAtmosphereType("Sulfur Dioxide", "TBA", COLORS.Yellow, new Map([
        [CARGO_TYPES.FOOD, CL.SLIGHTLY_LOW]
    ])),
    OXYGEN: new PlanetAtmosphereType("Oxygen", "TBA", COLORS.White, new Map()),
    AMMONIA: new PlanetAtmosphereType("Ammonia", "Ammonia-rich atmosphere with distinctive clouds", COLORS.LightOrange, new Map()),
    WATER_VAPOR: new PlanetAtmosphereType("Water Vapor", "Steam atmosphere from extreme heat", COLORS.White, new Map([
        [CARGO_TYPES.WATER, CL.SLIGHTLY_HIGH]
    ])),
});

const PLANET_ATMOSPHERE_TYPES_ALL = Object.values(PLANET_ATMOSPHERE_TYPES);
