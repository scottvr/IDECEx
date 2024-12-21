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