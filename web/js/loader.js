/**
 * Fallback loader script to handle module loading issues
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
    console.log('Fallback loader starting...');
    
    // Define loader paths to try in order
    const mainPaths = [
        './js/main.js',
        '../js/main.js',
        'js/main.js'
    ];
    
    // Create script element for Babel-transpiled module
    function loadModuleScript(path) {
        return new Promise((resolve, reject) => {
            // Check if Babel is available
            if (typeof Babel === 'undefined') {
                console.error('Babel is not loaded. Cannot transpile modules.');
                reject(new Error('Babel not available'));
                return;
            }
            
            // Fetch the module file content
            fetch(path)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to fetch ${path}: ${response.status} ${response.statusText}`);
                    }
                    return response.text();
                })
                .then(code => {
                    // Transpile with Babel
                    console.log(`Transpiling module ${path}...`);
                    const transformed = Babel.transform(code, {
                        presets: ['react', 'es2015'],
                        plugins: ['transform-modules-systemjs'],
                        sourceType: 'module'
                    }).code;
                    
                    // Create script element
                    const script = document.createElement('script');
                    script.type = 'text/javascript';
                    script.textContent = transformed;
                    
                    // Add to document
                    document.head.appendChild(script);
                    console.log(`Successfully loaded and transpiled: ${path}`);
                    resolve();
                })
                .catch(error => {
                    console.warn(`Failed to load or transpile ${path}:`, error);
                    reject(error);
                });
        });
    }
    
    // Try loading each path in order
    async function tryLoading() {
        // First try to load as ES modules
        for (const path of mainPaths) {
            try {
                await loadModuleScript(path);
                return true; // Success
            } catch (error) {
                console.warn(`Failed to load module: ${path}`, error);
            }
        }
        
        // If ES modules fail, try direct script loading with individual components
        console.log("ES Module loading failed, trying direct script loading...");
        
        const componentPaths = [
            './js/calculator/DrakeCalculator.js',
            './js/traces/TraceManager.js',
            './js/data/DataProcessor.js',
            './js/ui/UIManager.js',
            './js/utils/ChartUtils.js',
            './js/visualizations/charts/BaseChart.js',
            './js/visualizations/charts/BarChart.js',
            './js/visualizations/charts/RelationshipGraph.js',
            './js/visualizations/charts/DistributionCurve.js',
            './js/visualizations/charts/HeatmapChart.js',
            './js/visualizations/VisualizationManager.js',
        ];
        
        try {
            // Load each component script directly
            for (const path of componentPaths) {
                try {
                    await loadScript(path);
                    console.log(`Loaded script: ${path}`);
                } catch (err) {
                    console.warn(`Failed to load script: ${path}`, err);
                }
            }
            
            // Create a simplified starter script
            console.log("Creating fallback starter...");
            const starterScript = document.createElement('script');
            starterScript.textContent = `
                // Create simplified fallback objects
                try {
                    console.log("Initializing fallback components...");
                    window.drake = {
                        calculator: window.DrakeCalculator ? new window.DrakeCalculator() : {},
                        traceManager: window.TraceManager ? new window.TraceManager() : { addCalculation: () => {} },
                        uiManager: {}
                    };
                    console.log("Fallback components created");
                } catch (e) {
                    console.error("Error initializing fallback components:", e);
                }
            `;
            document.head.appendChild(starterScript);
            return true;
        } catch (error) {
            console.error("Fallback script loading failed:", error);
            return false;
        }
    }
    
    // Simple script loader
    function loadScript(path) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = path;
            script.onload = () => {
                console.log(`Successfully loaded script: ${path}`);
                resolve();
            };
            script.onerror = (error) => {
                console.warn(`Failed to load script: ${path}`, error);
                reject(error);
            };
            document.head.appendChild(script);
        });
    }
    
    // Start loading
    tryLoading().then(success => {
        if (!success) {
            console.error('All module loading attempts failed');
            document.getElementById('message-container').textContent = 
                'Failed to load application. Please check the console for errors.';
        }
    });
});