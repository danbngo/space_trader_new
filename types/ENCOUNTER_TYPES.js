

class EncounterType {
    constructor(name = '', description = '', fleetType = FLEET_TYPES_ALL[0], onStart = ()=>{}, onVictory = ()=>{}, onDefeat = ()=>{}, onEscape = ()=>{}, onSurrender = ()=>{}) {
        this.name = name;
        this.description = description;
        this.fleetType = fleetType;
        this.onStart = onStart;
        this.onVictory = onVictory;
        this.onDefeat = onDefeat;
        this.onEscape = onEscape;
        this.onSurrender = onSurrender;
    }
}

const ENCOUNTER_TYPES = {
    MINERS: new EncounterType('Miners', 'You encountered: miners.', FLEET_TYPES.MINERS,
        ()=>{
            showModal('The miners transmit a surly, perfunctory greeting, but otherwise ignore you.', [
                ['View', ()=>closeModal()],
                ['Ignore', ()=>endEncounter()],
                ['Attack', ()=>showPlayerAttackFleetModal(-1, 1)],
            ])
        },
        ()=>showPlayerDefeatedEnemyModal(-1),
        ()=>showPlayerDefeatedByNeutralsModal(1),
        ()=>showPlayerEscapedFromFleetModal(),
        ()=>gs.encounter.encounterType.onDefeat()
    ),
    MERCHANTS: new EncounterType('Merchants', 'You encountered: merchants.', FLEET_TYPES.MERCHANTS,
        ()=>{
            showModal('Merchants', 'The merchants greet you warmly and offer to trade goods.', [
                ['View', ()=>closeModal()],
                ['Trade', ()=>showTradeOfferModal()],
                ['Ignore', ()=>endEncounter()],
                ['Attack', ()=>showPlayerAttackFleetModal(-1, 1)],
            ])
        },
        ()=>showPlayerDefeatedEnemyModal(-1),
        ()=>showPlayerDefeatedByNeutralsModal(1),
        ()=>showPlayerEscapedFromFleetModal(),
        ()=>gs.encounter.encounterType.onDefeat()
    ),
    PIRATES: new EncounterType('Pirates', 'You encountered: pirates.', FLEET_TYPES.PIRATES,
        ()=>{
            showModal('The pirates fire warning shots at your ship!<br/>They demand you surrender and prepare to be boarded!', [
                ['View', ()=>closeModal()],
                ['Submit', ()=>gs.encounter.encounterType.onSurrender()],
                ['Resist', ()=>showPlayerRefuseSurrenderModal(1, 0)],
            ])
        },
        ()=>showPlayerDefeatedEnemyModal(1),
        ()=>showPlayerDefeatedByPiratesModal(),
        ()=>showPlayerEscapedFromFleetModal(),
        ()=>showPlayerDidSurrenderModal(1)
    ),
    POLICE: new EncounterType('Police', 'You encountered: police.', FLEET_TYPES.PATROL,
        ()=>{
            showModal('The police ships pull alongside your fleet and order you to submit to a routine inspection.', [
                ['View', ()=>closeModal()],
                ['Accept', ()=>showPlayerPoliceInspectionModal()],
                ['Attack', ()=>showPlayerAttackFleetModal(-2, 2)],
            ])
        },
        ()=>showPlayerDefeatedEnemyModal(-1),
        ()=>showPlayerDefeatedByPoliceModal(),
        ()=>showPlayerEscapedFromFleetModal(),
        ()=>showPlayerDidSurrenderModal(-1)
    )



}

const ENCOUNTER_TYPES_ALL = Object.values(ENCOUNTER_TYPES)

