/**
 * @class PoliceEncounter
 * @extends {AuthoritiesEncounter}
 */
class PoliceEncounter extends AuthoritiesEncounter {
    onStart() {
        if (Math.random() * gs.fleet.totalRadar * (1+gs.fleet.totalSkills.getAmount(SKILLS.Stealth)/50) > this.fleet.totalRadar) {
            showModal(coloredName(this.fleet), `Your long range sensors detect a ${coloredName(this.fleet)} fleet before they detect you.<br/>You manage to approach the ${coloredName(this.fleet)} stealthily.`, [
                //['View', ()=>closeModal()],
                ['Bypass', ()=>this.endEncounter()],
                ['Hail', ()=>{
                    this.onStart()
                }],
                ['Sneak Attack', ()=>this.showPlayerAttackFleetModal(true)],
            ])
        }
        else if (Math.random()*gs.captain.calcReputationForTarget(this.planet) > 200) {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} greet you respectfully, having heard of your good deeds.<br/>They don't even trouble you with the routine inspection.`, [
                //['View', ()=>closeModal()],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackFleetModal()],
            ])
        }
        if (FameLevel.hasInfamyLevel(gs.captain, this.planet, INFAMY_LEVELS.NOTORIOUS) && gs.captain.calcBountyForPlanet(this.planet) > 0) {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} activate their sirens the instant you pass by!<br/>It seems your bad reputation has preceded you.`, [
                //['View', ()=>closeModal()],
                ['Surrender', ()=>this.onSurrender()],
                ['Resist', ()=>this.showPlayerRefuseSurrenderModal()],
            ])
        }
        else if (Math.random() < 0.5) {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} ships pull alongside your fleet and order you to submit to a routine inspection.`, [
                //['View', ()=>closeModal()],
                ['Accept', ()=>this.showPlayerPoliceInspectionModal()],
                ['Resist', ()=>this.showPlayerRefuseSurrenderModal()],
            ])
        }
        else {
            showModal(coloredName(this.fleet), `The ${coloredName(this.fleet)} ships speed past your fleet, perhaps responding to some other incident.`, [
                //['View', ()=>closeModal()],
                ['Ignore', ()=>this.endEncounter()],
                ['Attack', ()=>this.showPlayerAttackFleetModal(false)],
            ])
        }
    }

    onVictory() {
        this.showPlayerDefeatedEnemyModal()
    }

    onDefeat() {
        this.showPlayerDefeatedByAuthoritiesModal()
    }

    onSurrender() {
        this.showPlayerDidSurrenderModal()
    }

    
    showPlayerPoliceInspectionModal() {
        console.log('showPlayerPoliceInspectionModal');
        let msg = ''
        const {enemyFleet} = this
        const [fine, seized] = this.seizePlayerContraband()
        if (fine == 0) {
            msg += `The ${coloredName(enemyFleet)} inspect your cargo and find nothing illegal. They thank you for your cooperation and wish you a safe journey.<br/>`
            showModal(coloredName(enemyFleet), msg, [['Continue', ()=>this.endEncounter()]])
        }
        else {
            msg += `The ${coloredName(enemyFleet)} inspect your cargo and discover ${seized.total} units of contraband!<br/>`
            msg += `All of your contraband is confiscated.<br/>`
            showModal(coloredName(enemyFleet), msg, [['Continue', ()=> this.showFineOrJailModal(fine)]])
        }
    }
   

}
