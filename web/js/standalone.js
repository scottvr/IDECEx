/**
 * Standalone version of essential Drake Equation Explorer components
 * This is used as a fallback when ES modules don't work.
 */

// DrakeCalculator implementation
class DrakeCalculator {
    constructor(model = 'classic') {
        this.model = model;
        this.variables = this.getVariables();
        this.defaultValues = this.getDefaultValues();
    }
  
    getVariables() {
        const classicVariables = [
            'R_star', 'f_p', 'n_e', 'f_l', 'f_i', 'f_c', 'L', 'N'
        ];
  
        const rareEarthVariables = [
            'R_star', 'f_p', 'f_pm', 'n_e', 'f_g', 'f_t', 
            'f_i', 'f_c', 'f_l', 'f_m', 'f_j', 'L', 'N'
        ];
  
        return this.model === 'classic' ? classicVariables : rareEarthVariables;
    }
  
    getDefaultValues() {
        const classicDefaults = {
            R_star: 1,
            f_p: 0.2,
            n_e: 1,
            f_l: 0.1,
            f_i: 0.01,
            f_c: 0.1,
            L: 1000
        };
  
        const rareEarthDefaults = {
            ...classicDefaults,
            f_pm: 0.4,  // Metal-rich composition
            f_g: 0.1,   // Galactic habitable zone
            f_t: 0.3,   // Temperature stability
            f_m: 0.1,   // Large moon
            f_j: 0.05   // Jupiter protection
        };
  
        return this.model === 'classic' ? classicDefaults : rareEarthDefaults;
    }
    
    getCurrentModel() {
        return this.model;
    }
    
    setModel(model) {
        if (model !== this.model) {
            this.model = model;
            this.variables = this.getVariables();
            this.defaultValues = this.getDefaultValues();
            return true;
        }
        return false;
    }
  
    validateInput(variable, value) {
        const ranges = {
            R_star: [0, Infinity],
            f_p: [0, 1],
            f_pm: [0, 1],
            n_e: [0, Infinity],
            f_g: [0, 1],
            f_t: [0, 1],
            f_l: [0, 1],
            f_i: [0, 1],
            f_c: [0, 1],
            f_m: [0, 1],
            f_j: [0, 1],
            L: [0, Infinity],
            N: [0, Infinity]
        };
  
        const [min, max] = ranges[variable] || [0, Infinity];
        return value >= min && value <= max;
    }
  
    calculate(solveFor, values) {
        // Get all variables except N and solveFor
        const variables = this.getVariables().filter(v => v !== 'N' && v !== solveFor);
        
        // Calculate product of all other variables
        const product = variables.reduce((acc, variable) => {
            // Use provided value or default
            return acc * (values[variable] || this.defaultValues[variable] || 0);
        }, 1);
  
        let result;
        if (solveFor === 'N') {
            result = product;
        } else {
            result = product === 0 ? 0 : (values.N || 0) / product;
        }
        
        // Create a complete result object with all variables
        const resultObj = { 
            ...this.defaultValues,  // Start with defaults
            ...values,              // Override with provided values
            [solveFor]: result,     // Add calculated result
            timestamp: Date.now()
        };
        
        return resultObj;
    }
  
    getRandomValue(variable) {
        const ranges = {
            R_star: [1, 10],
            f_p: [0.1, 1],
            f_pm: [0.1, 1],
            n_e: [0.1, 5],
            f_g: [0.01, 1],
            f_t: [0.1, 1],
            f_l: [0.01, 1],
            f_i: [0.01, 1],
            f_c: [0.01, 1],
            f_m: [0.01, 1],
            f_j: [0.01, 1],
            L: [100, 10000],
            N: [1, 1000000]
        };
  
        const [min, max] = ranges[variable] || [0, 1];
        return (Math.random() * (max - min) + min).toFixed(4);
    }
}

// Simple TraceManager implementation
class TraceManager {
    constructor() {
        this.traces = [{
            id: 1,
            name: "Trace 1",
            calculations: []
        }];
        this.currentTraceIndex = 0;
    }
    
    addCalculation(calculationResult) {
        if (!calculationResult.timestamp) {
            calculationResult.timestamp = Date.now();
        }
        this.traces[this.currentTraceIndex].calculations.push(calculationResult);
        return calculationResult;
    }
    
    getCurrentTrace() {
        return this.traces[this.currentTraceIndex];
    }
}

// Simple data processing functions
const dataProcessor = {
    processDataForBarChart: function(trace) {
        if (!trace || !trace.calculations || trace.calculations.length === 0) {
            return { labels: [], values: [] };
        }
        
        const latestResult = trace.calculations[trace.calculations.length - 1];
        const validKeys = Object.keys(latestResult).filter(key => 
            key !== 'timestamp' && key !== 'id' && !key.startsWith('_')
        );
        
        return {
            labels: validKeys,
            values: validKeys.map(key => latestResult[key])
        };
    },
    
    normalizeValues: function(values) {
        const validValues = values.filter(v => isFinite(v) && v !== null);
        if (validValues.length === 0) return values.map(() => 0);
        
        const max = Math.max(...validValues);
        const min = Math.min(...validValues);
        
        if (max === min) {
            return values.map(v => (isFinite(v) && v !== null) ? 1 : 0);
        }
        
        return values.map(v => {
            if (!isFinite(v) || v === null) return 0;
            return (v - min) / (max - min);
        });
    }
};

