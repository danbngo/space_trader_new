
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
 * @property {function} onStart - Function to execute when the encounter starts.
 * @property {function} onVictory - Function to execute when the player wins the encounter.
 * @property {function} onDefeat - Function to execute when the player loses the encounter.
 * @property {function} onEscape - Function to execute when the player escapes the encounter.
 * @property {function} onSurrender - Function to execute when the player surrenders in the encounter.
 * @property {function} onEndTurn - Function to execute at the end of each turn in the encounter.
 * @constructor
 * @param {string} name - The name of the encounter type.
 * @param {number[]} enemyColor - The color associated with the enemy fleet.
 * @param {string} description - A brief description of the encounter type.
 * @param {FLEET_TYPES} fleetType - The type of fleet associated with the encounter.
 * @param {AI_TYPES} aiType - The AI type used for the encounter.
 * @param {FORMATION_TYPES} formationType - The formation type of the encounter.
 * @param {function} onStart - Function to execute when the encounter starts.
 * @param {function} onVictory - Function to execute when the player wins the encounter.
 * @param {function} onDefeat - Function to execute when the player loses the encounter.
 * @param {function} onEscape - Function to execute when the player escapes the encounter.
 * @param {function} onSurrender - Function to execute when the player surrenders in the encounter.
 */
class EncounterType {
    constructor(name = '', enemyColor = COLORS.LightRed, description = '', fleetType = FLEET_TYPES_ALL[0], aiType, formationType, onStart = ()=>{}, onVictory = ()=>{}, onDefeat = ()=>{}, onEscape = ()=>{}, onSurrender = ()=>{}) {
        this.name = name;
        this.enemyColor = enemyColor;
        this.description = description;
        this.fleetType = fleetType;
        this.aiType = aiType
        this.formationType = formationType;
        this.onStart = onStart;
        this.onVictory = onVictory;
        this.onDefeat = onDefeat;
        this.onEscape = onEscape;
        this.onSurrender = onSurrender;
        this.onEndTurn = null;
    }
}

