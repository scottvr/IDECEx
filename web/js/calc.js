import { 
    createOrUpdateComparativeBarChart, 
    createOrUpdateVariableRelationshipGraph,
    createOrUpdateProbabilityDistributionCurve,
    createOrUpdateGalaxyDensityHeatmap,
    clearAllCharts
} from './visualizations.js';

document.addEventListener("DOMContentLoaded", function () {
    // A single list containing all possible variables for both models
    const allVariables = [
        "R_star", "f_p", "n_e", "f_l", "f_i", "f_c", "L", "N",
        "f_g", "f_pm", "f_jm", "f_me", "f_ac"
    ];
    const inputs = {};
    const locks = {};
    const divs = {};
    let currentSolveFor = "N";
    
    // Setup references to all DOM elements
    allVariables.forEach(variable => {
        inputs[variable] = document.getElementById(`${variable}_input`);
        locks[variable] = document.getElementById(`${variable}_lock`);
        divs[variable] = document.getElementById(`${variable}_div`);
        if (inputs[variable]) {
            inputs[variable].addEventListener("input", calculate);
        }
        if (locks[variable]) {
            locks[variable].addEventListener("change", updateLockToolTip);
        }
    });

    const solveForSelect = document.getElementById("solve-for-select");
    const traceSelect = document.getElementById('trace-select');

    // --- Event Listeners ---
    solveForSelect.addEventListener("change", updateSolveForVariable);
    document.getElementById('reset-button').addEventListener('click', resetToDefaults);
    document.getElementById('randomize-button').addEventListener('click', randomizeUnlocked);
    document.getElementById('new-trace-button').addEventListener('click', startNewTrace);
    document.getElementById('clear-trace-button').addEventListener('click', clearCurrentTrace);
    traceSelect.addEventListener('change', (e) => switchTrace(parseInt(e.target.value)));
    
    // MODEL SWITCHER LOGIC
    document.querySelectorAll('input[name="equation-model"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const isRareEarth = this.value === 'rare-earth';
            document.querySelectorAll('.rare-earth-factor').forEach(el => {
                el.style.display = isRareEarth ? 'flex' : 'none';
            });
            // Make rare earth options visible/hidden in the dropdown
            document.querySelectorAll('#solve-for-select option').forEach(opt => {
                if (["f_g", "f_pm", "f_jm", "f_me", "f_ac"].includes(opt.value)) {
                    opt.style.display = isRareEarth ? 'block' : 'none';
                }
            });
            // If the currently solved-for variable is now hidden, switch back to 'N'
            if (!getActiveVariables().includes(currentSolveFor)) {
                solveForSelect.value = "N";
                updateSolveForVariable();
            }
            calculate();
        });
    });

    // --- State Management ---
    let calculationHistory = {
        traces: [],
        currentTraceIndex: -1
    };
    const maxTraces = 5;

    // --- Core Functions ---
    function calculate() {
        const values = {};
        let isValid = true;
        const activeVariables = getActiveVariables();

        activeVariables.forEach(variable => {
            if (variable !== currentSolveFor && inputs[variable] && !inputs[variable].readOnly) {
                let value;
                // LOGARITHMIC SLIDER: Special handling for L
                if (variable === 'L') {
                    const logValue = parseFloat(inputs.L.value);
                    value = Math.pow(10, logValue);
                    document.getElementById('L_display').textContent = `${value.toExponential(1)} years`;
                } else {
                    value = parseFloat(inputs[variable].value);
                }

                if (!isNaN(value) && validateInput(variable, value)) {
                    values[variable] = value;
                } else {
                    isValid = false;
                    showMessage(`Invalid input for ${variable}.`, true);
                }
            }
        });

        if (isValid) {
            // Provide the value of N if it's not being solved for
            if (currentSolveFor !== 'N') {
                values.N = parseFloat(inputs.N.value);
            }

            const result = solveEquation(currentSolveFor, values, activeVariables);
            
            // LOGARITHMIC SLIDER: Update UI for L if it was the result
            if (currentSolveFor === 'L') {
                const resultLog = result > 0 ? Math.log10(result) : 0;
                inputs.L.value = resultLog;
                document.getElementById('L_display').textContent = `${result.toExponential(1)} years`;
            } else {
                inputs[currentSolveFor].value = result.toFixed(4);
            }
            
            // Add to history and update charts
            const calculationResult = { timestamp: Date.now(), ...values, [currentSolveFor]: result };
            addCalculationToCurrentTrace(calculationResult);
            updateVisualizations();
        }
    }

    function solveEquation(solveFor, values, activeVariables) {
        // Exclude N and the target variable from the product calculation
        const productOfOthers = activeVariables.reduce((acc, v) => {
            if (v === solveFor || v === "N" || values[v] === undefined) {
                return acc;
            }
            return acc * values[v];
        }, 1);
        
        if (solveFor === "N") {
            return productOfOthers;
        } else {
            const nValue = values.N || parseFloat(inputs.N.value); // Ensure N value is available
            if (productOfOthers === 0) {
                showMessage("Cannot solve due to division by zero. Adjust inputs.", true);
                return 0;
            }
            // For any other variable, solve N = productOfOthers * solveFor
            return nValue / productOfOthers;
        }
    }
    
    function updateSolveForVariable() {
        const previousSolveFor = currentSolveFor;
        currentSolveFor = solveForSelect.value;
        
        // Make all inputs writable first
        allVariables.forEach(v => {
            if(inputs[v]) inputs[v].readOnly = false;
            if(divs[v]) divs[v].classList.remove('result', 'input');
            if(locks[v]) locks[v].style.display = "inline-block";
        });
        
        // Now, make the new target readonly
        if (inputs[currentSolveFor]) {
            inputs[currentSolveFor].readOnly = true;
            divs[currentSolveFor].classList.add('result', 'input');
            if (locks[currentSolveFor]) {
                locks[currentSolveFor].style.display = "none";
                locks[currentSolveFor].checked = false;
            }
        }
        calculate();
    }
    
    // --- Utility and UI Functions ---
    function getActiveVariables() {
        const model = document.querySelector('input[name="equation-model"]:checked').value;
        const drakeVars = ["R_star", "f_p", "n_e", "f_l", "f_i", "f_c", "L", "N"];
        if (model === 'rare-earth') {
            return allVariables;
        }
        return drakeVars;
    }

    function resetToDefaults() {
        const defaults = {
            R_star: 1, f_p: 0.2, n_e: 1, f_l: 0.1, f_i: 0.01, f_c: 0.1, L: 1000,
            f_g: 0.1, f_pm: 0.1, f_jm: 0.5, f_me: 0.1, f_ac: 0.1
        };
        allVariables.forEach(v => {
            if(inputs[v]) {
                if (v === 'L') {
                    // Handle log slider reset
                    inputs[v].value = Math.log10(defaults[v]);
                } else if (defaults[v] !== undefined) {
                    inputs[v].value = defaults[v];
                }
                if(locks[v]) locks[v].checked = false;
            }
        });
        solveForSelect.value = "N";
        updateSolveForVariable();
        calculationHistory.traces = [];
        startNewTrace();
        clearAllCharts();
        calculate(); // Recalculate with defaults
    }

    function randomizeUnlocked() {
        getActiveVariables().forEach(variable => {
            if (variable !== currentSolveFor && locks[variable] && !locks[variable].checked) {
                const randomValue = getRandomValue(variable);
                if (variable === 'L') {
                    inputs[variable].value = Math.log10(randomValue);
                } else {
                    inputs[variable].value = randomValue;
                }
            }
        });
        calculate();
    }
    
    function updateLockToolTip() {
        this.title = this.checked ? "Unlock this value" : "Lock this value";
    }

    function showMessage(message, isError = false) {
        const messageContainer = document.getElementById("message-container");
        messageContainer.textContent = message;
        messageContainer.className = isError ? "message error" : "message success";
        setTimeout(() => { messageContainer.textContent = ''; }, 5000);
    }

    // --- Trace Management Functions ---
    function initializeTraceManagement() {
        if (calculationHistory.traces.length === 0) {
            startNewTrace();
        }
        updateTraceSelector();
    }

    function startNewTrace() {
        if (calculationHistory.traces.length >= maxTraces) {
            showMessage("Maximum number of traces reached.", true);
            return;
        }
        const newTraceId = calculationHistory.traces.length + 1;
        calculationHistory.traces.push({ id: newTraceId, name: `Trace ${newTraceId}`, calculations: [] });
        calculationHistory.currentTraceIndex = calculationHistory.traces.length - 1;
        updateTraceSelector();
        clearAllCharts();
    }

    function clearCurrentTrace() {
        if (calculationHistory.currentTraceIndex !== -1) {
            calculationHistory.traces[calculationHistory.currentTraceIndex].calculations = [];
            clearAllCharts();
        }
    }

    function switchTrace(index) {
        if (index >= 0 && index < calculationHistory.traces.length) {
            calculationHistory.currentTraceIndex = index;
            clearAllCharts();
            updateVisualizations();
        }
    }

    function addCalculationToCurrentTrace(calculationResult) {
        if (calculationHistory.traces.length === 0) {
            startNewTrace();
        }
        calculationHistory.traces[calculationHistory.currentTraceIndex].calculations.push(calculationResult);
    }
    
    function updateTraceSelector() {
        traceSelect.innerHTML = '';
        calculationHistory.traces.forEach((trace, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = trace.name;
            traceSelect.appendChild(option);
        });
        traceSelect.value = calculationHistory.currentTraceIndex;
    }

    // --- Visualization Functions ---
    function updateVisualizations() {
        const currentTrace = calculationHistory.traces[calculationHistory.currentTraceIndex];
        if (!currentTrace || currentTrace.calculations.length === 0) {
            clearAllCharts();
            return;
        }
        createOrUpdateComparativeBarChart(processDataForBarChart(currentTrace));
        createOrUpdateVariableRelationshipGraph(processDataForRelationshipGraph(currentTrace));
        createOrUpdateProbabilityDistributionCurve(processDataForDistributionCurve(currentTrace));
        createOrUpdateGalaxyDensityHeatmap(processDataForHeatmap(currentTrace));
    }

    // --- Initial Load ---
    initializeTraceManagement();
    document.querySelector('input[name="equation-model"][value="drake"]').dispatchEvent(new Event('change')); // Set initial UI state
    updateSolveForVariable();
});


