
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