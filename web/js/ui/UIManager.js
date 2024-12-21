
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

    const solveForSelect = document.getElementById("solve-for-select");
    solveForSelect.value = currentSolveFor; // Set initial value
    solveForSelect.addEventListener("change", updateSolveForVariable);

    document.getElementById('reset-button').addEventListener('click', resetToDefaults);
    document.getElementById('randomize-button').addEventListener('click', randomizeUnlocked);

     document.getElementById('new-trace-button').addEventListener('click', startNewTrace);
     document.getElementById('clear-trace-button').addEventListener('click', clearCurrentTrace);

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
});
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
