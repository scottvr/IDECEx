/**
 * Simplified initialization script - uses standalone implementations
 * To enable debug mode: Add ?debug=true to the URL
 */

// Enable debug mode with URL parameter
const urlParams = new URLSearchParams(window.location.search);
const debugMode = urlParams.get('debug') === 'true';

// Set up debug logging
if (debugMode) {
    const debugElement = document.getElementById('debug');
    if (debugElement) {
        debugElement.style.display = 'block';
        debugElement.innerHTML = '<h3>Debug Mode Enabled</h3>';
    }
    
    // Intercept console logs to display in UI
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    function addLogToDebug(type, ...args) {
        if (!debugElement) return;
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.innerHTML = `<span class="log-type">${type}</span>: ${args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ')}`;
        
        debugElement.appendChild(logEntry);
        debugElement.scrollTop = debugElement.scrollHeight;
    }
    
    console.log = function(...args) {
        originalConsoleLog.apply(console, args);
        addLogToDebug('log', ...args);
    };
    
    console.error = function(...args) {
        originalConsoleError.apply(console, args);
        addLogToDebug('error', ...args);
    };
    
    console.warn = function(...args) {
        originalConsoleWarn.apply(console, args);
        addLogToDebug('warn', ...args);
    };
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing standalone application...');
    
    // Create and initialize the standalone application
    try {
        // Create the main application components using standalone implementation
        console.log("Creating application objects...");
        
        // Create the calculator
        const calculator = new DrakeCalculator();
        
        // Create trace manager
        const traceManager = new TraceManager();
        
        // Create visualization manager
        let vizManager = null;
        if (window.VisualizationManager) {
            console.log("Creating visualization manager...");
            vizManager = new window.VisualizationManager();
        }
        
        // Create global drakeExplorer object for React components to use
        window.drakeExplorer = {
            calculator,
            traceManager,
            vizManager,
            
            // Method for model toggle component
            handleModelChange: function(model) {
                console.log('Model changed to:', model);
                
                if (this.calculator && this.calculator.setModel) {
                    this.calculator.setModel(model);
                }
                
                if (this.vizManager && this.vizManager.setModel) {
                    this.vizManager.setModel(model);
                }
                
                // Update equation display
                const equationDisplay = document.getElementById('equation-display');
                if (equationDisplay) {
                    if (model === 'classic') {
                        equationDisplay.innerHTML = 'N = R<sub>*</sub> × f<sub>p</sub> × n<sub>e</sub> × f<sub>l</sub> × f<sub>i</sub> × f<sub>c</sub> × L';
                    } else {
                        equationDisplay.innerHTML = 'N = R<sub>*</sub> × f<sub>p</sub> × f<sub>pm</sub> × n<sub>e</sub> × f<sub>g</sub> × f<sub>t</sub> × f<sub>i</sub> × f<sub>c</sub> × f<sub>l</sub> × f<sub>m</sub> × f<sub>j</sub> × L';
                    }
                }
            }
        };
        
        console.log("Application objects created successfully");
    } catch (error) {
        console.error("Error creating application:", error);
    }
});