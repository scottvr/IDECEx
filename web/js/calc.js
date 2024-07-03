document.addEventListener("DOMContentLoaded", function () {
    const variables = ["R_star", "f_p", "n_e", "f_l", "f_i", "f_c", "L"];
    const inputs = {};
    const locks = {};
    variables.forEach(variable => {
        inputs[variable] = document.getElementById(`${variable}_input`);
        locks[variable] = document.getElementById(`${variable}_lock`);
        inputs[variable].addEventListener("input", calculateN);
        locks[variable].addEventListener("change", calculateN);
    });
    const N_result = document.getElementById("N_result");

    function calculateN() {
        let R_star = parseFloat(inputs["R_star"].value);
        let f_p = parseFloat(inputs["f_p"].value);
        let n_e = parseFloat(inputs["n_e"].value);
        let f_l = parseFloat(inputs["f_l"].value);
        let f_i = parseFloat(inputs["f_i"].value);
        let f_c = parseFloat(inputs["f_c"].value);
        let L = parseFloat(inputs["L"].value);

        // Calculate N based on unlocked variables
        let N = R_star * f_p * n_e * f_l * f_i * f_c * L;
        N_result.value = N.toFixed(2);

        // Recalculate if any variable is left blank and unlocked
        variables.forEach(variable => {
            if (!locks[variable].checked && inputs[variable].value === "") {
                inputs[variable].value = (N / (R_star * f_p * n_e * f_l * f_i * f_c * L)).toFixed(2);
            }
        });
    }

    calculateN();
});
