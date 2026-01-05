// Space Game Logic

// Creates a UI panel with title, text, and buttons

/**
 * @typedef {[string, Function]|[string, Function, boolean]|[string, Function, boolean, string]} ButtonData
 * @property {string} 0 - Label text for the button
 * @property {Function} 1 - Handler function to call when button is clicked
 * @property {boolean} [2] - Whether the button is disabled
 * @property {string|string[]} [3] - CSS class name(s) to apply to the button
 * @property {string} [4] - Disabled reason to show in popover when hovering over disabled button
 */

const UI_CONTAINER = document.getElementById("game-container");

/**
 * Removes all child elements from a parent element.
 * @param {HTMLElement} parent - The parent element to clear
 */
function removeChildren(parent = ce()) {
    while (parent.firstChild) parent.removeChild(parent.firstChild)
}

/**
 * Refreshes the buttons in a panel with new button data.
 * @param {string|HTMLElement} panelId - The panel ID or element to refresh buttons for
 * @param {(ButtonData|HTMLElement)[]} buttons - Array of button data or HTML elements
 */
function refreshPanelButtons (panelId = '', buttons) {
    const panel = (panelId instanceof HTMLElement) ? panelId : document.body.querySelector(`#${panelId}`)
    if (!panel) throw new Error(`Panel with id '${panelId}' not found for refreshPanelButtons`);
    /** @type {HTMLElement} */
    const buttonsEl = panel.querySelector(".panel-buttons")
    removeChildren(buttonsEl)
    if (buttons) buttons.forEach((btnData, index) => {
        console.log('btnData:',btnData)
        if (!btnData) return
        if (btnData instanceof HTMLElement) {
            buttonsEl.appendChild(btnData)
            // Apply float:right to last element
            if (index === buttons.length - 1) {
                btnData.style.float = 'right'
            }
            return
        }
        const [label, handler, disabled, disabledReason] = btnData
        const btn = document.createElement('div');
        btn.classList.add('gameButton');
        btn.innerHTML = label;
        // @ts-ignore
        btn.onclick = ()=>{
            if (btn.classList.contains('disabled')) return
            handler()
        }
        // Apply float:right to last button
        if (index === buttons.length - 1) {
            btn.style.float = 'right'
        }
        buttonsEl.appendChild(btn);
        if (disabled) {
            console.log('gonna disable a btn:',btn); 
            btn.classList.add('disabled')
            // Add popover if disabledReason is provided
            if (disabledReason) {
                createPopoverElement(btn, disabledReason)
            }
        }
    });
}

/**
 * Creates a panel with title, content, buttons, and optional close button.
 * @param {string|HTMLElement} title - The panel title
 * @param {string|HTMLElement} text - The panel content
 * @param {(ButtonData|HTMLElement)[]} buttons - Array of button data or HTML elements
 * @param {string} id - The ID to assign to the panel
 * @param {Function|null} onClosePanel - Optional callback when close button is clicked
 * @returns {HTMLElement} The created panel element
 */
function createPanel(title = '', text = '', buttons = [], id = '', onClosePanel = null) {
    const panelChildren = [
        ce({classNames:['panel-header'], children: [title]}),
        ce({classNames:['panel-content'], children: [text]}),
        ce({classNames:['panel-buttons']})
    ];
    
    // Add close button if onClosePanel is provided
    if (onClosePanel) {
        panelChildren.unshift(
            ce({
                tag: 'button',
                classNames: ['panel-close-button'],
                innerHTML: '✕',
                onClick: onClosePanel
            })
        );
    }
    
    const panel = ce({
        id,
        classNames: ['panel'],
        children: panelChildren
    })
    refreshPanelButtons(panel, buttons)
    return panel;
}

/**
 * Shows a panel in the UI container.
 * @param {string|HTMLElement} title - The panel title
 * @param {string|HTMLElement} text - The panel content
 * @param {(ButtonData|HTMLElement)[]} buttons - Array of button data or HTML elements
 * @param {string} id - The ID to assign to the panel
 * @returns {HTMLElement} The created panel element
 */
