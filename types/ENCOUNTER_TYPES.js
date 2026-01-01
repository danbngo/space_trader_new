
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
 * @property {FLEET_TYPES} fleetType - The type of fleet associated with the encounter.
 * @property {AI_TYPES} aiType - The AI type used for the encounter.
 * @property {FORMATION_TYPES} formationType - The formation type of the encounter.
 * @property {class} encounterClass - The class used to instantiate this encounter type.
 * 
 * @constructor
 * @param {string} name - The name of the encounter type.
 * @param {number[]} enemyColor - The color associated with the enemy fleet.
 * @param {string} description - A brief description of the encounter type.
 * @param {FLEET_TYPES} fleetType - The type of fleet associated with the encounter.
 * @param {AI_TYPES} aiType - The AI type used for the encounter.
 * @param {FORMATION_TYPES} formationType - The formation type of the encounter.
 * @param {any} encounterClass - The class used to instantiate this encounter type.
 */
class EncounterType {
    constructor(name = '', enemyColor = COLORS.LightRed, description = '', fleetType = FLEET_TYPES_ALL[0], aiType, formationType, encounterClass = Encounter, mapRadius = ENCOUNTER_MAP_RADIUS_MILES) {
        this.name = name;
        this.enemyColor = enemyColor;
        this.description = description;
        this.fleetType = fleetType;
        this.aiType = aiType
        this.formationType = formationType;
        this.encounterClass = encounterClass;
        this.mapRadius = mapRadius;
    }
}

const ENCOUNTER_TYPES = {
    MINERS: new EncounterType('Miners', COLORS.Brown, 'You encountered: miners.', FLEET_TYPES.MINERS, AI_TYPES.Ship, FORMATION_TYPES.FaceOff, MinersEncounter),
    TOURISTS: new EncounterType('Tourists', COLORS.LightOrange, 'You encountered: tourists.', FLEET_TYPES.TOURISTS, AI_TYPES.Ship, FORMATION_TYPES.FaceOff, TouristsEncounter),
    COLONISTS: new EncounterType('Colonists', COLORS.LightGreen, 'You encountered: colonists.', FLEET_TYPES.COLONISTS, AI_TYPES.Ship, FORMATION_TYPES.FaceOff, ColonistsEncounter),
    SCIENTISTS: new EncounterType('Scientists', COLORS.Cyan, 'You encountered: scientists.', FLEET_TYPES.SCIENTISTS, AI_TYPES.Ship, FORMATION_TYPES.FaceOff, ScientistsEncounter),
    MERCHANTS: new EncounterType('Merchants', COLORS.Yellow, 'You encountered: merchants.', FLEET_TYPES.MERCHANTS, AI_TYPES.Ship, FORMATION_TYPES.FaceOff, MerchantsEncounter),
    SMUGGLERS: new EncounterType('Smugglers', COLORS.Yellow, 'You encountered: smugglers.', FLEET_TYPES.SMUGGLERS, AI_TYPES.Ship, FORMATION_TYPES.FaceOff, SmugglersEncounter),
    PIRATES: new EncounterType('Pirates', COLORS.LightRed, 'You encountered: pirates.', FLEET_TYPES.PIRATES, AI_TYPES.Ship, FORMATION_TYPES.FaceOff, PiratesEncounter),
    SLAVERS: new EncounterType('Slavers', COLORS.DarkRed, 'You encountered: slavers.', FLEET_TYPES.SLAVERS, AI_TYPES.Ship, FORMATION_TYPES.FaceOff, SlaversEncounter),
    POLICE: new EncounterType('Police', COLORS.LightBlue, 'You encountered: police.', FLEET_TYPES.POLICE, AI_TYPES.Ship, FORMATION_TYPES.FaceOff, PoliceEncounter),
    SOLDIERS: new EncounterType('Soldiers', COLORS.LightGreen, 'You encountered: soldiers.', FLEET_TYPES.SOLDIERS, AI_TYPES.Ship, FORMATION_TYPES.FaceOff, SoldiersEncounter),
    BOUNTY_HUNTERS: new EncounterType('Bounty Hunters', COLORS.LightPurple, 'You encountered: bounty hunters.', FLEET_TYPES.BOUNTY_HUNTERS, AI_TYPES.Ship, FORMATION_TYPES.FaceOff, BountyHuntersEncounter),
    ABANDONED_SHIP: new EncounterType('Abandoned Ship', COLORS.Gray, 'You encountered: an abandoned ship.', PSEUDO_FLEET_TYPES.ABANDONED_SHIP, AI_TYPES.Ship, FORMATION_TYPES.FaceOff, AbandonedShipEncounter),
    ASTEROIDS_STORM: new EncounterType('Asteroid Storm', COLORS.LightGray, 'You encountered: an asteroid storm.', PSEUDO_FLEET_TYPES.ASTEROIDS_STORM, AI_TYPES.Asteroid, FORMATION_TYPES.Storm, AsteroidsStormEncounter, 60),
    ASTEROIDS_CALM: new EncounterType('Asteroid Field', COLORS.LightGray, 'You encountered: an asteroid field.', PSEUDO_FLEET_TYPES.ASTEROIDS_CALM, AI_TYPES.Asteroid, FORMATION_TYPES.Storm, AsteroidsCalmEncounter, 60),
    CRYOIDS_STORM: new EncounterType('Cryoid Storm', COLORS.LightBlue, 'You encountered: a cryoid storm.', PSEUDO_FLEET_TYPES.CRYOIDS_STORM, AI_TYPES.Asteroid, FORMATION_TYPES.Storm, CryoidsStormEncounter, 60),
    CRYOIDS_CALM: new EncounterType('Cryoid Field', COLORS.LightBlue, 'You encountered: a cryoid field.', PSEUDO_FLEET_TYPES.CRYOIDS_CALM, AI_TYPES.Asteroid, FORMATION_TYPES.Storm, CryoidsCalmEncounter, 60),
    PLASMOIDS_STORM: new EncounterType('Plasmoid Storm', COLORS.LightRed, 'You encountered: a plasmoid storm.', PSEUDO_FLEET_TYPES.PLASMOIDS_STORM, AI_TYPES.Asteroid, FORMATION_TYPES.Storm, PlasmoidsStormEncounter, 60),
    PLASMOIDS_CALM: new EncounterType('Plasmoid Field', COLORS.LightRed, 'You encountered: a plasmoid field.', PSEUDO_FLEET_TYPES.PLASMOIDS_CALM, AI_TYPES.Asteroid, FORMATION_TYPES.Storm, PlasmoidsCalmEncounter, 60),
    MAGNETOIDS_STORM: new EncounterType('Magnetoid Storm', COLORS.LightPurple, 'You encountered: a magnetoid storm.', PSEUDO_FLEET_TYPES.MAGNETOIDS_STORM, AI_TYPES.Asteroid, FORMATION_TYPES.Storm, MagnetoidsStormEncounter, 60),
    MAGNETOIDS_CALM: new EncounterType('Magnetoid Field', COLORS.LightPurple, 'You encountered: a magnetoid field.', PSEUDO_FLEET_TYPES.MAGNETOIDS_CALM, AI_TYPES.Asteroid, FORMATION_TYPES.Storm, MagnetoidsCalmEncounter, 60),
}
const ENCOUNTER_TYPES_ALL = Object.values(ENCOUNTER_TYPES)

