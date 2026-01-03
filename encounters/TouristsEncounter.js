/**
 * @class TouristsEncounter
 * @extends {NeutralsEncounter}
 */
class TouristsEncounter extends NeutralsEncounter {
    onStart() {
        if (FameLevel.hasInfamyLevel(gs.captain, this.planet, INFAMY_LEVELS.VILIFIED)) {
            showModal(coloredName(this.fleet), 'The tourists have heard of your fearsome deeds and start fleeing immediately!', [
                //['View', ()=>closeModal()],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackNeutralsModal()],
            ])
        }
        else {
            showModal(coloredName(this.fleet), 'The tourist fleet broadcasts a corporate jingle, inviting you to join them for your next pleasure cruise.', [
                //['View', ()=>closeModal()],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackNeutralsModal()],
            ])
        }
    }
}
