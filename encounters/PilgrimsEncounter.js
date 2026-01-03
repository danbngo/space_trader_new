/**
 * @class PilgrimsEncounter
 * @extends {NeutralsEncounter}
 */
class PilgrimsEncounter extends NeutralsEncounter {
    onStart() {
        if (FameLevel.hasInfamyLevel(gs.captain, this.planet, INFAMY_LEVELS.VILIFIED)) {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} have heard of your fearsome deeds and start fleeing immediately!`, [
                //['View', ()=>closeModal()],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackNeutralsModal()],
            ])
        }
        else if (Math.random() > .7) {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} greet you with peaceful blessings and offer to share their provisions.`, [
                //['View', ()=>closeModal()],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackNeutralsModal()],
            ])
        }
        else if (Math.random() > .5) {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} broadcast prayers and hymns as they journey to their holy destination.`, [
                //['View', ()=>closeModal()],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackNeutralsModal()],
            ])
        }
        else {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} acknowledge you with a respectful nod before continuing their pilgrimage.`, [
                //['View', ()=>closeModal()],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackNeutralsModal()],
            ])
        }
    }
}
