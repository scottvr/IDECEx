
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
      const variables = this.getVariables().filter(v => v !== 'N' && v !== solveFor);
      const product = variables.reduce((acc, variable) => {
        return acc * (values[variable] || this.defaultValues[variable] || 0);
      }, 1);
  
      if (solveFor === 'N') {
        return product;
      } else {
        return product === 0 ? 0 : (values.N || 0) / product;
      }
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
  
  export default DrakeCalculator;

document.addEventListener("DOMContentLoaded", function () {
    const variables = ["R_star", "f_p", "n_e", "f_l", "f_i", "f_c", "L", "N"];
    const inputs = {};
    const locks = {};
    const divs = {};
    let currentSolveFor = "N"; // Initial solve-for variable
    const debouncedCalculate = debounce(calculate, 300);
    
    variables.forEach(variable => {
        inputs[variable] = document.getElementById(`${variable}_input`);
        locks[variable] = document.getElementById(`${variable}_lock`);
        divs[variable] = document.getElementById(`${variable}_div`);
        // inputs[variable].addEventListener("input", debouncedCalculate);
        inputs[variable].addEventListener("input", calculate);
        if (locks[variable]) {
            // locks[variable].addEventListener("change", debouncedCalculate);
            locks[variable].addEventListener("change", updateLockToolTip);
        }
    });

    // Populate solve-for dropdown
    const solveForSelect = document.getElementById("solve-for-select");
    variables.forEach(variable => {
        const option = document.createElement("option");
        option.value = variable;
        option.textContent = variable;
        solveForSelect.appendChild(option);
    });
    
    solveForSelect.value = currentSolveFor; // Set initial value
    solveForSelect.addEventListener("change", updateSolveForVariable);

    document.getElementById('reset-button').addEventListener('click', resetToDefaults);
    document.getElementById('randomize-button').addEventListener('click', randomizeUnlocked);

    document.getElementById('new-trace-button').addEventListener('click', startNewTrace);
    document.getElementById('clear-trace-button').addEventListener('click', clearCurrentTrace);
    document.getElementById('rename-trace-button').addEventListener('click', renameCurrentTrace);

    const traceSelect = document.getElementById('trace-select');
    traceSelect.addEventListener('change', (e) => switchTrace(parseInt(e.target.value)));


    function updateLockToolTip() {
        if (this.checked) {
          this.title = "Unlock this value";
        } else {
          this.title = "Lock this value";
        }  
    }

    function updateSolveForVariable() {
        const previousSolveFor = currentSolveFor;
        currentSolveFor = solveForSelect.value;
        
        // Update UI for previous solve-for variable
        divs[previousSolveFor].className = 'variable-group';
        inputs[previousSolveFor].readOnly = false;
        if (locks[previousSolveFor]) {
            locks[previousSolveFor].style.display = "inline";
        }

        // Update UI for new solve-for variable
        divs[currentSolveFor].className = 'variable-group result input';
        inputs[currentSolveFor].readOnly = true;
        if (locks[currentSolveFor]) {
            locks[currentSolveFor].style.display = "none";
            locks[currentSolveFor].checked = false;
        }

        calculate();
    }

    function validateInput(variable, value) {
        const ranges = {
            R_star: [0, Infinity],
            f_p: [0, 1],
            n_e: [0, Infinity],
            f_l: [0, 1],
            f_i: [0, 1],
            f_c: [0, 1],
            L: [0, Infinity],
            N: [0, Infinity]
        };
        const [min, max] = ranges[variable];
        return value >= min && value <= max;
    }

    let calculationHistory = {
       traces: [
            {
                id: 1,
                name: "Trace 1",
                calculations: [
                    {
                        timestamp: Date.now(),
                        R_star: 1,
                        f_p: 0.2,
                        n_e: 1,
                        f_l: 0.1,
                        f_i: 0.01,
                        f_c: 0.1,
                        L: 1000,
                        N: 2
                    }
                    // ... more calculations
                ]
            }
            // ... more traces
        ],
        currentTraceIndex: 0
    };

    const maxTraces = 5;

    function ensureTraceExists() {
        if (calculationHistory.traces.length === 0) {
            calculationHistory.traces.push({
                id: 1,
                name: "Trace 1",
                calculations: []
            });
            calculationHistory.currentTraceIndex = 0;
        }
    }
    
    function addCalculationToCurrentTrace(calculationResult) {
        ensureTraceExists();
        calculationHistory.traces[calculationHistory.currentTraceIndex].calculations.push(calculationResult);
    }
    
    function calculate() {
        const values = {};
        let isValid = true;
    
        variables.forEach(variable => {
            if (variable !== currentSolveFor && !inputs[variable].readOnly) {
                const value = parseFloat(inputs[variable].value) || 0;
                if (validateInput(variable, value)) {
                    values[variable] = value;
                } else {
                    isValid = false;
                    showError(`Invalid input for ${variable}. Please enter a valid value.`);
                }
            }
        });
    
        if (isValid) {
            const result = solveEquation(currentSolveFor, values);
            inputs[currentSolveFor].value = result.toFixed(4);
            
            // Capture the calculation result
            const calculationResult = { 
                timestamp: Date.now(),
                ...values, 
                [currentSolveFor]: result 
            };
            addCalculationToCurrentTrace(calculationResult);
            
            // Update visualizations
            updateVisualizations();
        }
    }
    
    function randomizeUnlocked() {
        variables.forEach(variable => {
            if (variable !== currentSolveFor && !locks[variable].checked) {
                inputs[variable].value = getRandomValue(variable);
            }
        });
        calculate();
    }
    
    function startNewTrace() {
        const newTraceId = calculationHistory.traces.length + 1;
        calculationHistory.traces.push({
            id: newTraceId,
            name: `Trace ${newTraceId}`,
            calculations: []
        });
        calculationHistory.currentTraceIndex = calculationHistory.traces.length - 1;
        updateTraceSelector();
    }
    
    function updateTraceSelector() {
        const traceSelect = document.getElementById('trace-select');
        traceSelect.innerHTML = '';
        calculationHistory.traces.forEach((trace, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = trace.name;
            traceSelect.appendChild(option);
        });
        traceSelect.value = calculationHistory.currentTraceIndex;
    }
    
    function updateVisualizations() {
        const currentTrace = calculationHistory.traces[calculationHistory.currentTraceIndex];
        
        // For single trace visualizations
        createOrUpdateComparativeBarChart(processDataForBarChart(currentTrace));
        createOrUpdateGalaxyDensityHeatmap(processDataForHeatmap(currentTrace));
        
        // For multi-trace visualizations that show comparisons
        const allTraces = calculationHistory.traces;
        createOrUpdateVariableRelationshipGraph(processDataForMultiTraceRelationshipGraph(allTraces, currentTrace));
        createOrUpdateProbabilityDistributionCurve(processDataForMultiTraceDistributionCurve(allTraces));
    }


    function calculate() {
        const values = {};
        let isValid = true;

        variables.forEach(variable => {
            if (variable !== currentSolveFor && !inputs[variable].readOnly) {
                const value = parseFloat(inputs[variable].value) || 0;
                if (validateInput(variable, value)) {
                    values[variable] = value;
                } else {
                    isValid = false;
                    showError(`Invalid input for ${variable}. Please enter a valid value.`);
                }
            }
        });
    
        if (isValid) {
            const result = solveEquation(currentSolveFor, values);
            inputs[currentSolveFor].value = result.toFixed(4);
            
            // Capture the calculation result
            const calculationResult = { 
                timestamp: Date.now(),
                ...values, 
                [currentSolveFor]: result 
            };
            calculationHistory.traces[calculationHistory.currentTraceIndex].calculations.push(calculationResult);
        
           // Update visualizations
            updateVisualizations();
        }
    }

    function solveEquation(solveFor, values) {
        const product = variables.reduce((acc, variable) => {
            return (variable === solveFor || variable === "N") ? acc : acc * values[variable];
        }, 1);

        if (solveFor === "N") {
            return product;
        } else {
            if (product === 0) {
                showError("Cannot divide by zero. Please adjust your inputs.");
                return 0;
            }
            return (values.N || 0) / product;
        }
    }

    function resetToDefaults() {
        const defaults = {
            R_star: 1, f_p: 0.2, n_e: 1, f_l: 0.1, f_i: 0.01, f_c: 0.1, L: 1000
        };
        variables.forEach(v => {
            inputs[v].value = defaults[v];
            locks[v].checked = false;
        });
        solveForSelect.value = "N";
        calculate();
        
        // Reset calculation history with proper structure
        calculationHistory = {
            traces: [{
                id: 1,
                name: "Trace 1",
                calculations: []
            }],
            currentTraceIndex: 0
        };
        
        // Add the first calculation to the trace
        const values = {};
        variables.forEach(v => {
            values[v] = parseFloat(inputs[v].value) || defaults[v] || 0;
        });
        const result = solveEquation("N", values);
        
        calculationHistory.traces[0].calculations.push({
            timestamp: Date.now(),
            ...values,
            N: result
        });
        
        updateVisualizations();
    }

    function showMessage(message, isError = false) {
        const messageContainer = document.getElementById("message-container");
        messageContainer.textContent = message;
        messageContainer.className = isError ? "error" : "success";
    }

    function randomizeUnlocked() {
        variables.forEach(variable => {
            if (variable !== currentSolveFor && !locks[variable].checked) {
                inputs[variable].value = getRandomValue(variable);
            }
        });
    calculate();
    }

    function switchTrace(index) {
        if (index >= 0 && index < calculationHistory.traces.length) {
            calculationHistory.currentTraceIndex = index;
            
            // Update UI to reflect the current trace's values
            const trace = calculationHistory.traces[index];
            
            // If the trace has calculations, load the most recent one
            if (trace.calculations && trace.calculations.length > 0) {
                const latestCalc = trace.calculations[trace.calculations.length - 1];
                
                // Update input fields with values from this calculation
                variables.forEach(variable => {
                    if (variable !== currentSolveFor && latestCalc[variable] !== undefined) {
                        inputs[variable].value = latestCalc[variable];
                    }
                });
                
                // Update the solve-for variable result
                inputs[currentSolveFor].value = latestCalc[currentSolveFor];
            }
            
            clearAllCharts();
            updateVisualizations();
            
            // Update trace selector UI to reflect current trace
            document.getElementById('trace-select').value = index;
        }
    }

    function initializeTraceManagement() {
        ensureTraceExists();
        updateTraceSelector();
    }
    
    function renameCurrentTrace() {
        const currentTrace = calculationHistory.traces[calculationHistory.currentTraceIndex];
        const newName = prompt("Enter a new name for this trace:", currentTrace.name);
        
        if (newName && newName.trim() !== "") {
            currentTrace.name = newName.trim();
            updateTraceSelector();
            showMessage(`Trace renamed to "${newName.trim()}"`, false);
        }
    }

    function clearCurrentTrace() {
        calculationHistory.traces[calculationHistory.currentTraceIndex] = {
            id: calculationHistory.traces[calculationHistory.currentTraceIndex].id,
            name: calculationHistory.traces[calculationHistory.currentTraceIndex].name,
            calculations: []
        };
        clearAllCharts();
        updateVisualizations();
    }

    // This function is already defined above - removing duplicate
    // function startNewTrace() implementation is handled by the version defined earlier

    // Initialize the interface
    initializeTraceManagement();
    updateSolveForVariable();
});



function showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

// Data processing functions for each visualization
function processDataForBarChart(trace) {
    // Handle empty traces
    if (!trace.calculations || trace.calculations.length === 0) {
        return {
            labels: [],
            values: []
        };
    }
    
    const latestResult = trace.calculations[trace.calculations.length - 1];
    return {
        labels: Object.keys(latestResult).filter(key => key !== 'timestamp'),
        values: Object.values(latestResult).filter((_, index) => Object.keys(latestResult)[index] !== 'timestamp')
    };
}

function processDataForRelationshipGraph(trace) {
    // Handle empty traces
    if (!trace.calculations || trace.calculations.length === 0) {
        return {
            xValues: [],
            yValues: [],
            xLabel: 'R* (Rate of star formation)',
            yLabel: 'N (Number of detectable civilizations)'
        };
    }
    
    // Let's create a graph showing the relationship between R* and N
    return {
        xValues: trace.calculations.map(calc => calc.R_star),
        yValues: trace.calculations.map(calc => calc.N),
        xLabel: 'R* (Rate of star formation)',
        yLabel: 'N (Number of detectable civilizations)'
    };
}

function processDataForMultiTraceRelationshipGraph(traces, currentTrace) {
    // Create a dataset for each trace
    const datasets = [];
    
    traces.forEach((trace, index) => {
        if (!trace.calculations || trace.calculations.length === 0) return;
        
        // Check if this is the current trace
        const isCurrent = trace.id === currentTrace.id;
        
        datasets.push({
            x: trace.calculations.map(calc => calc.R_star),
            y: trace.calculations.map(calc => calc.N),
            name: trace.name,
            mode: 'markers',
            marker: {
                size: isCurrent ? 10 : 8,
                opacity: isCurrent ? 1 : 0.6,
                // Use different colors for different traces
                color: getTraceColor(index)
            },
            type: 'scatter'
        });
    });
    
    return {
        datasets: datasets,
        xLabel: 'R* (Rate of star formation)',
        yLabel: 'N (Number of detectable civilizations)'
    };
}