function showPanel(title = '', text = '', buttons = [], id = '') {
    const panel = createPanel(title, text, buttons, id);
    showElement(panel)
    return panel
}

/**
 * Shows a slider modal for selecting a numeric value within a range.
 * @param {number} min - Minimum value for the slider
 * @param {number} max - Maximum value for the slider
 * @param {string} title - Modal title
 * @param {string} description - Description text
 * @param {(value: number) => string} footerGenerator - Function to generate footer text based on current value
 * @param {string} acceptLabel - Label for accept button
 * @param {string} cancelLabel - Label for cancel button
 * @param {(value: number) => void} onAccept - Callback when accept button is clicked
 * @param {() => void} onCancel - Callback when cancel button is clicked
 * @returns {HTMLElement} The created modal panel
 */
function showSliderModal(min = 0, max = 10, title = '', description = '', footerGenerator = (value = 0)=>'', acceptLabel = 'Accept', cancelLabel = 'Cancel', onAccept = (value = 0) => {}, onCancel = () =>closeModal()) {
    let currentValue = min;
    
    const slider = ce({tag: 'input', style: {width: '100%'}});
    if (!(slider instanceof HTMLInputElement)) return
    slider.type = 'range';
    slider.min = ''+min;
    slider.max = ''+max;
    slider.value = ''+min;
    slider.oninput = (e) => {
        // @ts-ignore
        currentValue = parseInt(e.target.value);
        const footerText = footerGenerator ? footerGenerator(currentValue) : ''
        document.getElementById('slider-value').textContent = `${currentValue} / ${max}`;
        document.getElementById('slider-footer').innerHTML = footerText;
    };
    slider.disabled = (min >= max)

    /** @type {ButtonData[]} */
    const buttons = [
        [acceptLabel, () => {
            closeModal()
            onAccept(currentValue)
        }, false],
        [cancelLabel, () => {
            closeModal()
            onCancel()
        }, false]
    ];

    const panel = showModal(
        title,
        ce({children:[
            description,
            ce({id: 'slider-value', style: {textAlign: 'center', marginTop: '16px'}}),
            slider,
            ce({id: 'slider-footer'}),
            ce({classNames:['panel-buttons']})
        ]}),
        buttons,
    );
    
    refreshPanelButtons(panel, buttons);
    // @ts-ignore
    slider.oninput({target:{value:slider.value}})
    return panel;
}

/**
 * Shows an element in the main UI container, replacing current content.
 * @param {HTMLElement} element - The element to display
 */
function showElement(element = ce()) {
    UI_CONTAINER.innerHTML = "";
    UI_CONTAINER.appendChild(element);
}

let currentMap;

/**
 * Shows a map in the main UI container.
 * @param {BaseMap} map - The map to display
 */
function showMap(map) {
    currentMap = map
    showElement(map.root)
}

/**
 * Creates a colored span with text based on a ratio (stat coloring).
 * @param {string|number} text - The text to display
 * @param {number} ratio - The ratio used for color interpolation (0-4+)
 * @returns {string} HTML string with colored span
 */
