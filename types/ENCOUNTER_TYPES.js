
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
 * @property {FormationType|null} formationType - The formation type of the encounter.
 * @property {class} encounterClass - The class used to instantiate this encounter type.
 * 
 * @constructor
 * @param {string} name - The name of the encounter type.
 * @param {number[]} enemyColor - The color associated with the enemy fleet.
 * @param {string} description - A brief description of the encounter type.
 * @param {FactionType} faction - The faction associated with the encounter.
 * @param {FleetType} fleetType - The type of fleet associated with the encounter.
 * @param {AIType} aiType - The AI type used for the encounter.
 * @param {FormationType} formationType - The formation type of the encounter.
 * @param {any} encounterClass - The class used to instantiate this encounter type.
 */
class EncounterType {
    constructor(name = '', enemyColor = COLORS.LightRed, description = '', factionType = FACTION_TYPES_ALL[0], fleetType = FLEET_TYPES_ALL[0], aiType, formationType, encounterClass = Encounter, mapRadius = ENCOUNTER_MAP_RADIUS_MILES) {
        this.name = name;
        this.enemyColor = enemyColor;
        this.description = description;
        this.faction = factionType;
        this.fleetType = fleetType;
        this.aiType = aiType
        this.formationType = formationType;
        this.encounterClass = encounterClass;
        this.mapRadius = mapRadius;
    }
}