// Initialize when ready
document.addEventListener('DOMContentLoaded', () => {
    // If main application has already loaded, don't initialize standalone
    if (window.drakeExplorer) {
        return;
    }
    
    console.log("Initializing standalone mode");
    
    // Create core objects
    const calculator = new DrakeCalculator();
    const traceManager = new TraceManager();
    
    // Initialize UI event handlers
    const variables = calculator.getVariables();
    let currentSolveFor = "N";
    
    // Set up variable input handlers
    variables.forEach(variable => {
        const input = document.getElementById(`${variable}_input`);
        const lock = document.getElementById(`${variable}_lock`);
        
        if (input) {
            input.addEventListener("input", handleCalculation);
        }
        
        if (lock) {
            lock.addEventListener("change", () => {
                if (lock.checked) {
                    lock.title = "Unlock this value";
                } else {
                    lock.title = "Lock this value";
                }
            });
        }
    });
    
    // Set up solve-for selector
    const solveForSelect = document.getElementById("solve-for-select");
    if (solveForSelect) {
        // Populate the options
        solveForSelect.innerHTML = ''; // Clear existing options
        calculator.getVariables().forEach(variable => {
            const option = document.createElement('option');
            option.value = variable;
            option.textContent = variable === 'R_star' ? 'R* (Star Formation Rate)' :
                               variable === 'f_p' ? 'f_p (Fraction of Stars with Planets)' :
                               variable === 'n_e' ? 'n_e (Habitable Planets per Star)' :
                               variable === 'f_l' ? 'f_l (Fraction with Life)' :
                               variable === 'f_i' ? 'f_i (Fraction with Intelligence)' :
                               variable === 'f_c' ? 'f_c (Fraction that Communicate)' :
                               variable === 'L' ? 'L (Lifetime of Civilizations)' :
                               variable === 'N' ? 'N (Number of Civilizations)' :
                               variable === 'f_pm' ? 'f_pm (Metal-rich Planets)' :
                               variable === 'f_g' ? 'f_g (Galactic Habitable Zone)' :
                               variable === 'f_t' ? 'f_t (Temperature Stability)' :
                               variable === 'f_m' ? 'f_m (Large Moon)' :
                               variable === 'f_j' ? 'f_j (Jupiter Protection)' : variable;
            solveForSelect.appendChild(option);
        });
        
        // Set initial value
        solveForSelect.value = currentSolveFor;
        
        // Add event listener
        solveForSelect.addEventListener("change", function() {
            const previousSolveFor = currentSolveFor;
            currentSolveFor = this.value;
            
            // Update UI for previous solve-for
            updateVariableUI(previousSolveFor, false);
            
            // Update UI for new solve-for
            updateVariableUI(currentSolveFor, true);
            
            // Recalculate
            handleCalculation();
        });
    }
    
    // Set up buttons
    const resetButton = document.getElementById('reset-button');
    if (resetButton) {
        resetButton.addEventListener('click', resetToDefaults);
    }
    
    const randomizeButton = document.getElementById('randomize-button');
    if (randomizeButton) {
        randomizeButton.addEventListener('click', randomizeUnlocked);
    }
    
    // UI helper functions
    function updateVariableUI(variable, isSolveFor) {
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
    
    function getInputValues() {
        const values = {};
        calculator.getVariables().forEach(variable => {
            if (variable !== currentSolveFor) {
                const input = document.getElementById(`${variable}_input`);
                if (input && !input.readOnly) {
                    values[variable] = parseFloat(input.value) || 0;
                }
            }
        });
        return values;
    }
    
    function handleCalculation() {
        const values = getInputValues();
        const result = calculator.calculate(currentSolveFor, values);
        
        // Update result display
        const resultInput = document.getElementById(`${currentSolveFor}_input`);
        if (resultInput) {
            resultInput.value = result[currentSolveFor].toFixed(4);
        }
        
        // Add to trace
        traceManager.addCalculation(result);
        
        // Update charts if available
        updateCharts();
    }
    
    function resetToDefaults() {
        const defaults = calculator.getDefaultValues();
        calculator.getVariables().forEach(variable => {
            const input = document.getElementById(`${variable}_input`);
            const lock = document.getElementById(`${variable}_lock`);
            
            if (input && defaults[variable]) {
                input.value = defaults[variable];
            }
            
            if (lock) {
                lock.checked = false;
            }
        });
        
        handleCalculation();
    }
    
    function randomizeUnlocked() {
        calculator.getVariables().forEach(variable => {
            if (variable !== currentSolveFor) {
                const input = document.getElementById(`${variable}_input`);
                const lock = document.getElementById(`${variable}_lock`);
                
                if (input && lock && !lock.checked) {
                    input.value = calculator.getRandomValue(variable);
                }
            }
        });
        
        handleCalculation();
    }
    
    function updateCharts() {
        try {
            // If chart libraries are available, create basic visualizations
            if (window.Chart) {
                const trace = traceManager.getCurrentTrace();
                const barData = dataProcessor.processDataForBarChart(trace);
                
                const ctx = document.getElementById('comparativeBarChart');
                if (ctx) {
                    new Chart(ctx.getContext('2d'), {
                        type: 'bar',
                        data: {
                            labels: barData.labels,
                            datasets: [{
                                label: 'Variable Values',
                                data: dataProcessor.normalizeValues(barData.values),
                                backgroundColor: 'rgba(75, 192, 192, 0.6)'
                            }]
                        },
                        options: {
                            responsive: true,
                            scales: {
                                y: {
                                    beginAtZero: true
                                }
                            },
                            plugins: {
                                tooltip: {
                                    callbacks: {
                                        label: (context) => `Original value: ${barData.values[context.dataIndex]}`
                                    }
                                }
                            }
                        }
                    });
                }
            }
        } catch (e) {
            console.warn('Failed to update charts:', e);
        }
    }
    
    // Perform initial calculation
    handleCalculation();
    
    // Expose to window for debugging
    window.standaloneApp = {
        calculator,
        traceManager,
        handleCalculation
    };
});