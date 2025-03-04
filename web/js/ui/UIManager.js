// UIManager.js
export class UIManager {
    constructor(calculator, traceManager, onCalculationUpdate) {
        this.calculator = calculator;  // Store reference to calculator instance
        this.traceManager = traceManager;
        this.onCalculationUpdate = onCalculationUpdate;
        this.currentSolveFor = "N";
        this.initializeEventListeners();
    }

    /**
     * Update which variable we're solving for
     */
    updateSolveForVariable(value) {
        const previousSolveFor = this.currentSolveFor;
        this.currentSolveFor = value;
        
        // Update UI for previous solve-for variable
        this.updateVariableUI(previousSolveFor, false);
        
        // Update UI for new solve-for variable
        this.updateVariableUI(this.currentSolveFor, true);

        // Run calculation with new solve-for variable
        this.handleCalculation();
    }

    /**
     * Get current values from input fields
     */
    getInputValues() {
        const values = {};
        this.calculator.getVariables().forEach(variable => {
            if (variable !== this.currentSolveFor) {
                const input = document.getElementById(`${variable}_input`);
                if (input && !input.readOnly) {
                    values[variable] = parseFloat(input.value) || 0;
                }
            }
        });
        return values;
    }

    /**
     * Update UI for a specific variable
     */
    updateVariableUI(variable, isSolveFor) {
        const div = document.getElementById(`${variable}_div`);
        const input = document.getElementById(`${variable}_input`);
        const lock = document.getElementById(`${variable}_lock`);
        
        if (div) div.className = isSolveFor ? 'variable-group result' : 'variable-group';
        if (input) input.readOnly = isSolveFor;
        if (lock) {
            lock.style.display = isSolveFor ? "none" : "inline";
            lock.checked = false;
        }
    }

    /**
     * Handle calculation with debounce
     */
    handleCalculation = debounce(() => {
        const result = this.calculator.calculate(this.currentSolveFor, this.getInputValues());
        if (this.onCalculationUpdate) {
            this.onCalculationUpdate(result);
        }
    }, 300);

    /**
     * Initialize all UI event listeners
     */
    initializeEventListeners() {
        // Initialize solve-for select
        const solveForSelect = document.getElementById("solve-for-select");
        if (solveForSelect) {
            // Populate select options based on current model
            this.populateSolveForOptions();
            
            // Set initial value
            solveForSelect.value = this.currentSolveFor;
            
            // Add event listener
            solveForSelect.addEventListener("change", (e) => 
                this.updateSolveForVariable(e.target.value)
            );
        }

        // Initialize variable inputs
        this.calculator.getVariables().forEach(variable => {
            const input = document.getElementById(`${variable}_input`);
            const lock = document.getElementById(`${variable}_lock`);
            
            if (input) {
                input.addEventListener("input", () => this.handleCalculation());
            }
            if (lock) {
                lock.addEventListener("change", () => this.updateLockToolTip(lock));
            }
        });

        // Initialize buttons
        const resetButton = document.getElementById('reset-button');
        if (resetButton) {
            resetButton.addEventListener('click', () => this.resetToDefaults());
        }

        const randomizeButton = document.getElementById('randomize-button');
        if (randomizeButton) {
            randomizeButton.addEventListener('click', () => this.randomizeUnlocked());
        }
    }

    /**
     * Update tooltip for lock checkbox
     */
    updateLockToolTip(lockElement) {
        if (lockElement.checked) {
            lockElement.title = "Unlock this value";
        } else {
            lockElement.title = "Lock this value";
        }
    }

    /**
     * Populate solve-for dropdown with options based on model
     */
    populateSolveForOptions() {
        const solveForSelect = document.getElementById("solve-for-select");
        if (!solveForSelect) return;
        
        // Clear existing options
        solveForSelect.innerHTML = '';
        
        // Add options for each variable
        this.calculator.getVariables().forEach(variable => {
            const option = document.createElement('option');
            option.value = variable;
            option.textContent = this.calculator.getVariableDisplayName(variable);
            solveForSelect.appendChild(option);
        });
    }