// Data processing functions (assuming these are defined globally or exported/imported correctly)
// These remain largely the same, but ensure they can handle missing values if a trace switches models.
function processDataForBarChart(trace) {
    const latestResult = trace.calculations[trace.calculations.length - 1] || {};
    return {
        labels: Object.keys(latestResult).filter(key => key !== 'timestamp'),
        values: Object.values(latestResult).filter((_, index) => Object.keys(latestResult)[index] !== 'timestamp')
    };
}

function processDataForRelationshipGraph(trace) {
    return {
        xValues: trace.calculations.map(calc => calc.f_p || 0),
        yValues: trace.calculations.map(calc => calc.N || 0),
        xLabel: 'fp (Fraction of Stars with Planets)',
        yLabel: 'N (Number of detectable civilizations)'
    };
}

function processDataForDistributionCurve(trace) {
    const nValues = trace.calculations.map(calc => calc.N).filter(n => n !== undefined);
    if (nValues.length < 2) return { xValues: [], yValues: [] }; // Not enough data
    // This function can remain the same
    const min = Math.min(...nValues);
    const max = Math.max(...nValues);
    if (min === max) return { xValues: [min], yValues: [nValues.length]};
    const range = max - min;
    const bucketSize = range / 10 || 1; 

    const distribution = Array(10).fill(0);
    const labels = Array(10).fill(0);
    nValues.forEach(n => {
        const bucketIndex = Math.min(Math.floor((n - min) / bucketSize), 9);
        distribution[bucketIndex]++;
    });
    labels.forEach((_, i) => labels[i] = (min + (i + 0.5) * bucketSize).toExponential(1));

    return {
        xValues: labels,
        yValues: distribution,
        label: 'Distribution of N',
        xLabel: 'N (Number of detectable civilizations)'
    };
}

function processDataForHeatmap(trace) {
    const gridSize = 10;
    const heatmapData = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
    trace.calculations.forEach(calc => {
        if (calc.f_i !== undefined && calc.f_c !== undefined) {
            const xIndex = Math.min(Math.floor(calc.f_i * gridSize), gridSize - 1);
            const yIndex = Math.min(Math.floor(calc.f_c * gridSize), gridSize - 1);
            heatmapData[yIndex][xIndex]++;
        }
    });
    return { densityValues: heatmapData };
}

function getRandomValue(variable) {
    const ranges = {
        R_star: [0.5, 5], f_p: [0.1, 1], n_e: [0.1, 5], f_l: [0.01, 1],
        f_i: [0.001, 1], f_c: [0.01, 1], L: [100, 100000000],
        f_g: [0.05, 0.2], f_pm: [0.05, 0.2], f_jm: [0.1, 0.8],
        f_me: [0.01, 0.5], f_ac: [0.01, 0.5]
    };
    const [min, max] = ranges[variable] || [0, 1];
    return (Math.random() * (max - min) + min).toFixed(4);
}

// Debounce function (if needed for performance, currently not used in favor of direct calculation)
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