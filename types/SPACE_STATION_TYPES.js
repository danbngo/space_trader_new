/**
 * @class SpaceStationType
 * @classdesc Represents a type of space station with specific structural characteristics.
 * @property {string} name - The name of the space station type.
 * @property {number[]} color - The default color for this space station type (RGBA array).
 * @property {string} description - A brief description of the station design.
 */
class SpaceStationType {
    /**
     * @param {string} name - The name of the space station type.
     * @param {number[]} color - The default color for this space station type (RGBA array).
     * @param {string} description - A brief description of the station design.
     */
    constructor(name, color, description = '') {
        /** @type {string} */
        this.name = name
        /** @type {number[]} */
        this.color = color
        /** @type {string} */
        this.description = description
    }
}


const SPACE_STATION_TYPES = Object.freeze({
  TORUS: new SpaceStationType("Torus Station", COLORS.Gray, "A ring-shaped station that rotates to generate artificial gravity"),
  ROTATING_DRUM: new SpaceStationType("Rotating Drum", COLORS.LightGray, "A cylindrical station that spins along its central axis"),
  TETHERED: new SpaceStationType("Tethered Station", COLORS.White, "Two masses connected by a cable, spinning to create gravity"),
  SPOKED_WHEEL: new SpaceStationType("Spoked Wheel", COLORS.LightBlue, "A classic wheel design with spokes connecting the hub to the rim"),
  BERNAL_SPHERE: new SpaceStationType("Bernal Sphere", COLORS.Blue, "A spherical station that rotates to provide gravity on its inner surface"),
  O_NEILL_CYLINDER: new SpaceStationType("O'Neill Cylinder", COLORS.Green, "A massive cylindrical habitat with internal land area and artificial sun"),
  STANFORD_TORUS: new SpaceStationType("Stanford Torus", COLORS.Orange, "A large donut-shaped station capable of housing thousands"),
  MODULAR: new SpaceStationType("Modular Station", COLORS.Yellow, "A station built from interconnected modules and expandable sections"),
  HABITAT_RING: new SpaceStationType("Habitat Ring", COLORS.Purple, "Multiple rotating rings attached to a central non-rotating hub"),
  CRYSTAL_PALACE: new SpaceStationType("Crystal Palace", COLORS.Cyan, "A geometric station with transparent sections and solar arrays"),
});

const SPACE_STATION_TYPES_ALL = Object.values(SPACE_STATION_TYPES)
