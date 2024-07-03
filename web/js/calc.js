document.addEventListener("DOMContentLoaded", function () {
    const variables = ["R_star", "f_p", "n_e", "f_l", "f_i", "f_c", "L", "N"];
    const inputs = {};
    const locks = {};
    const divs = {};
    let currentSolveFor = "N"; // Initial solve-for variable

    variables.forEach(variable => {
        inputs[variable] = document.getElementById(`${variable}_input`);
        locks[variable] = document.getElementById(`${variable}_lock`);
        divs[variable] = document.getElementById(`${variable}_div`);
        inputs[variable].addEventListener("input", calculate);
        if (locks[variable]) {
            //// temporarily disable the eventListener
            // locks[variable].addEventListener("change", calculate);
            //// temporarily hide the locks until I remember what they were there to enmable in the first place
            locks[variable].style.display = "none";
        }
    });

    const solveForSelect = document.getElementById("solve-for-select");
    solveForSelect.value = currentSolveFor; // Set initial value
    solveForSelect.addEventListener("change", updateSolveForVariable);

    function showDEQ() {
        const deq = document.getElementById('deq_mathtml');
        deq.style.display = "inline";
    }

    function hideDEQ() {
        const deq = document.getElementById('deq_mathtml');
        deq.style.display = "none";
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

    function calculate() {
        const values = {};

        variables.forEach(variable => {
            if (variable !== currentSolveFor && !inputs[variable].readOnly) {
                values[variable] = parseFloat(inputs[variable].value) || 0;
            }
        });

        const result = solveEquation(currentSolveFor, values);
        inputs[currentSolveFor].value = result.toFixed(4);
    }

    function solveEquation(solveFor, values) {
        const product = variables.reduce((acc, variable) => {
            return (variable === solveFor || variable === "N") ? acc : acc * values[variable];
        }, 1);

        if (solveFor === "N") {
            return product;
        } else {
            return (values.N || 0) / product;
        }
    }

    // Initialize the interface
    updateSolveForVariable();
});
