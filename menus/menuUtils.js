
/**
 * @param {Planet} planet 
 * @param {string} title 
 * @param {string|HTMLElement} msg 
 * @param {(ButtonData|HTMLElement)[]} options 
 * @param {string} modalId 
 * @param {(nextPlanet: Planet) => void} onNavigate 
 */
function showPlanetModal(planet = new Planet(), title = '', msg = '', options = [], modalId = '', onNavigate = (nextPlanet)=>{}) {
    // Create title with navigation arrows
    // Navigate within same planet type (dwarf, regular, or moons)
    let planetList;
    
    // Check if this is a moon (has a parent with children)
    if (gs.system.planets.includes(planet)) {
        // Navigate through the moons of the parent planet
        planetList = gs.system.planets;
    } 
    // Check if it's a dwarf planet
    else if (gs.system.dwarfPlanets.includes(planet)) {
        planetList = gs.system.dwarfPlanets;
    } 
    // Otherwise it's a moon
    else {
        planetList = planet.parent.children.filter(c=>(c instanceof Moon));
    }
    
    const currentIndex = planetList.indexOf(planet);
    const prevPlanet = planetList[currentIndex - 1] || planetList[planetList.length - 1] || planet;
    const nextPlanet = planetList[currentIndex + 1] || planetList[0] || planet;
    console.log('showing planet modal:',{planet, planetList, currentIndex, prevPlanet, nextPlanet});
    
    const titleEl = ce({
        style: {
            display: 'flex',
            gap: '5px',
            flexAlign: 'center',
            justifyContent: 'center',
        },
        children: [
            ce({
                tag: 'button',
                innerHTML: '◀',
                onClick: () => onNavigate(prevPlanet),
                classNames: ['planet-nav-button'],
                style: {
                    marginLeft: '0px', 
                    marginRight: '0px', 
                    marginTop: '0px',
                    background: 'none',
                    border: 'none',
                    color: 'black',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '5px 10px'
                }
            }),
            ce({
                tag: 'div',
                style: {minWidth: '300px', textAlign: 'center', color: 'black important!', marginTop: '8px'},
                children: [title]
            }),
            ce({
                tag: 'button',
                innerHTML: '▶',
                onClick: () => onNavigate(nextPlanet),
                classNames: ['planet-nav-button'],
                style: {
                    marginLeft: '0px', 
                    marginRight: '0px', 
                    marginTop: '0px',
                    background: 'none',
                    border: 'none',
                    color: 'black',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '5px 10px'
                }
            })
        ]
    });

    const modal = showModal(titleEl, msg, options, modalId, ()=>closeModal());
    //modal.firstChildE.style.minWidth = '90vw'
}