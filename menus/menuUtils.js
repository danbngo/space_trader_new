
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
            gap: '10px',
            flexAlign: 'center',
            justifyContent: 'center',
        },
        children: [
            ce({
                tag: 'button',
                innerHTML: '◀',
                onClick: () => onNavigate(prevPlanet),
                style: {
                    marginLeft: '10px', marginRight: '10px', marginTop: '0px'
                }
            }),
            ce({
                tag: 'div',
                style: {minWidth: '300px', textAlign: 'center', color: 'black important!'},
                children: [title]
            }),
            ce({
                tag: 'button',
                innerHTML: '▶',
                onClick: () => onNavigate(nextPlanet),
                style: {
                    marginLeft: '10px', marginRight: '10px', marginTop: '0px'
                }
            })
        ]
    });

    const modal = showModal(titleEl, msg, options, modalId, ()=>closeModal());
    modal.firstChild.style.minWidth = '90vw'
}