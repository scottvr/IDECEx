import { 
    createOrUpdateComparativeBarChart, 
    createOrUpdateVariableRelationshipGraph,
    createOrUpdateProbabilityDistributionCurve,
    createOrUpdateGalaxyDensityHeatmap,
    clearAllCharts
} from './visualizations.js';

document.addEventListener("DOMContentLoaded", function () {
    const drakeVariables = ["R_star", "f_p", "n_e", "f_l", "f_i", "f_c", "L", "N"];
    const rareEarthVariables = ["f_g", "f_pm"];
    let allVariables = [...drakeVariables, ...rareEarthVariables];

    const inputs = {};
    const locks = {};
    const divs = {};
    let currentSolveFor = "N";
    let currentModel = "drake";

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
    const modelSwitches = document.querySelectorAll('input[name="equation-model"]');
    const rareEarthFactorsDiv = document.querySelector('.rare-earth-factors');

    // Event Listeners
    solveForSelect.addEventListener("change", updateSolveForVariable);
    document.getElementById('reset-button').addEventListener('click', resetToDefaults);
    document.getElementById('randomize-button').addEventListener('click', randomizeUnlocked);
    document.getElementById('new-trace-button').addEventListener('click', startNewTrace);
    document.getElementById('clear-trace-button').addEventListener('click', clearCurrentTrace);
    traceSelect.addEventListener('change', (e) => switchTrace(parseInt(e.target.value)));
    modelSwitches.forEach(radio => radio.addEventListener('change', switchModel));

    let calculationHistory = {
       traces: [],
       currentTraceIndex: 0
    };
    const maxTraces = 5;

    function initializeApp() {
        startNewTrace(); 
        resetToDefaults();
        updateSolveForVariable();
    }

    function updateLockToolTip() {
        this.title = this.checked ? "Unlock this value" : "Lock this value";
    }
    
    function switchModel(event) {
        currentModel = event.target.value;
        const isRareEarth = currentModel === 'rare-earth';
        rareEarthFactorsDiv.style.display = isRareEarth ? 'flex' : 'none';
        
        // Add/remove rare earth options from "Solve For" dropdown
        rareEarthVariables.forEach(variable => {
            const option = solveForSelect.querySelector(`option[value="${variable}"]`);
            if (option) {
                option.disabled = !isRareEarth;
            }
        });
        
        if (!isRareEarth && rareEarthVariables.includes(currentSolveFor)) {
            solveForSelect.value = "N";
            updateSolveForVariable();
        } else {
            calculate();
        }
    }

    function updateSolveForVariable() {
        const previousSolveFor = currentSolveFor;
        currentSolveFor = solveForSelect.value;
        
        // Update UI for all variables to reset their state
        allVariables.forEach(variable => {
            if (divs[variable]) {
                divs[variable].className = 'variable-group';
                inputs[variable].readOnly = false;
            }
            if (locks[variable]) {
                locks[variable].style.display = "inline";
            }
        });

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
            R_star: [0, Infinity], f_p: [0, 1], n_e: [0, Infinity],
            f_l: [0, 1], f_i: [0, 1], f_c: [0, 1], L: [0, Infinity],
            N: [0, Infinity], f_g: [0, 1], f_pm: [0, 1]
        };
        const [min, max] = ranges[variable];
        const valid = value >= min && value <= max;
        if (!valid) {
             showMessage(`Invalid input for ${variable}. Must be between ${min} and ${max}.`, true);
        }
        return valid;
    }

    function calculate() {
        const values = {};
        let isValid = true;
        const activeVariables = getActiveVariables();

        activeVariables.forEach(variable => {
            if (variable !== currentSolveFor) {
                const value = parseFloat(inputs[variable].value);
                if (isNaN(value) || !validateInput(variable, value)) {
                    isValid = false;
                } else {
                    values[variable] = value;
                }
            }
        });
    
        if (isValid) {
            const result = solveEquation(currentSolveFor, values);
            inputs[currentSolveFor].value = result.toFixed(4);
            
            const calculationResult = {};
            activeVariables.forEach(v => {
                calculationResult[v] = (v === currentSolveFor) ? result : values[v];
            });
            calculationResult.timestamp = Date.now();
            
            addCalculationToCurrentTrace(calculationResult);
            updateVisualizations();
        }
    }
    
    function solveEquation(solveFor, values) {
        const N_value = (solveFor === "N") ? 1 : parseFloat(inputs.N.value);
        let product = 1;
        
        getActiveVariables().forEach(v => {
            if (v !== 'N' && v !== solveFor) {
                product *= values[v];
            }
        });

        if (solveFor === "N") {
            return product;
        } else {
            if (product === 0) {
                showMessage("Calculation error: Cannot divide by zero. Adjust non-zero inputs.", true);
                return 0;
            }
            return N_value / product;
        }
    }

    function addCalculationToCurrentTrace(calculationResult) {
        const currentTrace = calculationHistory.traces[calculationHistory.currentTraceIndex];
        if(currentTrace) {
            currentTrace.calculations.push(calculationResult);
        }
    }

    function getActiveVariables() {
        let active = [...drakeVariables];
        if (currentModel === 'rare-earth') {
            active.push(...rareEarthVariables);
        }
        return active;
    }

    function resetToDefaults() {
        const defaults = {
            R_star: 1, f_p: 0.2, n_e: 1, f_l: 0.1, f_i: 0.01, f_c: 0.1, L: 1000, f_g: 0.1, f_pm: 0.1
        };
        allVariables.forEach(v => {
            if (inputs[v]) {
                inputs[v].value = defaults[v] || 0;
            }
            if(locks[v]) {
               locks[v].checked = false;
            }
        });
        
        if (solveForSelect.value !== "N") {
            solveForSelect.value = "N";
            updateSolveForVariable();
        } else {
            calculate();
        }
    }

    function randomizeUnlocked() {
        const ranges = {
            R_star: [1, 10], f_p: [0.1, 1], n_e: [0.1, 5], f_l: [0.01, 1],
            f_i: [0.01, 1], f_c: [0.01, 1], L: [100, 10000], f_g: [0.05, 0.2], f_pm: [0.05, 0.2]
        };

        getActiveVariables().forEach(variable => {
            if (variable !== currentSolveFor && !locks[variable].checked) {
                const [min, max] = ranges[variable];
                inputs[variable].value = (Math.random() * (max - min) + min).toFixed(4);
            }
        });
        calculate();
    }
    
    function startNewTrace() {
        if (calculationHistory.traces.length >= maxTraces) {
            showMessage("Maximum number of traces reached. Clear a trace to start a new one.", true);
            return;
        }
        const newTraceId = calculationHistory.traces.length + 1;
        calculationHistory.traces.push({
            id: newTraceId,
            name: `Trace ${newTraceId}`,
            calculations: []
        });
        calculationHistory.currentTraceIndex = calculationHistory.traces.length - 1;
        updateTraceSelector();
        clearAllCharts();
        calculate();
    }
    
    function clearCurrentTrace() {
        const currentTrace = calculationHistory.traces[calculationHistory.currentTraceIndex];
        if(currentTrace) {
            currentTrace.calculations = [];
            clearAllCharts();
            // Add a single calculation to restart the trace visually
            calculate();
        }
    }
    
    function switchTrace(index) {
        if (index >= 0 && index < calculationHistory.traces.length) {
            calculationHistory.currentTraceIndex = index;
            clearAllCharts();
            updateVisualizations();
        }
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
    
    function updateVisualizations() {
        const currentTrace = calculationHistory.traces[calculationHistory.currentTraceIndex];
        if (!currentTrace || currentTrace.calculations.length === 0) {
            clearAllCharts();
            return;
        };
       
        createOrUpdateComparativeBarChart(processDataForBarChart(currentTrace));
        createOrUpdateVariableRelationshipGraph(processDataForRelationshipGraph(currentTrace));
        createOrUpdateProbabilityDistributionCurve(processDataForDistributionCurve(currentTrace));
        createOrUpdateGalaxyDensityHeatmap(processDataForHeatmap(currentTrace));
    }
    
    function showMessage(message, isError = false) {
        const messageContainer = document.getElementById("message-container");
        messageContainer.textContent = message;
        messageContainer.className = isError ? "error" : "success";
        setTimeout(() => { messageContainer.textContent = ''; }, 5000);
    }
    
    // Data processing functions for visualizations
    function processDataForBarChart(trace) {
        const latestResult = trace.calculations[trace.calculations.length - 1];
        const activeVariables = getActiveVariables();
        const labels = activeVariables.filter(key => key !== 'timestamp' && latestResult.hasOwnProperty(key));
        const values = labels.map(key => latestResult[key]);
        return { labels, values };
    }

    function processDataForRelationshipGraph(trace) {
        return {
            xValues: trace.calculations.map(calc => calc.R_star),
            yValues: trace.calculations.map(calc => calc.N),
            xLabel: 'R* (Rate of star formation)',
            yLabel: 'N (Number of detectable civilizations)'
        };
    }

    function processDataForDistributionCurve(trace) {
        const nValues = trace.calculations.map(calc => calc.N).filter(n => n !== undefined);
        if (nValues.length < 2) return { xValues: [], yValues: [] };

        const min = Math.min(...nValues);
        const max = Math.max(...nValues);
        const range = max - min;
        if (range === 0) return { xValues: [min], yValues: [nValues.length] };

        const bucketCount = 10;
        const bucketSize = range / bucketCount;
        const distribution = Array(bucketCount).fill(0);
        nValues.forEach(n => {
            let bucketIndex = Math.floor((n - min) / bucketSize);
            if (bucketIndex === bucketCount) bucketIndex--; // Include max value in last bucket
            distribution[bucketIndex]++;
        });

        return {
            xValues: Array(bucketCount).fill(0).map((_, i) => (min + (i + 0.5) * bucketSize).toPrecision(3)),
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

    // Initialize the application
    initializeApp();
});