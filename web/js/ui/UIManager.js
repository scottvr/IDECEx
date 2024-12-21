// UIManager.js
export class UIManager {
    constructor(calculator, traceManager, onCalculationUpdate) {
        this.calculator = calculator;  // Store reference to calculator instance
        this.traceManager = traceManager;
        this.onCalculationUpdate = onCalculationUpdate;
        this.currentSolveFor = "N";
        this.initializeEventListeners();
    }

    updateSolveForVariable(value) {
        const previousSolveFor = this.currentSolveFor;
        this.currentSolveFor = value;
        
        // Update UI for previous solve-for variable
        this.updateVariableUI(previousSolveFor, false);
        
        // Update UI for new solve-for variable
        this.updateVariableUI(this.currentSolveFor, true);

        // Use the calculator instance to perform calculation
        const result = this.calculator.calculate(this.currentSolveFor, this.getInputValues());
        if (this.onCalculationUpdate) {
            this.onCalculationUpdate(result);
        }
    }

    getInputValues() {
        const values = {};
        this.calculator.getVariables().forEach(variable => {
            if (variable !== this.currentSolveFor) {
                const input = document.getElementById(`${variable}_input`);
                if (input && !input.readOnly) {
                    values[variable] = parseFloat(input.value) || 0;
                }
            }
        });
        return values;
    }

    updateVariableUI(variable, isSolveFor) {
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

    handleCalculation = debounce(() => {
        const result = this.calculator.calculate(this.currentSolveFor, this.getInputValues());
        if (this.onCalculationUpdate) {
            this.onCalculationUpdate(result);
        }
    }, 300);

    initializeEventListeners() {
        // Initialize solve-for select
        const solveForSelect = document.getElementById("solve-for-select");
        if (solveForSelect) {
            solveForSelect.addEventListener("change", (e) => 
                this.updateSolveForVariable(e.target.value)
            );
        }

        // Initialize variable inputs
        this.calculator.getVariables().forEach(variable => {
            const input = document.getElementById(`${variable}_input`);
            const lock = document.getElementById(`${variable}_lock`);
            
            if (input) {
                input.addEventListener("input", () => this.handleCalculation());
            }
            if (lock) {
                lock.addEventListener("change", () => this.handleCalculation());
            }
        });

        // Initialize buttons
        const resetButton = document.getElementById('reset-button');
        if (resetButton) {
            resetButton.addEventListener('click', () => this.resetToDefaults());
        }

        const randomizeButton = document.getElementById('randomize-button');
        if (randomizeButton) {
            randomizeButton.addEventListener('click', () => this.randomizeUnlocked());
        }
    }

    resetToDefaults() {
        const defaults = this.calculator.getDefaultValues();
        Object.entries(defaults).forEach(([variable, value]) => {
            const input = document.getElementById(`${variable}_input`);
            const lock = document.getElementById(`${variable}_lock`);
            if (input) input.value = value;
            if (lock) lock.checked = false;
        });
        this.handleCalculation();
    }

    randomizeUnlocked() {
        this.calculator.getVariables().forEach(variable => {
            if (variable !== this.currentSolveFor) {
                const input = document.getElementById(`${variable}_input`);
                const lock = document.getElementById(`${variable}_lock`);
                if (input && lock && !lock.checked) {
                    input.value = this.calculator.getRandomValue(variable);
                }
            }
        });
        this.handleCalculation();
    }
}

// Utility function for debouncing
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
//
//document.addEventListener("DOMContentLoaded", function () {
//    const variables = ["R_star", "f_p", "n_e", "f_l", "f_i", "f_c", "L", "N"];
//    const inputs = {};
//    const locks = {};
//    const divs = {};
//    let currentSolveFor = "N"; // Initial solve-for variable
//    const debouncedCalculate = debounce(calculate, 300);
//    
//    variables.forEach(variable => {
//        inputs[variable] = document.getElementById(`${variable}_input`);
//        locks[variable] = document.getElementById(`${variable}_lock`);
//        divs[variable] = document.getElementById(`${variable}_div`);
//        // inputs[variable].addEventListener("input", debouncedCalculate);
//        inputs[variable].addEventListener("input", calculate);
//        if (locks[variable]) {
//            // locks[variable].addEventListener("change", debouncedCalculate);
//            locks[variable].addEventListener("change", updateLockToolTip);
//        }
//    });
//
//    const solveForSelect = document.getElementById("solve-for-select");
//    solveForSelect.value = currentSolveFor; // Set initial value
//    solveForSelect.addEventListener("change", updateSolveForVariable);
//
//    document.getElementById('reset-button').addEventListener('click', resetToDefaults);
//    document.getElementById('randomize-button').addEventListener('click', randomizeUnlocked);
//
//     document.getElementById('new-trace-button').addEventListener('click', startNewTrace);
//     document.getElementById('clear-trace-button').addEventListener('click', clearCurrentTrace);
//
//    const traceSelect = document.getElementById('trace-select');
//    traceSelect.addEventListener('change', (e) => switchTrace(parseInt(e.target.value)));
//
//
//    function updateLockToolTip() {
//        if (this.checked) {
//          this.title = "Unlock this value";
//        } else {
//          this.title = "Lock this value";
//        }  
//    }
//
//    function updateSolveForVariable() {
//        const previousSolveFor = currentSolveFor;
//        currentSolveFor = solveForSelect.value;
//        
//        // Update UI for previous solve-for variable
//        divs[previousSolveFor].className = 'variable-group';
//        inputs[previousSolveFor].readOnly = false;
//        if (locks[previousSolveFor]) {
//            locks[previousSolveFor].style.display = "inline";
//        }
//
//        // Update UI for new solve-for variable
//        divs[currentSolveFor].className = 'variable-group result input';
//        inputs[currentSolveFor].readOnly = true;
//        if (locks[currentSolveFor]) {
//            locks[currentSolveFor].style.display = "none";
//            locks[currentSolveFor].checked = false;
//        }
//
//        calculate();
//    }
//});
//function debounce(func, wait) {
//    let timeout;
//    return function executedFunction(...args) {
//        const later = () => {
//            clearTimeout(timeout);
//            func(...args);
//        };
//        clearTimeout(timeout);
//        timeout = setTimeout(later, wait);
//    };
//}
//