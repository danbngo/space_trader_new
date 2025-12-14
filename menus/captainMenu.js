
function showCaptainMenu(captain = gameState.captain) {

    const {name, level, expPoints, expToNextLevel, skills, skillPoints} = captain

    function improveSkill(skill = SKILLS_ALL[0]) {
        captain.skills.increment(skill, 1)
        captain.skillPoints--;
        showCaptainMenu(captain)
    }

    showModal(
        `Captain Overview`,
        createElement({children:[
            `Name: ${name}`,
            `Level: ${level} | Exp.: ${expPoints} | To Next Lvl: ${expToNextLevel}`,
            ...SKILLS_ALL.map(sk=>createElement({children:[
                `${sk}: ${statColorSpan(skills.getAmount(sk), skills.getAmount(sk)*SKILLS_ALL.length/5/SKILL_POINTS_PER_LEVEL, true)}`
            ]})),
            `Skill Points: ${colorSpan(skillPoints, skillPoints > 0 ? 'green' : '', true)}`,
        ]}),
        [
            ...SKILLS_ALL.map(sk=>[`${sk}+`, ()=>improveSkill(sk), skillPoints <= 0]),
            ["Close", () => closeModal()],
        ],
        'captain_panel'
    );
}


function showCaptainCreationMenu(captain = gameState.captain, onClose = ()=>{}) {

    const {name, skills, skillPoints} = captain

    function improveSkill(skill = SKILLS_ALL[0]) {
        captain.skills.increment(skill, 1)
        captain.skillPoints--;
        showCaptainCreationMenu(captain, onClose)
    }
    function resetCaptain() {
        captain.skills = new CountsMap()
        captain.skillPoints = STARTING_SKILL_POINTS;
        showCaptainCreationMenu(captain, onClose)
    }

    showModal(
        `Create Captain`,
        createElement({children:[
            `Name: ${name}`,
            ...SKILLS_ALL.map(sk=>createElement({children:[
                `${sk}: ${statColorSpan(skills.getAmount(sk), skills.getAmount(sk)*SKILLS_ALL.length/5/SKILL_POINTS_PER_LEVEL, true)}`
            ]})),
            `Skill Points: ${statColorSpan(skillPoints, skillPoints > 0 ? 4 : 1, true)}`,
        ]}),
        [
            ...SKILLS_ALL.map(sk=>[`${sk}+`, ()=>improveSkill(sk), skillPoints <= 0]),
            ["Reset", ()=>resetCaptain()],
            ["Finish", () => {
                closeModal()
                console.log('going to run:',onClose)
                onClose()
            }],
        ],
        'captain_panel'
    );
}
