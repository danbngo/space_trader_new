
/**
 * @fileoverview Defines various encounter types for the game.
 * @module types/ENCOUNTER_TYPES
 */


/**
 * @class EncounterType
 * @classdesc Represents a type of encounter in the game.
 * @property {string} name - The name of the encounter type.
 * @property {number[]} enemyColor - The color associated with the enemy fleet.
 * @property {string} description - A brief description of the encounter type.
 * @property {FleetType} fleetType - The type of fleet associated with the encounter.
 * @property {number} reputationMultiplier
 * @property {boolean} canBribe
 * @property {class} encounterClass - The class used to instantiate this encounter type.
 * 
 * @constructor
 * @param {string} name - The name of the encounter type.
 * @param {number} weight - The weight/probability of this encounter type occurring.
 * @param {number[]} enemyColor - The color associated with the enemy fleet.
 * @param {string} description - A brief description of the encounter type.
 * @param {FleetType} fleetType - The type of fleet associated with the encounter.
 * @param {any} encounterClass - The class used to instantiate this encounter type.
 * @param {number} reputationMultiplier
 * @param {boolean} canBribe
 */
class EncounterType {
    constructor(name = '', weight = 1.0, enemyColor = COLORS.LightRed, description = '', fleetType = FLEET_TYPES_ALL[0], encounterClass = Encounter, reputationMultiplier = 1, canBribe = false) {
        this.name = name;
        this.weight = weight;
        this.enemyColor = enemyColor;
        this.description = description;
        this.fleetType = fleetType;
        this.reputationMultiplier = reputationMultiplier
        this.encounterClass = encounterClass;
        this.canBribe = canBribe;
        /** @type {function} */
        this.onStart = function(encounter) {}
    }
}

const ENCOUNTER_TYPES = {
    //MINERS: new EncounterType('Miners', COLORS.Brown, 'You encountered: miners.', FLEET_TYPES.MINERS, MinersEncounter, 1, true),
    MERCHANTS: new EncounterType('Merchants', 1.0, COLORS.Yellow, 'You encountered: merchants.', FLEET_TYPES.MERCHANTS, MerchantsEncounter, 1, true),
    //PIRATES: new EncounterType('Pirates', COLORS.LightRed, 'You encountered: pirates.', FLEET_TYPES.PIRATES, PiratesEncounter, -2, false),
    //POLICE: new EncounterType('Police', COLORS.LightBlue, 'You encountered: police.', FLEET_TYPES.POLICE, PoliceEncounter, 2, false),
    //SOLDIERS: new EncounterType('Soldiers', COLORS.LightGreen, 'You encountered: soldiers.', FLEET_TYPES.SOLDIERS, SoldiersEncounter, 3, false),
    //ABANDONED_SHIP: new EncounterType('Abandoned Ship', COLORS.Gray, 'You encountered: an abandoned ship.', PSEUDO_FLEET_TYPES.ABANDONED_SHIP, AbandonedShipEncounter, 0, false),
    //ASTEROIDS_STORM: new EncounterType('Asteroid Storm', COLORS.Gray, 'You encountered: an asteroid storm.', PSEUDO_FLEET_TYPES.ASTEROIDS_STORM, AsteroidsStormEncounter, 0, false),
    //ASTEROIDS_CALM: new EncounterType('Asteroid Field', COLORS.Gray, 'You encountered: an asteroid field.', PSEUDO_FLEET_TYPES.ASTEROIDS_CALM, AsteroidsCalmEncounter, 0, false),
}
const ENCOUNTER_TYPES_ALL = Object.values(ENCOUNTER_TYPES)



const ASTEROID_ENCOUNTER_TYPES_ALL = [
    ENCOUNTER_TYPES.ASTEROIDS_STORM, ENCOUNTER_TYPES.ASTEROIDS_CALM, ENCOUNTER_TYPES.CRYOIDS_STORM, ENCOUNTER_TYPES.CRYOIDS_CALM, 
    ENCOUNTER_TYPES.PLASMOIDS_STORM, ENCOUNTER_TYPES.PLASMOIDS_CALM, ENCOUNTER_TYPES.MAGNETOIDS_STORM, ENCOUNTER_TYPES.MAGNETOIDS_CALM
]