function processDataForDistributionCurve(trace) {
    // Handle empty traces
    if (!trace.calculations || trace.calculations.length === 0) {
        return {
            xValues: [],
            yValues: [],
            label: 'Distribution of N',
            xLabel: 'N (Number of detectable civilizations)'
        };
    }
    
    // Let's create a distribution of N values
    const nValues = trace.calculations.map(calc => calc.N);
    
    // Handle cases with only one or no values
    if (nValues.length <= 1) {
        return {
            xValues: nValues.length ? [nValues[0]] : [],
            yValues: nValues.length ? [1] : [],
            label: 'Distribution of N',
            xLabel: 'N (Number of detectable civilizations)'
        };
    }
    
    const min = Math.min(...nValues);
    const max = Math.max(...nValues);
    const range = max - min;
    // Avoid division by zero
    const bucketSize = range > 0 ? range / 10 : 1;

    const distribution = Array(10).fill(0);
    nValues.forEach(n => {
        // Handle case where all values are the same
        if (range === 0) {
            distribution[0]++;
        } else {
            const bucketIndex = Math.min(Math.floor((n - min) / bucketSize), 9);
            distribution[bucketIndex]++;
        }
    });

    return {
        xValues: Array(10).fill(0).map((_, i) => min + (i + 0.5) * bucketSize),
        yValues: distribution,
        label: 'Distribution of N',
        xLabel: 'N (Number of detectable civilizations)'
    };
}