const ENCOUNTER_TYPES = {
    MINERS: new EncounterType('Miners', COLORS.Brown, 'You encountered: miners.', FLEET_TYPES.MINERS, AI_TYPES.Ship, FORMATION_TYPES.FaceOff,
        ()=>{
            if (gs.encounter.luck[0] * gs.fleet.totalRadar * (1+gs.fleet.totalSkills.getAmount(SKILLS.Stealth)/50) > gs.encounter.fleet.totalRadar) {
                showModal(gs.encounter.fleetName, 'Your long range sensors detect a mining fleet before they detect you.<br/>You manage to approach them stealthily.', [
                    ['View', ()=>closeModal()],
                    ['Bypass', ()=>endEncounter()],
                    ['Hail', ()=>{
                        gs.encounter.luck[0] = 0
                        gs.encounter.encounterType.onStart()
                    }],
                    ['Sneak Attack', ()=>showPlayerAttackFleetModal(-1, 1, false, true)],
                ])
            }
            else {
                showModal(gs.encounter.fleetName, 'The miners transmit a surly, perfunctory greeting, but otherwise ignore you.', [
                    ['View', ()=>closeModal()],
                    ['Ignore', ()=>endEncounter()],
                    ['Attack', ()=>showPlayerAttackFleetModal(-1, 1, false, true)],
                ])
            }
        },
        ()=>showPlayerDefeatedEnemyModal(-1),
        ()=>showPlayerDefeatedByNeutralsModal(1),
        ()=>showPlayerEscapedFromEnemyModal(),
        ()=>gs.encounter.encounterType.onDefeat()
    ),
    TOURISTS: new EncounterType('Tourists', COLORS.LightOrange, 'You encountered: tourists.', FLEET_TYPES.TOURISTS, AI_TYPES.Ship, FORMATION_TYPES.FaceOff,
        ()=>{
            if (gs.encounter.luck[0] * gs.fleet.totalRadar * (1+gs.fleet.totalSkills.getAmount(SKILLS.Stealth)/50) > gs.encounter.fleet.totalRadar) {
                showModal(gs.encounter.fleetName, 'Your long range sensors detect a tourist fleet before they detect you.<br/>You manage to approach them stealthily.', [
                    ['View', ()=>closeModal()],
                    ['Bypass', ()=>endEncounter()],
                    ['Hail', ()=>{
                        gs.encounter.luck[0] = 0
                        gs.encounter.encounterType.onStart()
                    }],
                    ['Sneak Attack', ()=>showPlayerAttackFleetModal(-1, 1, false, true)],
                ])
            }
            else {
                showModal(gs.encounter.fleetName, 'The tourist fleet broadcasts a corporate jingle, inviting you to join them for your next pleasure cruise.', [
                    ['View', ()=>closeModal()],
                    ['Ignore', ()=>endEncounter()],
                    ['Attack', ()=>showPlayerAttackFleetModal(-1, 1, false, true)],
                ])
            }
        },
        ()=>showPlayerDefeatedEnemyModal(-1),
        ()=>showPlayerDefeatedByNeutralsModal(1),
        ()=>showPlayerEscapedFromEnemyModal(),
        ()=>gs.encounter.encounterType.onDefeat()
    ),
    MERCHANTS: new EncounterType('Merchants', COLORS.Yellow, 'You encountered: merchants.', FLEET_TYPES.MERCHANTS, AI_TYPES.Ship, FORMATION_TYPES.FaceOff,    
        ()=>{
            if (gs.encounter.luck[0] * gs.fleet.totalRadar * (1+gs.fleet.totalSkills.getAmount(SKILLS.Stealth)/50) > gs.encounter.fleet.totalRadar) {
                showModal(gs.encounter.fleetName, 'Your long range sensors detect a merchant fleet before they detect you.<br/>You manage to approach them stealthily.', [
                    ['View', ()=>closeModal()],
                    ['Bypass', ()=>endEncounter()],
                    ['Hail', ()=>{
                        gs.encounter.luck[0] = 0
                        gs.encounter.encounterType.onStart()
                    }],
                    ['Sneak Attack', ()=>showPlayerAttackFleetModal(-1, 1, false, true)],
                ])
            }
            else if (gs.encounter.luck[1] > .5) {
                showModal(gs.encounter.fleetName, 'The merchants eagerly invite you to trade. They claim to have the best prices in the sector!', [
                    ['View', ()=>closeModal()],
                    ['Trade', ()=>showTradeOfferModal()],
                    ['Ignore', ()=>endEncounter()],
                    ['Attack', ()=>showPlayerAttackFleetModal(-1, 1, false, true)],
                ])
            }
            else {
                showModal(gs.encounter.fleetName, 'The merchant fleet ignores you nervously.', [
                    ['View', ()=>closeModal()],
                    ['Ignore', ()=>endEncounter()],
                    ['Attack', ()=>showPlayerAttackFleetModal(-1, 1, false, true)],
                ])
            }
        },
        ()=>showPlayerDefeatedEnemyModal(-1),
        ()=>showPlayerDefeatedByNeutralsModal(1),
        ()=>showPlayerEscapedFromEnemyModal(),
        ()=>gs.encounter.encounterType.onDefeat()
    ),
    SMUGGLERS: new EncounterType('Smugglers', COLORS.Yellow, 'You encountered: smugglers.', FLEET_TYPES.SMUGGLERS, AI_TYPES.Ship, FORMATION_TYPES.FaceOff,    
        ()=>{
            if (gs.encounter.luck[0] * gs.fleet.totalRadar * (1+gs.fleet.totalSkills.getAmount(SKILLS.Stealth)/50) > gs.encounter.fleet.totalRadar) {
                showModal(gs.encounter.fleetName, 'Your long range sensors detect a smuggler fleet before they detect you.<br/>You manage to approach them stealthily.', [
                    ['View', ()=>closeModal()],
                    ['Bypass', ()=>endEncounter()],
                    ['Hail', ()=>{
                        gs.encounter.luck[0] = 0
                        gs.encounter.encounterType.onStart()
                    }],
                    ['Sneak Attack', ()=>showPlayerAttackFleetModal(1, 0, false, true)],
                ])
            }
            else if (gs.encounter.luck[1] > .5) {
                showModal(gs.encounter.fleetName, 'The smugglers broadcast a rather seedy invitation to peruse their illicit wares.', [
                    ['View', ()=>closeModal()],
                    ['Trade', ()=>showTradeOfferModal(false)],
                    ['Ignore', ()=>endEncounter()],
                    ['Attack', ()=>showPlayerAttackFleetModal(1, 0, false, true)],
                ])
            }
            else {
                showModal(gs.encounter.fleetName, 'The smuggler fleet takes no chances and starts moving quickly away from you.', [
                    ['View', ()=>closeModal()],
                    ['Ignore', ()=>endEncounter()],
                    ['Attack', ()=>showPlayerAttackFleetModal(1, 0, false, true)],
                ])
            }
        },
        ()=>showPlayerDefeatedEnemyModal(1),
        ()=>showPlayerDefeatedByNeutralsModal(1),
        ()=>showPlayerEscapedFromEnemyModal(),
        ()=>gs.encounter.encounterType.onDefeat()
    ),
    PIRATES: new EncounterType('Pirates', COLORS.LightRed, 'You encountered: pirates.', FLEET_TYPES.PIRATES, AI_TYPES.Ship, FORMATION_TYPES.FaceOff,
        ()=>{
            if (gs.encounter.luck[0] * gs.fleet.totalRadar * (1+gs.fleet.totalSkills.getAmount(SKILLS.Stealth)/50) > gs.encounter.fleet.totalRadar) {
                showModal(gs.encounter.fleetName, 'Your long range sensors detect a pirate fleet before they detect you.<br/>You manage to approach them stealthily.', [
                    ['View', ()=>closeModal()],
                    ['Bypass', ()=>endEncounter()],
                    ['Hail', ()=>{
                        gs.encounter.luck[0] = 0
                        gs.encounter.encounterType.onStart()
                    }],
                    ['Sneak Attack', ()=>showPlayerAttackFleetModal(1, 0, false, false)],
                ])
            }
            else if (gs.encounter.luck[1] < 0.5) {
                showModal(gs.encounter.fleetName, 'The pirates fire warning shots at your ship!<br/>They demand you surrender and prepare to be boarded!', [
                    ['View', ()=>closeModal()],
                    ['Surrender', ()=>gs.encounter.encounterType.onSurrender()],
                    ['Resist', ()=>showPlayerRefuseSurrenderModal(1, 0)],
                ])
            }
            else {
                showModal(gs.encounter.fleetName, 'The pirates broadcast insults and jeers at your fleet, but let you pass regardless.', [
                    ['View', ()=>closeModal()],
                    ['Ignore', ()=>endEncounter()],
                    ['Attack', ()=>showPlayerAttackFleetModal(1, 0, false, false)],
                ])
            }
        },
        ()=>showPlayerDefeatedEnemyModal(1),
        ()=>showPlayerDefeatedByPiratesModal(),
        ()=>showPlayerEscapedFromEnemyModal(),
        ()=>showPlayerDidSurrenderModal(1)
    ),
    POLICE: new EncounterType('Police', COLORS.LightBlue, 'You encountered: police.', FLEET_TYPES.POLICE, AI_TYPES.Ship, FORMATION_TYPES.FaceOff,
        ()=>{
            if (gs.encounter.luck[0] * gs.fleet.totalRadar * (1+gs.fleet.totalSkills.getAmount(SKILLS.Stealth)/50) > gs.encounter.fleet.totalRadar) {
                showModal(gs.encounter.fleetName, 'Your long range sensors detect a police fleet before they detect you.<br/>You manage to approach them stealthily.', [
                    ['View', ()=>closeModal()],
                    ['Bypass', ()=>endEncounter()],
                    ['Hail', ()=>{
                        gs.encounter.luck[0] = 0
                        gs.encounter.encounterType.onStart()
                    }],
                    ['Sneak Attack', ()=>showPlayerAttackFleetModal(-2, 2, false, false)],
                ])
            }
            else if (gs.encounter.luck[1]*gs.captain.fame/gs.captain.infamy > 1 && gs.captain.fame > 100) {
                showModal(gs.encounter.fleetName, `The police greet you respectfully, having heard of your good deeds.<br/>They don't even trouble you with the routine inspection.`, [
                    ['View', ()=>closeModal()],
                    ['Ignore', ()=>endEncounter()],
                    ['Attack', ()=>showPlayerAttackFleetModal(-2, 2, false, false)],
                ])
            }
            if (gs.encounter.luck[2]*gs.captain.infamy > 100 && gs.captain.bounty > 0) {
                showModal(gs.encounter.fleetName, 'The police ships activate their sirens the instant you pass by!<br/>It seems your bad reputation has preceded you.', [
                    ['View', ()=>closeModal()],
                    ['Surrender', ()=>gs.encounter.encounterType.onSurrender()],
                    ['Resist', ()=>showPlayerRefuseSurrenderModal(-2, 2)],
                ])
            }
            else if (gs.encounter.luck[3] < 0.5) {
                showModal(gs.encounter.fleetName, 'The police ships pull alongside your fleet and order you to submit to a routine inspection.', [
                    ['View', ()=>closeModal()],
                    ['Accept', ()=>showPlayerPoliceInspectionModal()],
                    ['Resist', ()=>showPlayerRefuseSurrenderModal(-2, 2)],
                ])
            }
            else {
                showModal(gs.encounter.fleetName, 'The police ships speed past your fleet, perhaps responding to some other incident.', [
                    ['View', ()=>closeModal()],
                    ['Ignore', ()=>endEncounter()],
                    ['Attack', ()=>showPlayerAttackFleetModal(-2, 2, false, false)],
                ])
            }
        },
        ()=>showPlayerDefeatedEnemyModal(-2),
        ()=>showPlayerDefeatedByPoliceModal(),
        ()=>showPlayerEscapedFromEnemyModal(),
        ()=>showPlayerDidSurrenderModal(-1)
    ),
    SOLDIERS: new EncounterType('Soldiers', COLORS.LightGreen, 'You encountered: soldiers.', FLEET_TYPES.SOLDIERS, AI_TYPES.Ship, FORMATION_TYPES.FaceOff,
        ()=>{
            if (gs.encounter.luck[0] * gs.fleet.totalRadar * (1+gs.fleet.totalSkills.getAmount(SKILLS.Stealth)/50) > gs.encounter.fleet.totalRadar) {
                showModal(gs.encounter.fleetName, 'Your long range sensors detect an army fleet before they detect you.<br/>You manage to approach them stealthily.', [
                    ['View', ()=>closeModal()],
                    ['Bypass', ()=>endEncounter()],
                    ['Hail', ()=>{
                        gs.encounter.luck[0] = 0
                        gs.encounter.encounterType.onStart()
                    }],
                    ['Sneak Attack', ()=>showPlayerAttackFleetModal(-2, 2, false, false)],
                ])
            }
            else if (gs.encounter.luck[1]*gs.captain.fame/gs.captain.infamy > 1 && gs.captain.fame > 100) {
                showModal(gs.encounter.fleetName, `The soldiers salute you over comms, having heard of your good deeds.<br/>${gs.captain.infamy > 10 ? `In their view, the good you've done far outweighs the bad.` : ''}`, [
                    ['View', ()=>closeModal()],
                    ['Ignore', ()=>endEncounter()],
                    ['Attack', ()=>showPlayerAttackFleetModal(-2, 2, false, false)],
                ])
            }
            if (gs.encounter.luck[2]*gs.captain.infamy > 250 && gs.captain.bounty > 0) {
                showModal(gs.encounter.fleetName, 'The army ships power up their weapons the instant you pass by!<br/>You have grown so notorious that even the government considers you a threat!', [
                    ['View', ()=>closeModal()],
                    ['Surrender', ()=>gs.encounter.encounterType.onSurrender()],
                    ['Resist', ()=>showPlayerRefuseSurrenderModal(-2, 2)],
                ])
            }
            else {
                showModal(gs.encounter.fleetName, `The army ships blares a platriotic jingle extolling the greatness of ${gs.encounter.planet.name}.`, [
                    ['View', ()=>closeModal()],
                    ['Ignore', ()=>endEncounter()],
                    ['Attack', ()=>showPlayerAttackFleetModal(-2, 2, false, false)],
                ])
            }
        },
        ()=>showPlayerDefeatedEnemyModal(-4),
        ()=>showPlayerDefeatedByPoliceModal(),
        ()=>showPlayerEscapedFromEnemyModal(),
        ()=>showPlayerDidSurrenderModal(-1)
    ),
    BOUNTY_HUNTERS: new EncounterType('Bounty Hunters', COLORS.LightRed, 'You encountered: bounty hunters.', FLEET_TYPES.BOUNTY_HUNTERS, AI_TYPES.Ship, FORMATION_TYPES.FaceOff,
        ()=>{
            if (gs.encounter.luck[0] * gs.fleet.totalRadar * (1+gs.fleet.totalSkills.getAmount(SKILLS.Stealth)/50) > gs.encounter.fleet.totalRadar) {
                showModal(gs.encounter.fleetName, 'Your long range sensors detect a bounty hunters fleet before they detect you.<br/>You manage to approach them stealthily.', [
                    ['View', ()=>closeModal()],
                    ['Bypass', ()=>endEncounter()],
                    ['Hail', ()=>{
                        gs.encounter.luck[0] = 0
                        gs.encounter.encounterType.onStart()
                    }],
                    ['Sneak Attack', ()=>showPlayerAttackFleetModal(-1, 1, false, false)],
                ])
            }
            else if (gs.encounter.luck[1] < 0.5 && gs.captain.bounty > gs.encounter.luck[2]*100) {
                showModal(gs.encounter.fleetName, `The bounty hunters have heard of you and the sizeable bounty on your head.<br/>They coldly inform you that they're here to collect one way or another.`, [
                    ['View', ()=>closeModal()],
                    ['Surrender', ()=>gs.encounter.encounterType.onSurrender()],
                    ['Resist', ()=>showPlayerRefuseSurrenderModal(-1, 1)],
                ])
            }
            else {
                showModal(gs.encounter.fleetName, 'The bounty hunters glide past your fleet in eerie silence.', [
                    ['View', ()=>closeModal()],
                    ['Ignore', ()=>endEncounter()],
                    ['Attack', ()=>showPlayerAttackFleetModal(-1, 1, false, false)],
                ])
            }
        },
        ()=>showPlayerDefeatedEnemyModal(-1),
        ()=>showFineOrJailModal(),
        ()=>showPlayerEscapedFromEnemyModal(),
        ()=>showPlayerDidSurrenderModal(-1)
    ),
    ASTEROIDS: new EncounterType('Asteroids', COLORS.Gray, 'You encountered: asteroids.', FLEET_TYPES.ASTEROIDS, AI_TYPES.Asteroid, FORMATION_TYPES.Storm,
        ()=>{
            if (gs.encounter.luck[0] * gs.fleet.totalRadar * (1+gs.fleet.totalSkills.getAmount(SKILLS.Pilot)/50) > gs.encounter.fleet.totalRadar) {
                showModal(gs.encounter.fleetName, `Your long range sensors detect an incoming cluster of asteroids.<br/>You skillfully steer out of harm's way.<br/>Although, you could choose to plunge back in and mine them if you wish.`, [
                    ['View', ()=>closeModal()],
                    ['Bypass', ()=>endEncounter()],
                    ['Mine', ()=>startCombat(true)],
                ])
            }
            else {
                showModal(gs.encounter.fleetName, 'You encounter a brutal asteroid storm! You must navigate carefully to avoid damage.', [
                    ['View', ()=>closeModal()],
                    ['Continue', ()=>startCombat(true)],
                ])
            }
        },
        ()=>showPlayerDefeatedHazardsModal(),
        ()=>showPlayerDefeatedByHazardsModal(),
        ()=>showPlayerEscapedFromHazardsModal(),
        null
    ),
    CRYOIDS: new EncounterType('Cryoids', COLORS.LightBlue, 'You encountered: cryoids.', FLEET_TYPES.CRYOIDS, AI_TYPES.Asteroid, FORMATION_TYPES.Storm,
        ()=>{
            if (gs.encounter.luck[0] * gs.fleet.totalRadar * (1+gs.fleet.totalSkills.getAmount(SKILLS.Pilot)/50) > gs.encounter.fleet.totalRadar) {
                showModal(gs.encounter.fleetName, `Your long range sensors detect an incoming cluster of cryoids.<br/>You skillfully steer out of harm's way.<br/>Although, you could choose to plunge back in and mine them if you wish.`, [
                    ['View', ()=>closeModal()],
                    ['Bypass', ()=>endEncounter()],
                    ['Mine', ()=>startCombat(true)],
                ])
            }
            else {
                showModal(gs.encounter.fleetName, 'You encounter a brutal cryoid storm! You must navigate carefully to avoid damage.', [
                    ['View', ()=>closeModal()],
                    ['Continue', ()=>startCombat(true)],
                ])
            }
        },
        ()=>showPlayerDefeatedHazardsModal(),
        ()=>showPlayerDefeatedByHazardsModal(),
        ()=>showPlayerEscapedFromHazardsModal(),
        null
    ),
    PLASMOIDS: new EncounterType('Plasmoids', COLORS.LightYellow, 'You encountered: plasmoids.', FLEET_TYPES.PLASMOIDS, AI_TYPES.Asteroid, FORMATION_TYPES.Storm,
        ()=>{
            if (gs.encounter.luck[0] * gs.fleet.totalRadar * (1+gs.fleet.totalSkills.getAmount(SKILLS.Pilot)/50) > gs.encounter.fleet.totalRadar) {
                showModal(gs.encounter.fleetName, `Your long range sensors detect an incoming cluster of plasmoids.<br/>You skillfully steer out of harm's way.<br/>Although, you could choose to plunge back in and mine them if you wish.`, [
                    ['View', ()=>closeModal()],
                    ['Bypass', ()=>endEncounter()],
                    ['Mine', ()=>startCombat(true)],
                ])
            }
            else {
                showModal(gs.encounter.fleetName, 'You encounter a brutal plasmoid storm! You must navigate carefully to avoid damage.', [
                    ['View', ()=>closeModal()],
                    ['Continue', ()=>startCombat(true)],
                ])
            }
        },
        ()=>showPlayerDefeatedHazardsModal(),
        ()=>showPlayerDefeatedByHazardsModal(),
        ()=>showPlayerEscapedFromHazardsModal(),
        null
    ),
}

for (const et of [ENCOUNTER_TYPES.ASTEROIDS, ENCOUNTER_TYPES.CRYOIDS, ENCOUNTER_TYPES.PLASMOIDS]) et.onEndTurn = (encounter = new Encounter())=>{
    //make fooroids move faster each turn
    for (const ship of encounter.enemyShips) {
        if (Math.random() > .5) ship.engine = Math.ceil(ship.engine*1.1)
    }
}

const ENCOUNTER_TYPES_ALL = Object.values(ENCOUNTER_TYPES)

