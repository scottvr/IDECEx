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
        '/js/main.js',
        '/web/js/main.js'
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
        for (const path of mainPaths) {
            try {
                await loadModuleScript(path);
                return true; // Success
            } catch (error) {
                console.warn(`Failed to load: ${path}`);
            }
        }
        return false; // All paths failed
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