function processDataForMultiTraceDistributionCurve(traces) {
    // Create datasets for each trace
    const datasets = [];
    
    traces.forEach((trace, index) => {
        if (!trace.calculations || trace.calculations.length === 0) return;
        
        const nValues = trace.calculations.map(calc => calc.N);
        
        // Skip traces with no valid N values
        if (nValues.length === 0) return;
        
        datasets.push({
            label: trace.name,
            data: nValues,
            borderColor: getTraceColor(index),
            borderWidth: 2,
            fill: false,
            tension: 0.1
        });
    });
    
    return {
        datasets: datasets,
        xLabel: 'Calculation Index',
        yLabel: 'N (Number of detectable civilizations)'
    };
}

function processDataForHeatmap(trace) {
    // Handle empty traces
    if (!trace.calculations || trace.calculations.length === 0) {
        return {
            densityValues: Array(10).fill().map(() => Array(10).fill(0))
        };
    }
    
    // Let's create a heatmap showing the relationship between f_i and f_c
    const gridSize = 10;
    const heatmapData = Array(gridSize).fill().map(() => Array(gridSize).fill(0));

    trace.calculations.forEach(calc => {
        const xIndex = Math.min(Math.floor(calc.f_i * gridSize), gridSize - 1);
        const yIndex = Math.min(Math.floor(calc.f_c * gridSize), gridSize - 1);
        heatmapData[yIndex][xIndex]++;
    });

    return {
        densityValues: heatmapData
    };
}

// Helper function to get a consistent color for a trace based on its index
function getTraceColor(index) {
    const colors = [
        'rgb(75, 192, 192)',   // Teal
        'rgb(255, 99, 132)',   // Red
        'rgb(54, 162, 235)',   // Blue
        'rgb(255, 206, 86)',   // Yellow
        'rgb(153, 102, 255)'   // Purple
    ];
    return colors[index % colors.length];
}

function getRandomValue(variable) {
    // Define reasonable ranges for each variable
    const ranges = {
        R_star: [1, 10],
        f_p: [0.1, 1],
        n_e: [0.1, 5],
        f_l: [0.01, 1],
        f_i: [0.01, 1],
        f_c: [0.01, 1],
        L: [100, 10000],
        N: [1, 1000000]
    };
    const [min, max] = ranges[variable];
    return (Math.random() * (max - min) + min).toFixed(4);
}