    /**
     * Reset all inputs to default values
     */
    resetToDefaults() {
        const defaults = this.calculator.getDefaultValues();
        this.calculator.getVariables().forEach(variable => {
            const input = document.getElementById(`${variable}_input`);
            const lock = document.getElementById(`${variable}_lock`);
            
            if (input && defaults[variable]) {
                input.value = defaults[variable];
            }
            
            if (lock) {
                lock.checked = false;
            }
        });
        
        // Reset solve-for to N
        const solveForSelect = document.getElementById("solve-for-select");
        if (solveForSelect) {
            solveForSelect.value = "N";
            this.updateSolveForVariable("N");
        } else {
            this.handleCalculation();
        }
    }

    /**
     * Randomize all unlocked values
     */
    randomizeUnlocked() {
        this.calculator.getVariables().forEach(variable => {
            if (variable !== this.currentSolveFor) {
                const input = document.getElementById(`${variable}_input`);
                const lock = document.getElementById(`${variable}_lock`);
                
                if (input && lock && !lock.checked) {
                    input.value = this.calculator.getRandomValue(variable);
                }
            }
        });
        
        this.handleCalculation();
    }

    /**
     * Update UI for a new model
     */
    updateForModel(model) {
        // Update solve-for options
        this.populateSolveForOptions();
        
        // Make sure current solve-for is valid for the new model
        const variables = this.calculator.getVariables();
        if (!variables.includes(this.currentSolveFor)) {
            this.updateSolveForVariable('N');
        }
        
        // Show/hide rare earth variables
        this.updateRareEarthVariablesVisibility(model === 'rare-earth');
    }

    /**
     * Show/hide rare earth model variables
     */
    updateRareEarthVariablesVisibility(show) {
        const rareEarthContainer = document.querySelector('.rare-earth-vars');
        if (!rareEarthContainer) return;
        
        // Toggle visibility
        rareEarthContainer.style.display = show ? 'block' : 'none';
        
        // If showing and container is empty, populate it
        if (show && rareEarthContainer.children.length === 0) {
            this.populateRareEarthVariables(rareEarthContainer);
        }
    }

    /**
     * Create UI for rare earth variables
     */
    populateRareEarthVariables(container) {
        // Rare Earth specific variables
        const rareEarthVars = ['f_pm', 'f_g', 'f_t', 'f_m', 'f_j'];
        
        // Create a new row for these variables
        const row = document.createElement('div');
        row.className = 'equation-row rare-earth-row';
        
        // Add each variable
        rareEarthVars.forEach((variable, index) => {
            // Add operator between variables
            if (index > 0) {
                const operator = document.createElement('span');
                operator.className = 'operator';
                operator.textContent = '×';
                row.appendChild(operator);
            }
            
            // Create variable group
            const varGroup = document.createElement('div');
            varGroup.id = `${variable}_div`;
            varGroup.className = 'variable-group';
            
            // Create label
            const label = document.createElement('label');
            label.setAttribute('for', `${variable}_input`);
            label.setAttribute('title', this.calculator.getVariableDescription(variable));
            label.innerHTML = variable.replace('_', '<sub>') + '</sub>';
            
            // Create input
            const input = document.createElement('input');
            input.type = 'number';
            input.id = `${variable}_input`;
            input.value = this.calculator.getDefaultValues()[variable];
            input.step = '0.01';
            input.addEventListener('input', () => this.handleCalculation());
            
            // Create lock
            const lock = document.createElement('input');
            lock.type = 'checkbox';
            lock.id = `${variable}_lock`;
            lock.title = 'Lock this value';
            lock.addEventListener('change', () => this.updateLockToolTip(lock));
            
            // Add elements to the group
            varGroup.appendChild(label);
            varGroup.appendChild(input);
            varGroup.appendChild(lock);
            
            // Add group to the row
            row.appendChild(varGroup);
        });
        
        // Add row to container
        container.appendChild(row);
    }
}

/**
 * Utility function for debouncing
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}