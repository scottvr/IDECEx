// Import the necessary modules
import DrakeCalculator from './calculator/DrakeCalculator.js';
import { TraceManager } from './traces/TraceManager.js';
import { UIManager } from './ui/UIManager.js';
import { VisualizationManager } from './visualizations/VisualizationManager.js';
import { DataProcessor } from './data/DataProcessor.js';

/**
 * Main application class that coordinates all the components
 */
class DrakeExplorer {
    constructor() {
        // Initialize core components
        this.calculator = new DrakeCalculator();
        this.traceManager = new TraceManager();
        this.dataProcessor = new DataProcessor();
        
        // Initialize UI with callbacks
        this.uiManager = new UIManager(
            this.calculator, 
            this.traceManager,
            (result) => this.handleCalculationUpdate(result)
        );
        
        // Initialize visualization manager
        this.vizManager = new VisualizationManager();
        
        // Initialize equation display
        this.updateEquationDisplay(this.calculator.getCurrentModel() || 'classic');
        
        // Expose the instance to window for React components
        window.drakeExplorer = this;
        
        // Initial calculation
        this.uiManager.handleCalculation();
    }
    
    /**
     * Handles updates when a calculation occurs
     */
    handleCalculationUpdate(result) {
        // Add calculation to trace
        this.traceManager.addCalculation(result);
        
        // Update UI with result
        const resultInput = document.getElementById('N_input');
        if (resultInput && result.N) {
            resultInput.value = result.N.toFixed(4);
        }
        
        // Process data for visualizations
        const processedData = this.dataProcessor.processDataForVisualizations(
            this.traceManager.getCurrentTrace()
        );
        
        // Update visualizations
        this.vizManager.updateAllCharts(processedData, this.calculator.getCurrentModel());
    }
    
    /**
     * Handles model change (Classic vs Rare Earth)
     */
    handleModelChange(model) {
        console.log('Switching to model:', model);
        
        // Update calculator model
        this.calculator.setModel(model);
        
        // Update equation display
        this.updateEquationDisplay(model);
        
        // Update UI for the new model
        this.uiManager.updateForModel(model);
        
        // Update visualizations for the new model
        this.vizManager.setModel(model);
        
        // Recalculate with new model
        this.uiManager.handleCalculation();
    }
    
    /**
     * Updates the equation display based on model
     */
    updateEquationDisplay(model) {
        const equationDisplay = document.getElementById('equation-display');
        if (equationDisplay) {
            if (model === 'classic') {
                equationDisplay.innerHTML = 'N = R<sub>*</sub> × f<sub>p</sub> × n<sub>e</sub> × f<sub>l</sub> × f<sub>i</sub> × f<sub>c</sub> × L';
            } else {
                equationDisplay.innerHTML = 'N = R<sub>*</sub> × f<sub>p</sub> × f<sub>pm</sub> × n<sub>e</sub> × f<sub>g</sub> × f<sub>t</sub> × f<sub>i</sub> × f<sub>c</sub> × f<sub>l</sub> × f<sub>m</sub> × f<sub>j</sub> × L';
            }
        }
    }
}

// Initialize the application when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Create the application instance
    new DrakeExplorer();
});