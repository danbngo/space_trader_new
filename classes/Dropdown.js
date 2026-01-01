/**
 * A reusable dropdown component.
 * @class Dropdown
 */
class Dropdown {
    /**
     * Creates a new dropdown
     * @param {Array} buttons - Array of button data [label, handler, disabled, classNames]
     * @param {boolean} dropUpwards - Whether dropdown opens upwards
     * @param {number|null} selectedIndex - Initially selected index
     */
    constructor(buttons = [], dropUpwards = false, selectedIndex = null) {
        if (!buttons || buttons.length === 0) {
            this.container = ce()
            return
        }
        
        this.buttons = buttons
        this.dropUpwards = dropUpwards
        this.currentSelectedIndex = selectedIndex !== null ? selectedIndex : 0
        this.dropdownButtons = []
        
        this._createElements()
        this._setupEventListeners()
        this._measureAndApplyWidth()
    }
    
    /**
     * Creates the DOM elements for the dropdown
     * @private
     */
    _createElements() {
        const selectedBtnData = this.buttons[this.currentSelectedIndex]
        const [initialLabel] = selectedBtnData
        
        // Create the label element (what shows when dropdown is closed)
        this.labelElement = ce({
            classNames: ['gameButton'],
            innerHTML: initialLabel
        })
        
        // Create the items container (what shows when dropdown is open)
        this.itemsContainer = ce({
            classNames: ['dropdown-items'],
            style: {
                position: 'absolute',
                display: 'none',
                zIndex: '1000',
                left: '0',
                backgroundColor: '#000',
                ...(this.dropUpwards ? { bottom: '100%' } : { top: '100%' })
            }
        })
        
        // Create dropdown items
        this.buttons.forEach((btnData, index) => {
            if (!btnData) return
            
            const [label, handler, disabled, classNames] = btnData
            const btn = ce({
                tag: 'div',
                classNames: ['gameButton'],
                innerHTML: label,
                style: {
                    whiteSpace: 'nowrap',
                    margin: '0',
                    width: '100%',
                    boxSizing: 'border-box'
                }
            })
            
            // Add custom class names if provided
            if (classNames) {
                if (Array.isArray(classNames)) {
                    classNames.forEach(cn => cn && btn.classList.add(cn))
                } else {
                    btn.classList.add(classNames)
                }
            }
            
            // Disable if it's the currently selected item
            if (index === this.currentSelectedIndex) {
                btn.classList.add('disabled')
            }
            
            // Handle clicks on dropdown items
            btn.onclick = (e) => {
                e.stopPropagation()
                if (!btn.classList.contains('disabled')) {
                    this._updateDropdown(index)
                }
            }
            
            this.dropdownButtons.push(btn)
            this.itemsContainer.appendChild(btn)
        })
        
        // Create the dropdown container
        this.container = ce({
            classNames: ['dropdown-container'],
            style: {
                position: 'relative',
                display: 'inline-block'
            },
            children: [this.labelElement, this.itemsContainer]
        })
    }
    
    /**
     * Sets up event listeners
     * @private
     */
    _setupEventListeners() {
        // Toggle dropdown when label is clicked
        this.labelElement.onclick = (e) => {
            e.stopPropagation()
            const isOpen = this.itemsContainer.style.display === 'block'
            this.itemsContainer.style.display = isOpen ? 'none' : 'block'
        }
        
        // Close dropdown when clicking outside
        this.documentClickHandler = () => {
            this.itemsContainer.style.display = 'none'
        }
        document.addEventListener('click', this.documentClickHandler)
    }
    
    /**
     * Measures buttons and applies consistent width
     * @private
     */
    _measureAndApplyWidth() {
        // Temporarily make container visible to measure
        this.itemsContainer.style.display = 'block'
        this.itemsContainer.style.visibility = 'hidden'
        
        // Add to body temporarily to measure
        document.body.appendChild(this.container)
        
        let maxWidth = this.labelElement.offsetWidth
        this.dropdownButtons.forEach(btn => {
            maxWidth = Math.max(maxWidth, btn.offsetWidth)
        })
        
        // Apply the max width to all elements
        this.labelElement.style.width = maxWidth + 'px'
        this.itemsContainer.style.width = maxWidth + 'px'
        
        // Hide the dropdown again
        this.itemsContainer.style.display = 'none'
        this.itemsContainer.style.visibility = 'visible'
        document.body.removeChild(this.container)
    }
    
    /**
     * Updates the dropdown state when a new item is selected
     * @private
     * @param {number} newIndex - The index of the newly selected item
     */
    _updateDropdown(newIndex) {
        this.currentSelectedIndex = newIndex
        const [newLabel, newHandler] = this.buttons[newIndex]
        
        // Update label immediately
        this.labelElement.innerHTML = newLabel
        
        // Update all button states
        this.itemsContainer.childNodes.forEach((btn, index) => {
            if (index === newIndex) {
                btn.classList.add('disabled')
            } else {
                btn.classList.remove('disabled')
            }
        })
        
        // Close dropdown
        this.itemsContainer.style.display = 'none'
        
        // Call the handler after updating UI (use setTimeout to ensure UI updates first)
        if (newHandler) {
            setTimeout(() => newHandler(), 0)
        }
    }
    
    /**
     * Cleans up event listeners
     */
    destroy() {
        if (this.documentClickHandler) {
            document.removeEventListener('click', this.documentClickHandler)
        }
    }
}