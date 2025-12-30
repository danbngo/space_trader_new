
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
    MERCHANTS: new EncounterType('Merchants', COLORS.Yellow, 'You encountered: merchants.', FLEET_TYPES.MERCHANTS, AI_TYPES.Ship, FORMATION_TYPES.FaceOff, MerchantsEncounter),
    SMUGGLERS: new EncounterType('Smugglers', COLORS.Yellow, 'You encountered: smugglers.', FLEET_TYPES.SMUGGLERS, AI_TYPES.Ship, FORMATION_TYPES.FaceOff, SmugglersEncounter),
    PIRATES: new EncounterType('Pirates', COLORS.LightRed, 'You encountered: pirates.', FLEET_TYPES.PIRATES, AI_TYPES.Ship, FORMATION_TYPES.FaceOff, PiratesEncounter),
    POLICE: new EncounterType('Police', COLORS.LightBlue, 'You encountered: police.', FLEET_TYPES.POLICE, AI_TYPES.Ship, FORMATION_TYPES.FaceOff, PoliceEncounter),
    SOLDIERS: new EncounterType('Soldiers', COLORS.LightGreen, 'You encountered: soldiers.', FLEET_TYPES.SOLDIERS, AI_TYPES.Ship, FORMATION_TYPES.FaceOff, SoldiersEncounter),
    BOUNTY_HUNTERS: new EncounterType('Bounty Hunters', COLORS.LightPurple, 'You encountered: bounty hunters.', FLEET_TYPES.BOUNTY_HUNTERS, AI_TYPES.Ship, FORMATION_TYPES.FaceOff, BountyHuntersEncounter),
    ASTEROIDS: new EncounterType('Asteroids', COLORS.LightGray, 'You encountered: asteroids.', FLEET_TYPES.ASTEROIDS, AI_TYPES.Asteroid, FORMATION_TYPES.Storm, AsteroidsEncounter, 60),
    CRYOIDS: new EncounterType('Cryoids', COLORS.LightBlue, 'You encountered: cryoids.', FLEET_TYPES.CRYOIDS, AI_TYPES.Asteroid, FORMATION_TYPES.Storm, CryoidsEncounter, 60),
    PLASMOIDS: new EncounterType('Plasmoids', COLORS.LightRed, 'You encountered: plasmoids.', FLEET_TYPES.PLASMOIDS, AI_TYPES.Asteroid, FORMATION_TYPES.Storm, PlasmoidsEncounter, 60),
}
const ENCOUNTER_TYPES_ALL = Object.values(ENCOUNTER_TYPES)

//simulates the player doing his best to escape the hazard, creates a random combat result basically
function autoNavigateHazard(encounter = new Encounter()) {
    const {playerShips, enemyShips} = encounter
    const maxDamage = enemyShips.reduce((sum, ship)=>sum + ship.hull[1]*ship.engine*0.001, 0);
    const damage = rng(maxDamage, 0, true)
    console.log('gs.fleet.flagShip hull before:', gs.fleet.flagship.hull[0], gs.fleet.flagship.hull[1]);
    damageRandomly(playerShips, damage)
    const disabledShips = playerShips.filter(s=>s.disabled)
    const survivedShips = playerShips.filter(s=>!s.disabled)
    for (const s of survivedShips) s.escaped = true
    console.log(`autoNavigateHazard`, {maxDamage, damage, disabledShips, playerShips});
    console.log('gs.fleet.flagShip hull after:', gs.fleet.flagship.hull[0], gs.fleet.flagship.hull[1]);
    if (disabledShips.length >= playerShips.length) {
        showPlayerDefeatedByHazardsModal()
    }
    else {
        showPlayerEscapedFromHazardsModal()
    }
}