function statColorSpan(text = '', ratio = 1.0) {
    // clamp ratio so interpolation works cleanly
    const r = Math.max(0, Math.min(ratio, 4.0));
    // helper: linear interpolation between two hex colors
    function lerpColor(a, b, t) {
        const ar = parseInt(a.slice(1, 3), 16);
        const ag = parseInt(a.slice(3, 5), 16);
        const ab = parseInt(a.slice(5, 7), 16);
        const br = parseInt(b.slice(1, 3), 16);
        const bg = parseInt(b.slice(3, 5), 16);
        const bb = parseInt(b.slice(5, 7), 16);
        const rr = Math.round(ar + (br - ar) * t);
        const rg = Math.round(ag + (bg - ag) * t);
        const rb = Math.round(ab + (bb - ab) * t);
        return `rgb(${rr}, ${rg}, ${rb})`;
    }
    // segments (minRatio, maxRatio, colorA, colorB)
    /** @type {Array<[number, number, string, string]>} */
    const segments = [
        [0.0, 0.5,   "#ff0000", "#ff8000"], // red → orange
        [0.5, 0.75,  "#ff8000", "#ffff00"], // orange → yellow
        [0.75,1.0,   "#ffff00", "#ffffff"], // yellow → white
        [1.0, 4.0,   "#ffffff", "#00ff00"], // white → green
    ];
    let color = "#00ffff"; // fallback for ratio ≥ 4.0
    for (let [minR, maxR, cA, cB] of segments) {
        if (r >= minR && r <= maxR) {
            const t = (r - minR) / (maxR - minR);
            color = lerpColor(cA, cB, t);
            break;
        }
    }
    return colorSpan(text, color)
}

/**
 * Converts an RGB(A) array to a CSS color string.
 * @param {number[]} color - Array of [r, g, b] or [r, g, b, a] values
 * @returns {string} CSS color string (rgb or rgba)
 */
