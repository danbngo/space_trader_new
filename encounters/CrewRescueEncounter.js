/**
 * @class CrewRescueEncounter
 * @extends {Encounter}
 * Encounter for abandoned ships that still have crew aboard
 */
class CrewRescueEncounter extends Encounter {
    constructor(encounterType, planet, fleet, effects, undetectedFleet) {
        super(encounterType, planet, fleet, effects, undetectedFleet)
        this.abandonedFleet = fleet
    }

    onStart() {
        const crewCount = this.abandonedFleet.officers.length
        const crewNames = crewCount <= 3 
            ? this.abandonedFleet.officers.map(o => o.name).join(', ')
            : `${crewCount} crew members`
        
        showModal(
            `Distress Signal: ${coloredName(this.abandonedFleet)}`,
            `You detect life signs aboard the abandoned ${coloredName(this.abandonedFleet)}!<br/>` +
            `The crew (${crewNames}) are stranded and sending a distress signal.<br/>` +
            `They're desperate for rescue and willing to pay for safe passage.<br/><br/>` +
            `What will you do?`,
            [
                ['Rescue Crew', () => this.rescueCrew()],
                ['Attack & Loot', () => this.attackCrew()],
                ['Leave', () => this.endEncounter()]
            ]
        )
    }

    rescueCrew() {
        const crewCount = this.abandonedFleet.officers.length
        const reward = crewCount * rng(500, 200)
        const reputationGain = crewCount * rng(10, 5)
        
        gs.credits += reward
        gs.captain.reputation.increment(this.planet, reputationGain)
        
        // Remove the abandoned fleet
        gs.system.removeAbandonedFleet(this.abandonedFleet)
        
        let msg = `The grateful crew thanks you profusely for the rescue!<br/>`
        msg += `They pool their resources and give you ${reward} CR as payment.<br/>`
        msg += `Word spreads of your heroism. Your reputation increases by ${reputationGain}.<br/>`
        
        showModal(
            'Crew Rescued',
            msg,
            [['Continue', () => {
                closeModal()
                this.endEncounter()
            }]]
        )
    }

    attackCrew() {
        // Confirm the attack since it's morally questionable
        showModal(
            '⚠️ Attack Defenseless Crew?',
            `These people are defenseless and stranded. Attacking them is cold-blooded murder.<br/>` +
            `You'll gain their cargo and credits, but earn a bounty and lose reputation.<br/><br/>` +
            `Are you sure you want to do this?`,
            [
                ['Yes, Attack', () => this.confirmAttackCrew()],
                ['No, Go Back', () => this.onStart()]
            ]
        )
    }

    confirmAttackCrew() {
        const crewCount = this.abandonedFleet.officers.length
        const credits = crewCount * rng(300, 100)
        const cargoAmount = this.abandonedFleet.cargo.total
        const bountyGain = crewCount * rng(500, 200)
        const reputationLoss = crewCount * rng(20, 10)
        
        // Add loot
        gs.credits += credits
        if (cargoAmount > 0) {
            const cargoToTake = Math.min(cargoAmount, gs.fleet.availableCargoSpace)
            const takenCargo = this.abandonedFleet.cargo.randomSubset(cargoToTake)
            gs.fleet.cargo.addAmounts(takenCargo)
        }
        
        // Penalties
        gs.captain.bounty.increment(this.planet, bountyGain)
        gs.captain.reputation.increment(this.planet, -reputationLoss)
        
        // Remove the abandoned fleet
        gs.system.removeAbandonedFleet(this.abandonedFleet)
        
        let msg = `You ruthlessly attack the defenseless crew!<br/>`
        msg += `After the slaughter, you loot ${credits} CR from their bodies.<br/>`
        if (cargoAmount > 0) {
            const cargoTaken = Math.min(cargoAmount, gs.fleet.availableCargoSpace)
            msg += `You take ${cargoTaken} units of cargo from their hold.<br/>`
            if (cargoTaken < cargoAmount) {
                msg += `You had to leave ${cargoAmount - cargoTaken} units behind due to lack of space.<br/>`
            }
        }
        msg += `<br/>${colorSpan('Word of your crime spreads quickly:', COLORS.Red)}<br/>`
        msg += `Bounty increased by ${bountyGain} CR<br/>`
        msg += `Reputation decreased by ${reputationLoss}<br/>`
        
        showModal(
            'Crew Slaughtered',
            msg,
            [['Continue', () => {
                closeModal()
                this.endEncounter()
            }]]
        )
    }

    onVictory() {
        // Not used - no combat in this encounter unless player chooses to attack
        this.endEncounter()
    }

    onDefeat() {
        // Not used - no combat where player can lose
        this.endEncounter()
    }

    onEscape() {
        this.endEncounter()
    }
}
