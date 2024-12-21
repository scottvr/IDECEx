// main.js
import { DrakeCalculator } from './calculator/DrakeCalculator.js';
import { TraceManager } from './traces/TraceManager.js';
import { UIManager } from './ui/UIManager.js';
import { VisualizationManager } from './visualizations/VisualizationManager.js';


// When switching models
vizManager.setModel(newModel);

document.addEventListener("DOMContentLoaded", () => {
    // Initialize core components
    const calculator = new DrakeCalculator();
    const traceManager = new TraceManager();
    const uiManager = new UIManager(calculator, traceManager);
    const vizManager = new VisualizationManager();
    
    // Initialize model switcher if needed
    if (document.getElementById('equation-model')) {
        new ModelSwitcher(calculator, uiManager);
    }
});