function rgbArrayToString(color = [255, 255, 255, 1.0]) {
    if (color.length >= 4) {
        return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`;
    } else {
        return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    }
}

/** 
 * Creates a colored span HTML string.
 * @function colorSpan
 * @param {string|number} text - The text to display
 * @param {string | Array<number>} color - CSS color string or RGB(A) array
 * @returns {string} HTML string with colored span
 */
function colorSpan(text = '', color = '') {
    if (Array.isArray(color)) {
        // convert color array to rgba string
        color = rgbArrayToString(color);
    }

    // return HTML string instead of DOM element
    return `<span style="color: ${color}">${text}</span>`;
}

/**
 * Creates a DOM element with specified properties.
 * @param {Object} options - Element configuration options
 * @param {string} [options.tag='div'] - HTML tag name
 * @param {string} [options.id=''] - Element ID
 * @param {string} [options.innerHTML=''] - Inner HTML content
 * @param {(string|HTMLElement)[]} [options.children=[]] - Child elements or HTML strings
 * @param {HTMLElement} [options.parent] - Parent element to append to
 * @param {string[]} [options.classNames=[]] - CSS class names to apply
 * @param {Function} [options.onClick] - Click event handler
 * @param {Object} [options.style={}] - CSS styles to apply
 * @param {boolean} [options.disabled=false] - Whether element is disabled
 * @returns {HTMLElement} The created element
 */
function ce({tag = 'div', id = '', innerHTML = '', children = [], parent = undefined, classNames = [], onClick = undefined, style = {}, disabled = false} = {}) {
    id = id || ''
    tag = tag || 'div'
    children = children || []
    classNames = classNames || []

    /** @type {any} */
    const effectiveStyle = style || {}
    //if (onClick) effectiveStyle.cursor = 'pointer'
    if (disabled) effectiveStyle.cursor = ''

    /** @type {any} */
    const el = document.createElement(tag)
    if (innerHTML !== undefined) el.innerHTML = ''+innerHTML
    if (id && id.length > 0) el.id = ''+id
    if (children && children.length > 0) for (const child of children) if (child !== undefined && child !== null) el.appendChild(child instanceof HTMLElement ? child : ce({innerHTML: child}))
    if (parent) parent.appendChild(el)
    if (classNames && classNames.length > 0) for (const className of classNames) if (className && className.length > 0) el.classList.add(className)
    if (onClick) el.onclick = ()=>{
        console.log('got here with classlist:',el.classList)
        if (el.classList.contains('disabled')) return
        onClick()
    }
    if (style) applyStyle(el, effectiveStyle)
    if (disabled && (el instanceof HTMLButtonElement || el instanceof HTMLInputElement)) el.disabled = true
    return el
}

/**
 * Applies CSS styles to an element.
 * @param {HTMLElement} element - The element to style
 * @param {Object} style - Object containing CSS property-value pairs
 */
function applyStyle(element, style = {}) {
    for (const key in style) {
        element.style[key] = style[key]
    }
}

// utils.js or tableUtil.js
/**
 * Creates a table element from a 2D array of data.
 * @function createTable
 * @param {(HTMLElement|string|number|any)[][]} rows - 2D array representing table rows and cells
 * @param {((rowIndex: number) => void)|null} onSelectRow - Callback when a row is selected (pass null for no selection)
 * @param {number|null} firstSelectedIndex - Index of the row to be initially selected
 * @returns {HTMLTableElement} - The created table element
 */
function createTable(rows = [[ce()]], onSelectRow = null, firstSelectedIndex = onSelectRow ? 0 : null) {
    const table = document.createElement("table");
    table.className = "ui-table";

    // Determine column count (future proof: if rows become arrays)
    const colCount = Math.max(
        ...rows.map(row => Array.isArray(row) ? row.length : 1)
    );

    let selectedRow = undefined
    rows.forEach((row, index) => {
        const isFirstSelected = (index) === firstSelectedIndex

        const onRowClicked = ()=>{
            if (!onSelectRow) return
            if (selectedRow) selectedRow.classList.remove('selected')
            tr.classList.add('selected')
            selectedRow = tr
            onSelectRow(index-1); //-1 for header
        }

        const tr = ce({
            parent: table,
            tag:'tr',
            classNames: [index == 0 ? 'ui-table-first-row' : 'ui-table-row', isFirstSelected ? 'selected' : null],
            onClick: (index == 0 ? undefined : onRowClicked)
        })
        if (isFirstSelected) selectedRow = tr

        for (let i = 0; i < colCount; i++) {
            ce({
                parent: tr,
                tag:index == 0 ? 'th' : 'td',
                classNames:['ui-table-cell'],
                children: [row[i]],
                onClick: (index == 0 ? undefined : onRowClicked)
            })
        }
    });

    //if (firstSelectedIndex !== undefined && firstSelectedIndex !== null) onSelectRow(firstSelectedIndex);

    return table;
}

let currentModal = ce()

/**
 * Shows a modal dialog with title, content, and buttons.
 * @param {string | HTMLElement} title - The modal title
 * @param {string | HTMLElement} text - The modal content
 * @param {(ButtonData|HTMLElement)[]} buttons - Array of button data or HTML elements
 * @param {string} id - The ID to assign to the modal
 * @param {Function|null} onClosePanel - Optional callback when close button is clicked
 * @returns {HTMLElement} The created modal element
 */
function showModal(title = '', text = '', buttons = [['Continue', ()=>{}, false]], id = '', onClosePanel = null) {
    onClosePanel = null //danmod - this was ugly
    if (currentMap) {
        currentMap.refresh()
        if (currentMap.togglePause) currentMap.togglePause(true)
    }
    // Close existing modal if open
    if (currentModal) closeModal();
    // Create overlay
    currentModal = ce({parent:UI_CONTAINER, classNames:['modal-overlay'], children:[
        createPanel(title, text, buttons, id, onClosePanel)
    ]})
    return currentModal
}

/**
 * Closes the currently open modal.
 */
function closeModal() {
    if (currentModal) {
        currentModal.remove();
        currentModal = null;
    }
    if (currentMap) currentMap.refresh()
}

/**
 * Attaches a drag handler to an element.
 * @param {HTMLElement} element - The element to make draggable
 * @param {(dx: number, dy: number) => void} callback - Callback with delta x and y on drag
 */
function attachDragHandler(element = ce(), callback = (dx=0,dy=0)=>{}) {
    let isDown = false;
    let lastX = 0;
    let lastY = 0;

    if (element instanceof HTMLElement) element.addEventListener("mousedown", (ev) => {
        if (ev.button !== 0) return; // left mouse only

        isDown = true;
        lastX = ev.clientX;
        lastY = ev.clientY;

        function onMouseMove(moveEv) {
            if (!isDown) return;

            const dx = moveEv.clientX - lastX;
            const dy = moveEv.clientY - lastY;

            // Update last position for next delta
            lastX = moveEv.clientX;
            lastY = moveEv.clientY;

            callback(dx,dy);
        }

        function onMouseUp() {
            isDown = false;
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        }

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    });
}


/**
 * Attaches a mouse wheel handler to an element.
 * @param {HTMLElement} element - The element to attach the handler to
 * @param {(direction: number) => void} callback - Callback with direction (+1 for up, -1 for down)
 */
function attachMouseWheelHandler(element = ce(), callback = (direction = 1)=>{}) {
    if (!element || typeof callback !== "function") return;

    const handler = (event) => {
        event.preventDefault();

        // Standard: wheelDeltaY or deltaY
        let delta = event.deltaY || event.wheelDelta || (-event.detail);

        // Normalize to +1 / -1
        const direction = delta < 0 ? 1 : -1;

        callback(direction);
    };

    // Modern browsers
    element.addEventListener("wheel", handler, { passive: false });

    // Older WebKit/IE
    element.addEventListener("mousewheel", handler, { passive: false });

    // Older Firefox
    element.addEventListener("DOMMouseScroll", handler, { passive: false });
}



/**
 * Creates a column layout from an array of elements.
 * @param {HTMLElement[]} columnItems - Array of elements to display as columns
 * @returns {HTMLElement} The column layout container
 */
function createColumnLayout(columnItems = []) {
    const children = columnItems.map(item => ce({
        classNames: ['gameColumn'],
        children: [item]
    }))

    return ce({
        classNames: ['gameColumns'],
        children: children
    })
}

/**
 * Creates a popover element that appears on hover
 * @param {HTMLElement} element - The element that triggers the popover on hover
 * @param {string|HTMLElement} popoverContent - The content to display in the popover
 * @returns {HTMLElement} The original element with popover functionality
 */
function createPopoverElement(element, popoverContent) {
    const popover = ce({
        classNames: ['popover'],
        children: [
            ce({
                classNames: ['popover-content'],
                children: [popoverContent]
            })
        ]
    })
    
    document.body.appendChild(popover)
    
    let showTimeout = null
    
    const updatePopoverPosition = (e) => {
        const padding = 10
        const mouseX = e.clientX
        const mouseY = e.clientY
        
        let left = mouseX + padding
        let top = mouseY + padding
        
        const popoverRect = popover.getBoundingClientRect()
        const windowWidth = window.innerWidth
        const windowHeight = window.innerHeight
        
        if (left + popoverRect.width > windowWidth) {
            left = mouseX - popoverRect.width - padding
        }
        
        if (top + popoverRect.height > windowHeight) {
            top = mouseY - popoverRect.height - padding
        }
        
        left = Math.max(padding, left)
        top = Math.max(padding, top)
        
        popover.style.left = left + 'px'
        popover.style.top = top + 'px'
    }
    
    element.addEventListener('mouseenter', (e) => {
        updatePopoverPosition(e)
        showTimeout = setTimeout(() => {
            popover.classList.add('visible')
        }, 500)
    })
    
    element.addEventListener('mousemove', (e) => {
        updatePopoverPosition(e)
    })
    
    element.addEventListener('mouseleave', () => {
        if (showTimeout) {
            clearTimeout(showTimeout)
            showTimeout = null
        }
        popover.classList.remove('visible')
    })
    
    const observer = new MutationObserver((mutations) => {
        if (!document.body.contains(element)) {
            popover.remove()
            observer.disconnect()
        }
    })
    observer.observe(document.body, { childList: true, subtree: true })
    
    element.classList.add('popover-trigger')
    
    return element
}
