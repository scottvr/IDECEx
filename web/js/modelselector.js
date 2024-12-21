// Import the DrakeCalculator class
import DrakeCalculator from './drake-calculator.js';

class ModelSwitcher {
    constructor() {
        this.calculator = new DrakeCalculator('classic');
        this.currentModel = 'classic';
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const classicBtn = document.getElementById('classic-model');
        const rareEarthBtn = document.getElementById('rare-earth-model');

        classicBtn.addEventListener('click', () => this.switchModel('classic'));
        rareEarthBtn.addEventListener('click', () => this.switchModel('rare-earth'));
    }

    switchModel(model) {
        if (this.currentModel === model) return;

        // Update UI
        this.updateButtonStates(model);
        this.updateModelDescription(model);
        this.updateEquationDisplay(model);
        this.updateVariableInputs(model);

        // Update calculator
        this.calculator = new DrakeCalculator(model);
        this.currentModel = model;

        // Recalculate with new model
        this.recalculateResult();
    }

    updateButtonStates(model) {
        const classicBtn = document.getElementById('classic-model');
        const rareEarthBtn = document.getElementById('rare-earth-model');

        classicBtn.classList.toggle('active', model === 'classic');
        rareEarthBtn.classList.toggle('active', model === 'rare-earth');
    }

    updateModelDescription(model) {
        const classicDesc = document.getElementById('classic-description');
        const rareEarthDesc = document.getElementById('rare-earth-description');

        classicDesc.classList.toggle('active', model === 'classic');
        rareEarthDesc.classList.toggle('active', model === 'rare-earth');
    }

    updateEquationDisplay(model) {
        const equationDisplay = document.getElementById('equation-display');
        const equations = {
            'classic': 'N = R* × fp × ne × fl × fi × fc × L',
            'rare-earth': 'N = R* × fp × fpm × ne × fg × ft × fi × fc × fl × fm × fj × L'
        };
        
        equationDisplay.innerHTML = `<span class="katex-display"><span class="katex"><span class="katex-html">${equations[model]}</span></span></span>`;
    }

    updateVariableInputs(model) {
        const rareEarthVars = document.querySelector('.rare-earth-vars');
        
        if (model === 'rare-earth') {
            // Create and show additional variable inputs
            if (!rareEarthVars) {
                this.createRareEarthInputs();
            }
            rareEarthVars.classList.add('active');
        } else {
            // Hide additional variable inputs
            if (rareEarthVars) {
                rareEarthVars.classList.remove('active');
            }
        }

        // Update solve-for select options
        this.updateSolveForOptions(model);
    }

    createRareEarthInputs() {
        const container = document.createElement('div');
        container.className = 'rare-earth-vars';
        
        const newVariables = [
            { id: 'f_pm', label: 'fpm', title: 'Fraction of planets with metal-rich composition' },
            { id: 'f_g', label: 'fg', title: 'Fraction in galactic habitable zone' },
            { id: 'f_t', label: 'ft', title: 'Fraction with stable temperatures' },
            { id: 'f_m', label: 'fm', title: 'Fraction with large moons' },
            { id: 'f_j', label: 'fj', title: 'Fraction with Jupiter-like protectors' }
        ];

        newVariables.forEach(variable => {
            const varGroup = this.createVariableGroup(variable);
            container.appendChild(varGroup);
        });

        document.querySelector('.drake-equation').appendChild(container);
    }

    createVariableGroup({ id, label, title }) {
        const div = document.createElement('div');
        div.className = 'variable-group';
        div.id = `${id}_div`;

        div.innerHTML = `
            <label for="${id}_input" title="${title}">${label}</label>
            <input type="number" id="${id}_input" value="${this.calculator.defaultValues[id]}" step="0.01">
            <input type="checkbox" id="${id}_lock" title="Lock this value">
        `;

        return div;
    }

    updateSolveForOptions(model) {
        const selectElement = document.getElementById('solve-for-select');
        const variables = this.calculator.getVariables();
        
        // Save current selection if possible
        const currentSelection = selectElement.value;
        
        // Clear existing options
        selectElement.innerHTML = '';
        
        // Add new options
        variables.forEach(variable => {
            const option = document.createElement('option');
            option.value = variable;
            option.textContent = this.getVariableDisplayName(variable);
            selectElement.appendChild(option);
        });
        
        // Restore selection if still valid, otherwise default to 'N'
        selectElement.value = variables.includes(currentSelection) ? currentSelection : 'N';
    }

    getVariableDisplayName(variable) {
        const names = {
            'N': 'N (Number of Civilizations)',
            'R_star': 'R* (Star Formation Rate)',
            'f_p': 'fp (Fraction of Stars with Planets)',
            'f_pm': 'fpm (Metal-rich Composition)',
            'n_e': 'ne (Habitable Planets per Star)',
            'f_g': 'fg (Galactic Habitable Zone)',
            'f_t': 'ft (Temperature Stability)',
            'f_i': 'fi (Intelligent Life Evolution)',
            'f_c': 'fc (Communication Capability)',
            'f_l': 'fl (Life Evolution)',
            'f_m': 'fm (Large Moon)',
            'f_j': 'fj (Jupiter Protection)',
            'L': 'L (Communication Lifetime)'
        };
        return names[variable] || variable;
    }

    recalculateResult() {
        // Trigger recalculation using the current solve-for variable
        const solveForSelect = document.getElementById('solve-for-select');
        const event = new Event('change');
        solveForSelect.dispatchEvent(event);
    }
}

// Initialize the model switcher when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.modelSwitcher = new ModelSwitcher();
});