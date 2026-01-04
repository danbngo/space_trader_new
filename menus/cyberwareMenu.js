/**
 * Displays a comprehensive cyberware management menu with installed implants and fleet inventory
 * @param {Officer|null} selectedOfficer - The officer whose implants to display (defaults to captain)
 */
function showCyberwareMenu(selectedOfficer = null) {
    const {fleet} = gs
    const officer = selectedOfficer || gs.captain
    const allCrew = fleet.officers // officers already includes captain
    
    // Create officer selection dropdown
    const officerOptions = allCrew.map(o => [
        o.name + (o === gs.captain ? ' (Captain)' : ''),
        () => showCyberwareMenu(o)
    ])
    
    const officerDropdown = new Dropdown(
        officerOptions,
        false,
        allCrew.indexOf(officer),
        250
    )
    
    // Installed implants section
    function createInstalledImplantsTable() {
        if (officer.implants.length === 0) {
            return ce({children: [colorSpan('No cybernetic implants installed.', COLORS.Gray)]})
        }
        
        const rows = [
            ['Implant', 'Quality', 'Value']
        ]
        
        for (const implant of officer.implants) {
            rows.push([
                colorSpan(implant.implantType.name, implant.implantType.color),
                statColorSpan(roundToPlaces(implant.quality*100, 1)+'%', implant.quality),
                implant.value + ' CR'
            ])
        }
        
        const table = createTable(rows, (rowIndex) => onSelectInstalledImplant(officer.implants[rowIndex]))
        
        // Add popovers to each implant row
        const tableRows = table.querySelectorAll('tr')
        tableRows.forEach((row, index) => {
            if (index === 0) return // Skip header row
            const implant = officer.implants[index - 1]
            if (implant && implant.implantType.description) {
                createPopoverElement(row, implant.implantType.description)
            }
        })
        
        return table
    }
    
    function onSelectInstalledImplant(implant = new CyberImplant()) {
        /** @type {ButtonData[]} */
        const buttons = [
            ['Remove', () => {
                safeRemove(officer.implants, implant)
                fleet.cyberModules.push(implant)
                showCyberwareMenu(officer)
            }],
            ['Back', () => showCyberwareMenu(officer)],
        ]
        refreshPanelButtons('cyberware_panel', buttons)
    }
    
    // Fleet inventory section
    function createFleetImplantsTable() {
        if (fleet.cyberModules.length === 0) {
            return ce({children: [colorSpan('No implants in fleet inventory.', COLORS.Gray)]})
        }
        
        const rows = [
            ['Implant', 'Quality', 'Value']
        ]
        
        for (const implant of fleet.cyberModules) {
            rows.push([
                colorSpan(implant.implantType.name, implant.implantType.color),
                statColorSpan(roundToPlaces(implant.quality*100, 1)+'%', implant.quality),
                implant.value + ' CR'
            ])
        }
        
        const table = createTable(rows, (rowIndex) => onSelectFleetImplant(fleet.cyberModules[rowIndex]))
        
        // Add popovers to each implant row
        const tableRows = table.querySelectorAll('tr')
        tableRows.forEach((row, index) => {
            if (index === 0) return // Skip header row
            const implant = fleet.cyberModules[index - 1]
            if (implant && implant.implantType.description) {
                createPopoverElement(row, implant.implantType.description)
            }
        })
        
        return table
    }
    
    function onSelectFleetImplant(implant = new CyberImplant()) {
        const alreadyHasImplant = officer.implants.some(i => i.implantType === implant.implantType)
        const atCapacity = officer.implants.length >= officer.maxImplants
        const canInstall = !alreadyHasImplant && !atCapacity
        
        let reasonText = ''
        if (alreadyHasImplant) {
            reasonText = `${officer.name} already has a ${implant.implantType.name} installed.`
        } else if (atCapacity) {
            reasonText = `${officer.name} is at maximum implant capacity (${officer.maxImplants}). Invest in Cyber Capacity perks to increase.`
        }
        
        /** @type {ButtonData[]} */
        const buttons = [
            ['Install on ' + officer.name, () => {
                safeRemove(fleet.cyberModules, implant)
                officer.implants.push(implant)
                showCyberwareMenu(officer)
            }, !canInstall],
            ['Back', () => showCyberwareMenu(officer)],
        ]
        
        refreshPanelButtons('cyberware_panel', buttons)
    }
    
    // Left column - Installed implants
    const leftColumn = ce({
        style: {display: 'flex', flexDirection: 'column', gap: '12px'},
        children: [
            ce({children: ['<b><u>Crew Member</u></b>']}),
            officerDropdown.container,
            ce({children: [`<br/><b>Installed Implants (${officer.implants.length}/${officer.maxImplants})</b>`]}),
            createInstalledImplantsTable(),
        ]
    })
    
    // Right column - Fleet inventory
    const rightColumn = ce({
        style: {display: 'flex', flexDirection: 'column', gap: '12px'},
        children: [
            ce({children: ['<b><u>Fleet Inventory</u></b>']}),
            ce({children: [`${fleet.cyberModules.length} implant${fleet.cyberModules.length !== 1 ? 's' : ''} available`]}),
            createFleetImplantsTable(),
        ]
    })
    
    const columnLayout = createColumnLayout([leftColumn, rightColumn])
    
    showModal(
        'Cyberware Management',
        ce({children:[
            columnLayout,
        ],
        style: {
            width: '800px'
        }}),
        [
            ['Close', () => closeModal()],
        ],
        'cyberware_panel'
    )
}
