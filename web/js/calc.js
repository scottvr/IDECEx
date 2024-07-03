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

    document.getElementById('randomize-button').addEventListener('click', randomizeUnlocked);

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

function updateVisualization(calculationResults) {
    // Process calculation results into a format suitable for visualization
    const visualizationData = processDataForVisualization(calculationResults);
    createSolarSystemMap(visualizationData);
}

function processDataForVisualization(results) {
    // Convert calculation results into a format suitable for D3.js
    // This is a placeholder implementation
    return {
        stars: [
            { radius: 5, color: "yellow" },
            { radius: 3, color: "orange" },
            // ... more stars based on calculation
        ]
    };
}

function randomizeUnlocked() {
    variables.forEach(variable => {
        if (variable !== currentSolveFor && !locks[variable].checked) {
            inputs[variable].value = getRandomValue(variable);
        }
    });
    calculate();
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