const ENCOUNTER_TYPES = {
    MINERS: new EncounterType('Miners', COLORS.Brown, 'You encountered: miners.', FACTION_TYPES.MINERS, FLEET_TYPES.MINERS, AI_TYPES.Ship, FORMATION_TYPES.FaceOff, MinersEncounter),
    TOURISTS: new EncounterType('Tourists', COLORS.LightOrange, 'You encountered: tourists.', FACTION_TYPES.TOURISTS, FLEET_TYPES.TOURISTS, AI_TYPES.Ship, FORMATION_TYPES.FaceOff, TouristsEncounter),
    COLONISTS: new EncounterType('Colonists', COLORS.LightGreen, 'You encountered: colonists.', FACTION_TYPES.COLONISTS, FLEET_TYPES.COLONISTS, AI_TYPES.Ship, FORMATION_TYPES.FaceOff, ColonistsEncounter),
    SCIENTISTS: new EncounterType('Scientists', COLORS.LightCyan, 'You encountered: scientists.', FACTION_TYPES.SCIENTISTS, FLEET_TYPES.SCIENTISTS, AI_TYPES.Ship, FORMATION_TYPES.FaceOff, ScientistsEncounter),
    MERCHANTS: new EncounterType('Merchants', COLORS.Yellow, 'You encountered: merchants.', FACTION_TYPES.MERCHANTS, FLEET_TYPES.MERCHANTS, AI_TYPES.Ship, FORMATION_TYPES.FaceOff, MerchantsEncounter),
    SMUGGLERS: new EncounterType('Smugglers', COLORS.Yellow, 'You encountered: smugglers.', FACTION_TYPES.SMUGGLERS, FLEET_TYPES.SMUGGLERS, AI_TYPES.Ship, FORMATION_TYPES.FaceOff, SmugglersEncounter),
    SYNDICATES: new EncounterType('Syndicates', COLORS.LightRed, 'You encountered: syndicates.', FACTION_TYPES.SYNDICATES, FLEET_TYPES.SYNDICATES, AI_TYPES.Ship, FORMATION_TYPES.FaceOff, SyndicatesEncounter),
    PIRATES: new EncounterType('Pirates', COLORS.LightRed, 'You encountered: pirates.', FACTION_TYPES.PIRATES, FLEET_TYPES.PIRATES, AI_TYPES.Ship, FORMATION_TYPES.FaceOff, PiratesEncounter),
    SLAVERS: new EncounterType('Slavers', COLORS.DarkRed, 'You encountered: slavers.', FACTION_TYPES.SLAVERS, FLEET_TYPES.SLAVERS, AI_TYPES.Ship, FORMATION_TYPES.FaceOff, SlaversEncounter),
    POLICE: new EncounterType('Police', COLORS.LightBlue, 'You encountered: police.', FACTION_TYPES.POLICE, FLEET_TYPES.POLICE, AI_TYPES.Ship, FORMATION_TYPES.FaceOff, PoliceEncounter),
    SOLDIERS: new EncounterType('Soldiers', COLORS.LightGreen, 'You encountered: soldiers.', FACTION_TYPES.SOLDIERS, FLEET_TYPES.SOLDIERS, AI_TYPES.Ship, FORMATION_TYPES.FaceOff, SoldiersEncounter),
    MERCENARIES: new EncounterType('Mercenaries', COLORS.DarkGreen, 'You encountered: mercenaries.', FACTION_TYPES.MERCENARIES, FLEET_TYPES.MERCENARIES, AI_TYPES.Ship, FORMATION_TYPES.FaceOff, MercenariesEncounter),
    BOUNTY_HUNTERS: new EncounterType('Bounty Hunters', COLORS.LightPurple, 'You encountered: bounty hunters.', FACTION_TYPES.BOUNTY_HUNTERS, FLEET_TYPES.BOUNTY_HUNTERS, AI_TYPES.Ship, FORMATION_TYPES.FaceOff, BountyHuntersEncounter),
    DIPLOMATS: new EncounterType('Diplomats', COLORS.LightBlue, 'You encountered: diplomats.', FACTION_TYPES.DIPLOMATS, FLEET_TYPES.DIPLOMATS, AI_TYPES.Ship, FORMATION_TYPES.FaceOff, DiplomatsEncounter),
    SALVAGERS: new EncounterType('Salvagers', COLORS.Orange, 'You encountered: salvagers.', FACTION_TYPES.SALVAGERS, FLEET_TYPES.SALVAGERS, AI_TYPES.Ship, FORMATION_TYPES.FaceOff, SalvagersEncounter),
    TAX_COLLECTORS: new EncounterType('Tax Collectors', COLORS.Gold, 'You encountered: tax collectors.', FACTION_TYPES.TAX_COLLECTORS, FLEET_TYPES.TAX_COLLECTORS, AI_TYPES.Ship, FORMATION_TYPES.FaceOff, TaxCollectorsEncounter),
    REBELS: new EncounterType('Rebels', COLORS.Red, 'You encountered: rebels.', FACTION_TYPES.REBELS, FLEET_TYPES.REBELS, AI_TYPES.Ship, FORMATION_TYPES.FaceOff, RebelsEncounter),
    REFUGEES: new EncounterType('Refugees', COLORS.Brown, 'You encountered: refugees.', FACTION_TYPES.REFUGEES, FLEET_TYPES.REFUGEES, AI_TYPES.Ship, FORMATION_TYPES.FaceOff, RefugeesEncounter),
    ABANDONED_SHIP: new EncounterType('Abandoned Ship', COLORS.Gray, 'You encountered: an abandoned ship.', FACTION_TYPES.PIRATES, PSEUDO_FLEET_TYPES.ABANDONED_SHIP, AI_TYPES.Ship, FORMATION_TYPES.FaceOff, AbandonedShipEncounter),
    ASTEROIDS_STORM: new EncounterType('Asteroid Storm', COLORS.LightGray, 'You encountered: an asteroid storm.', null, PSEUDO_FLEET_TYPES.ASTEROIDS_STORM, AI_TYPES.Asteroid, FORMATION_TYPES.Storm, AsteroidsStormEncounter),
    ASTEROIDS_CALM: new EncounterType('Asteroid Field', COLORS.LightGray, 'You encountered: an asteroid field.', null, PSEUDO_FLEET_TYPES.ASTEROIDS_CALM, AI_TYPES.Asteroid, FORMATION_TYPES.Storm, AsteroidsCalmEncounter),
    CRYOIDS_STORM: new EncounterType('Cryoid Storm', COLORS.LightBlue, 'You encountered: a cryoid storm.', null, PSEUDO_FLEET_TYPES.CRYOIDS_STORM, AI_TYPES.Asteroid, FORMATION_TYPES.Storm, CryoidsStormEncounter),
    CRYOIDS_CALM: new EncounterType('Cryoid Field', COLORS.LightBlue, 'You encountered: a cryoid field.', null, PSEUDO_FLEET_TYPES.CRYOIDS_CALM, AI_TYPES.Asteroid, FORMATION_TYPES.Storm, CryoidsCalmEncounter),
    PLASMOIDS_STORM: new EncounterType('Plasmoid Storm', COLORS.LightRed, 'You encountered: a plasmoid storm.', null, PSEUDO_FLEET_TYPES.PLASMOIDS_STORM, AI_TYPES.Asteroid, FORMATION_TYPES.Storm, PlasmoidsStormEncounter),
    PLASMOIDS_CALM: new EncounterType('Plasmoid Field', COLORS.LightRed, 'You encountered: a plasmoid field.', null, PSEUDO_FLEET_TYPES.PLASMOIDS_CALM, AI_TYPES.Asteroid, FORMATION_TYPES.Storm, PlasmoidsCalmEncounter),
    MAGNETOIDS_STORM: new EncounterType('Magnetoid Storm', COLORS.LightPurple, 'You encountered: a magnetoid storm.', null, PSEUDO_FLEET_TYPES.MAGNETOIDS_STORM, AI_TYPES.Asteroid, FORMATION_TYPES.Storm, MagnetoidsStormEncounter),
    MAGNETOIDS_CALM: new EncounterType('Magnetoid Field', COLORS.LightPurple, 'You encountered: a magnetoid field.', null, PSEUDO_FLEET_TYPES.MAGNETOIDS_CALM, AI_TYPES.Asteroid, FORMATION_TYPES.Storm, MagnetoidsCalmEncounter),
}
const ENCOUNTER_TYPES_ALL = Object.values(ENCOUNTER_TYPES)

