

class EncounterType {
    constructor(name = '', enemyColor = COLORS.LightRed, description = '', fleetType = FLEET_TYPES_ALL[0], aiType = AI_TYPES.Ship, formationType = FORMATION_TYPES.FaceOff, onStart = ()=>{}, onVictory = ()=>{}, onDefeat = ()=>{}, onEscape = ()=>{}, onSurrender = ()=>{}) {
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
    MINERS: new EncounterType('Miners', COLORS.LightPurple, 'You encountered: miners.', FLEET_TYPES.MINERS, AI_TYPES.Ship, FORMATION_TYPES.FaceOff,
        ()=>{
            showModal(gs.encounter.fleetName, 'The miners transmit a surly, perfunctory greeting, but otherwise ignore you.', [
                ['View', ()=>closeModal()],
                ['Continue', ()=>endEncounter()],
                ['Attack', ()=>showPlayerAttackFleetModal(-1, 1)],
            ])
        },
        ()=>showPlayerDefeatedEnemyModal(-1),
        ()=>showPlayerDefeatedByNeutralsModal(1),
        ()=>showPlayerEscapedFromFleetModal(),
        ()=>gs.encounter.encounterType.onDefeat()
    ),
    MERCHANTS: new EncounterType('Merchants', COLORS.Yellow, 'You encountered: merchants.', FLEET_TYPES.MERCHANTS, AI_TYPES.Ship, FORMATION_TYPES.FaceOff,    
        ()=>{
            if (gs.encounter.luck[0] > .5) {
                showModal(gs.encounter.fleetName, 'The merchants greet you warmly and offer to trade goods.', [
                    ['View', ()=>closeModal()],
                    ['Trade', ()=>showTradeOfferModal()],
                    ['Continue', ()=>endEncounter()],
                    ['Attack', ()=>showPlayerAttackFleetModal(-1, 1)],
                ])
            }
            else {
                showModal(gs.encounter.fleetName, 'The merchant fleet ignores you nervously.', [
                    ['View', ()=>closeModal()],
                    ['Continue', ()=>endEncounter()],
                    ['Attack', ()=>showPlayerAttackFleetModal(-1, 1)],
                ])
            }
        },
        ()=>showPlayerDefeatedEnemyModal(-1),
        ()=>showPlayerDefeatedByNeutralsModal(1),
        ()=>showPlayerEscapedFromFleetModal(),
        ()=>gs.encounter.encounterType.onDefeat()
    ),
    PIRATES: new EncounterType('Pirates', COLORS.LightRed, 'You encountered: pirates.', FLEET_TYPES.PIRATES, AI_TYPES.Ship, FORMATION_TYPES.FaceOff,
        ()=>{
            if (gs.encounter.luck[0] < 0.5) {
                showModal(gs.encounter.fleetName, 'The pirates fire warning shots at your ship!<br/>They demand you surrender and prepare to be boarded!', [
                    ['View', ()=>closeModal()],
                    ['Surrender', ()=>gs.encounter.encounterType.onSurrender()],
                    ['Resist', ()=>showPlayerRefuseSurrenderModal(1, 0)],
                ])
            }
            else {
                showModal(gs.encounter.fleetName, 'The pirates broadcast insults and jeers at your fleet, but let you pass regardless.', [
                    ['View', ()=>closeModal()],
                    ['Continue', ()=>endEncounter()],
                    ['Attack', ()=>showPlayerAttackFleetModal(1, 0)],
                ])
            }
        },
        ()=>showPlayerDefeatedEnemyModal(1),
        ()=>showPlayerDefeatedByPiratesModal(),
        ()=>showPlayerEscapedFromFleetModal(),
        ()=>showPlayerDidSurrenderModal(1)
    ),
    POLICE: new EncounterType('Police', COLORS.LightBlue, 'You encountered: police.', FLEET_TYPES.PATROL, AI_TYPES.Ship, FORMATION_TYPES.FaceOff,
        ()=>{
            if (gs.encounter.luck[0]*gs.captain.fame/gs.captain.infamy > 1 && gs.captain.fame > 100) {
                showModal(gs.encounter.fleetName, `The police greet you respectfully, having heard of your good deeds.<br/>They don't even trouble you with the routine inspection.`, [
                    ['View', ()=>closeModal()],
                    ['Continue', ()=>endEncounter()],
                    ['Attack', ()=>showPlayerAttackFleetModal(-2, 2)],
                ])
            }
            if (gs.encounter.luck[1]*gs.captain.infamy > 100 && gs.captain.bounty > 0) {
                showModal(gs.encounter.fleetName, 'The police ships activate their sirens the instant you pass by!<br/>It seems your bad reputation has preceded you.', [
                    ['View', ()=>closeModal()],
                    ['Surrender', ()=>gs.encounter.encounterType.onSurrender()],
                    ['Resist', ()=>showPlayerRefuseSurrenderModal(-2, 2)],
                ])
            }
            else if (gs.encounter.luck[2] < 0.5) {
                showModal(gs.encounter.fleetName, 'The police ships pull alongside your fleet and order you to submit to a routine inspection.', [
                    ['View', ()=>closeModal()],
                    ['Accept', ()=>showPlayerPoliceInspectionModal()],
                    ['Resist', ()=>showPlayerRefuseSurrenderModal(-2, 2)],
                ])
            }
            else {
                showModal(gs.encounter.fleetName, 'The police ships speed past your fleet, perhaps responding to some other incident.', [
                    ['View', ()=>closeModal()],
                    ['Continue', ()=>endEncounter()],
                    ['Attack', ()=>showPlayerAttackFleetModal(-2, 2)],
                ])
            }
        },
        ()=>showPlayerDefeatedEnemyModal(-2),
        ()=>showPlayerDefeatedByPoliceModal(),
        ()=>showPlayerEscapedFromFleetModal(),
        ()=>showPlayerDidSurrenderModal(-1)
    ),
    BOUNTY_HUNTERS: new EncounterType('Bounty Hunters', COLORS.LightRed, 'You encountered: bounty hunters.', FLEET_TYPES.BOUNTY_HUNTERS, AI_TYPES.Ship, FORMATION_TYPES.FaceOff,
        ()=>{
            if (gs.encounter.luck[1] < 0.5 && gs.captain.bounty > gs.encounter.luck[2]*100) {
                showModal(gs.encounter.fleetName, `The bounty hunters have heard of you and the sizeable bounty on your head.<br/>They coldly inform you that they're here to collect one way or another.`, [
                    ['View', ()=>closeModal()],
                    ['Surrender', ()=>gs.encounter.encounterType.onSurrender()],
                    ['Resist', ()=>showPlayerRefuseSurrenderModal(-1, 1)],
                ])
            }
            else {
                showModal(gs.encounter.fleetName, 'The bounty hunters glide past your fleet in eerie silence.', [
                    ['View', ()=>closeModal()],
                    ['Continue', ()=>endEncounter()],
                    ['Attack', ()=>showPlayerAttackFleetModal(-1, 1)],
                ])
            }
        },
        ()=>showPlayerDefeatedEnemyModal(-1),
        ()=>showFineOrJailModal(),
        ()=>showPlayerEscapedFromFleetModal(),
        ()=>showPlayerDidSurrenderModal(-1)
    ),
    ASTEROIDS: new EncounterType('Asteroids', COLORS.Gray, 'You encountered: asteroids.', FLEET_TYPES.ASTEROIDS, AI_TYPES.Asteroid, FORMATION_TYPES.Storm,
        ()=>{
            showModal(gs.encounter.fleetName, 'You encounter a brutal asteroid storm! You must navigate carefully to avoid damage.', [
                ['View', ()=>closeModal()],
                ['Continue', ()=>startCombat(true)],
            ])
        },
        ()=>showPlayerDefeatedHazardsModal(),
        ()=>showPlayerDefeatedByHazardsModal(),
        ()=>showPlayerEscapedFromHazardsModal(),
        null
    )
}

ENCOUNTER_TYPES.ASTEROIDS.onEndTurn = (encounter = new Encounter())=>{
    //make asteroids move faster each turn
    for (const ship of encounter.enemyShips) {
        if (Math.random() > .5) ship.engine *= 1.1
    }
}

const ENCOUNTER_TYPES_ALL = Object.values(ENCOUNTER_TYPES)

