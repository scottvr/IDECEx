class DrakeCalculator {
    constructor(model = 'classic') {
        this.model = model;
        this.variables = this.getVariables();
        this.defaultValues = this.getDefaultValues();
    }
  
    /**
     * Get variables based on current model
     */
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
  
    /**
     * Get default values based on current model
     */
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
    
    /**
     * Get current model name
     */
    getCurrentModel() {
        return this.model;
    }
    
    /**
     * Set the current model
     */
    setModel(model) {
        if (model !== this.model) {
            this.model = model;
            this.variables = this.getVariables();
            this.defaultValues = this.getDefaultValues();
            return true;
        }
        return false;
    }
  
    /**
     * Validate input range for a variable
     */
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
  
    /**
     * Calculate the equation result
     * @param {string} solveFor - Variable to solve for
     * @param {object} values - Current values of other variables
     * @returns {object} Full result object with all variables
     */
    calculate(solveFor, values) {
        // Get all variables except N and solveFor
        const variables = this.getVariables().filter(v => v !== 'N' && v !== solveFor);
        
        // Calculate product of all other variables
        const product = variables.reduce((acc, variable) => {
            // Use provided value or default
            return acc * (values[variable] || this.defaultValues[variable] || 0);
        }, 1);
  
        let result;
        if (solveFor === 'N') {
            result = product;
        } else {
            result = product === 0 ? 0 : (values.N || 0) / product;
        }
        
        // Create a complete result object with all variables
        const resultObj = { 
            ...this.defaultValues,  // Start with defaults
            ...values,              // Override with provided values
            [solveFor]: result,     // Add calculated result
            timestamp: Date.now()
        };
        
        return resultObj;
    }
  
    /**
     * Get a random value within reasonable range for a variable
     */
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
    
    /**
     * Get the display name for a variable
     */
    getVariableDisplayName(variable) {
        const displayNames = {
            R_star: 'R* (Star Formation)',
            f_p: 'fp (Fraction with Planets)',
            n_e: 'ne (Habitable Planets)',
            f_l: 'fl (Life Emergence)',
            f_i: 'fi (Intelligence)',
            f_c: 'fc (Communication)',
            L: 'L (Civilization Lifetime)',
            N: 'N (Detectable Civilizations)',
            f_pm: 'fpm (Metal-rich Planets)',
            f_g: 'fg (Galactic Habitable Zone)',
            f_t: 'ft (Temperature Stability)',
            f_m: 'fm (Large Moon)',
            f_j: 'fj (Jupiter Protection)'
        };
        
        return displayNames[variable] || variable;
    }
    
    /**
     * Get description for a variable
     */
    getVariableDescription(variable) {
        const descriptions = {
            R_star: 'Average rate of star formation in our galaxy',
            f_p: 'Fraction of stars that have planets',
            n_e: 'Average number of planets that could potentially support life per star',
            f_l: 'Fraction of habitable planets where life emerges',
            f_i: 'Fraction of planets with life where intelligence evolves',
            f_c: 'Fraction of civilizations that develop detectable technology',
            L: 'Length of time civilizations release detectable signals',
            N: 'Number of detectable civilizations in our galaxy',
            f_pm: 'Fraction of planets with metal-rich composition',
            f_g: 'Fraction of stars in galactic habitable zone',
            f_t: 'Fraction of planets with stable temperature',
            f_m: 'Fraction of planets with large stabilizing moons',
            f_j: 'Fraction of systems with Jupiter-like planet protection'
        };
        
        return descriptions[variable] || '';
    }
}
  
export default DrakeCalculator;