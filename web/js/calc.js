document.addEventListener("DOMContentLoaded", function () {
    const variables = ["R_star", "f_p", "n_e", "f_l", "f_i", "f_c", "L"];
    const inputs = {};
    const locks = {};
    variables.forEach(variable => {
        inputs[variable] = document.getElementById(`${variable}_input`);
        locks[variable] = document.getElementById(`${variable}_lock`);
        inputs[variable].addEventListener("input", calculate);
        locks[variable].addEventListener("change", calculate);
    });
    const N_result = document.getElementById("N_result");
    const solveForSelect = document.getElementById("solve-for-select");
    const form = document.getElementById("drake-equation-form");
    const resetButton = document.getElementById("reset-button");

    form.addEventListener("submit", function(e) {
        e.preventDefault();
        calculate();
    });

    solveForSelect.addEventListener("change", calculate);
    resetButton.addEventListener("click", resetToDefaults);

    function calculate() {
        const targetVariable = solveForSelect.value;
        const values = solveEquation(targetVariable);
        
        variables.forEach(v => {
            if (!locks[v].checked) {
                inputs[v].value = values[v].toFixed(4);
            }
        });
        N_result.value = values.N.toFixed(4);
    }

    function solveEquation(targetVariable) {
        const values = {};
        let product = 1;

        variables.forEach(v => {
            if (v !== targetVariable) {
                values[v] = parseFloat(inputs[v].value) || 0;
                product *= values[v];
            }
        });

        if (targetVariable === "N") {
            values.N = product;
        } else {
            values.N = parseFloat(N_result.value) || 0;
            values[targetVariable] = values.N / product;
        }

        return values;
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
    }

    function showMessage(message, isError = false) {
        const messageContainer = document.getElementById("message-container");
        messageContainer.textContent = message;
        messageContainer.className = isError ? "error" : "success";
    }

    calculate();
});
