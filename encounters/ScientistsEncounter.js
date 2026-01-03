/**
 * @class ScientistsEncounter
 * @extends {NeutralsEncounter}
 */
class ScientistsEncounter extends NeutralsEncounter {
    onStart() {
        this.showGreeting()
    }

    showGreeting() {
        const fleetName = coloredName(this.fleet)
        const greetings = [
            `The ${fleetName} hail you on an open channel. "Greetings traveler! We are on a research expedition. Safe travels!"`,
            `The ${fleetName} broadcast scientific data on all frequencies. "Fascinating readings in this sector. Good day, Captain!"`,
            `The ${fleetName} acknowledge you politely. "Hello! We're conducting surveys here. Please excuse our scanning equipment."`,
            `The ${fleetName} transmit: "Attention unidentified vessel. We are a peaceful scientific mission. Stand by for data exchange if interested."`,
            `The ${fleetName} send a friendly ping. "Research vessel here. We mean no harm. Clear skies, Captain!"`,
        ]
        const greeting = rndMember(greetings)
        
        showModal(fleetName, greeting, [
            //['View', ()=>closeModal()],
            ['Respond Kindly', ()=>{
                showModal(fleetName, `The ${fleetName} seem pleased by your response and continue their work.`, [
                    ['Continue', ()=>this.endEncounter()]
                ])
            }],
            ['Ignore', ()=>this.endEncounter()],
            ['Attack', ()=>this.showPlayerAttackNeutralsModal()],
        ])
    }
}
