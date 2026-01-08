
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
 * @property {AIType} aiType - The AI type used for the encounter.
 * @property {class} encounterClass - The class used to instantiate this encounter type.
 * 
 * @constructor
 * @param {string} name - The name of the encounter type.
 * @param {number[]} enemyColor - The color associated with the enemy fleet.
 * @param {string} description - A brief description of the encounter type.
 * @param {FleetType} fleetType - The type of fleet associated with the encounter.
 * @param {AIType} aiType - The AI type used for the encounter.
 * @param {any} encounterClass - The class used to instantiate this encounter type.
 */
class EncounterType {
    constructor(name = '', enemyColor = COLORS.LightRed, description = '', fleetType = FLEET_TYPES_ALL[0], aiType, encounterClass = Encounter, mapRadius = ENCOUNTER_MAP_RADIUS_MILES) {
        this.name = name;
        this.enemyColor = enemyColor;
        this.description = description;
        this.fleetType = fleetType;
        this.aiType = aiType
        this.encounterClass = encounterClass;
        this.mapRadius = mapRadius;
        /** @type {function} */
        this.onStart = function(encounter) {}
    }
}

const ENCOUNTER_TYPES = {
    MINERS: new EncounterType('Miners', COLORS.Brown, 'You encountered: miners.', FLEET_TYPES.MINERS, AI_TYPES.Ship, MinersEncounter),
    MERCHANTS: new EncounterType('Merchants', COLORS.Yellow, 'You encountered: merchants.', FLEET_TYPES.MERCHANTS, AI_TYPES.Ship, MerchantsEncounter),
    PIRATES: new EncounterType('Pirates', COLORS.LightRed, 'You encountered: pirates.', FLEET_TYPES.PIRATES, AI_TYPES.Ship, PiratesEncounter),
    POLICE: new EncounterType('Police', COLORS.LightBlue, 'You encountered: police.', FLEET_TYPES.POLICE, AI_TYPES.Ship, PoliceEncounter),
    SOLDIERS: new EncounterType('Soldiers', COLORS.LightGreen, 'You encountered: soldiers.', FLEET_TYPES.SOLDIERS, AI_TYPES.Ship, SoldiersEncounter),
    ABANDONED_SHIP: new EncounterType('Abandoned Ship', COLORS.Gray, 'You encountered: an abandoned ship.', PSEUDO_FLEET_TYPES.ABANDONED_SHIP, AI_TYPES.Ship, AbandonedShipEncounter),
    ASTEROIDS_STORM: new EncounterType('Asteroid Storm', COLORS.Gray, 'You encountered: an asteroid storm.', PSEUDO_FLEET_TYPES.ASTEROIDS_STORM, AI_TYPES.Asteroid, AsteroidsStormEncounter),
    ASTEROIDS_CALM: new EncounterType('Asteroid Field', COLORS.Gray, 'You encountered: an asteroid field.', PSEUDO_FLEET_TYPES.ASTEROIDS_CALM, AI_TYPES.Asteroid, AsteroidsCalmEncounter),
}
const ENCOUNTER_TYPES_ALL = Object.values(ENCOUNTER_TYPES)



const ASTEROID_ENCOUNTER_TYPES_ALL = [
    ENCOUNTER_TYPES.ASTEROIDS_STORM, ENCOUNTER_TYPES.ASTEROIDS_CALM, ENCOUNTER_TYPES.CRYOIDS_STORM, ENCOUNTER_TYPES.CRYOIDS_CALM, 
    ENCOUNTER_TYPES.PLASMOIDS_STORM, ENCOUNTER_TYPES.PLASMOIDS_CALM, ENCOUNTER_TYPES.MAGNETOIDS_STORM, ENCOUNTER_TYPES.MAGNETOIDS_CALM
]