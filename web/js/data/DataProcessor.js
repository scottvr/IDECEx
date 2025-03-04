// DataProcessor.js
export class DataProcessor {
    constructor() {
        // Initialize any settings or configurations
    }
    
    /**
     * Process data from a trace for all visualizations
     */
    processDataForVisualizations(trace) {
        return {
            barChart: this.processDataForBarChart(trace),
            relationshipGraph: this.processDataForRelationshipGraph(trace),
            distributionCurve: this.processDataForDistributionCurve(trace),
            heatmap: this.processDataForHeatmap(trace),
            solarSystem: this.processDataForSolarSystem(trace)
        };
    }
    
    /**
     * Process data for the comparative bar chart
     */
    processDataForBarChart(trace) {
        if (!trace || !trace.calculations || trace.calculations.length === 0) {
            return {
                labels: [],
                values: []
            };
        }
        
        const latestResult = trace.calculations[trace.calculations.length - 1];
        
        // Filter out non-variable properties
        const validKeys = Object.keys(latestResult).filter(key => 
            key !== 'timestamp' && key !== 'id' && !key.startsWith('_')
        );
        
        return {
            labels: validKeys,
            values: validKeys.map(key => latestResult[key])
        };
    }
    
    /**
     * Process data for the relationship graph
     */
    processDataForRelationshipGraph(trace) {
        if (!trace || !trace.calculations || trace.calculations.length === 0) {
            return {
                xValues: [],
                yValues: [],
                xLabel: 'Variable',
                yLabel: 'N (Number of civilizations)'
            };
        }
        
        // Default to showing relationship between R* and N
        return {
            xValues: trace.calculations.map(calc => calc.R_star),
            yValues: trace.calculations.map(calc => calc.N),
            xLabel: 'R* (Rate of star formation)',
            yLabel: 'N (Number of detectable civilizations)'
        };
    }
    
    /**
     * Process data for the probability distribution curve
     */
    processDataForDistributionCurve(trace) {
        if (!trace || !trace.calculations || trace.calculations.length < 2) {
            return {
                xValues: [0],
                yValues: [0],
                label: 'Not enough data',
                xLabel: 'N (Number of detectable civilizations)'
            };
        }
        
        // Create a distribution of N values
        const nValues = trace.calculations.map(calc => calc.N);
        const min = Math.min(...nValues);
        const max = Math.max(...nValues);
        
        // Handle edge case where all values are the same
        if (min === max) {
            return {
                xValues: [min],
                yValues: [nValues.length],
                label: 'Distribution of N',
                xLabel: 'N (Number of detectable civilizations)'
            };
        }
        
        const range = max - min;
        const bucketCount = Math.min(10, Math.max(5, Math.ceil(nValues.length / 5)));
        const bucketSize = range / bucketCount;
        
        // Create buckets
        const distribution = Array(bucketCount).fill(0);
        
        // Fill buckets
        nValues.forEach(n => {
            const bucketIndex = Math.min(Math.floor((n - min) / bucketSize), bucketCount - 1);
            distribution[bucketIndex]++;
        });
        
        return {
            xValues: Array(bucketCount).fill(0).map((_, i) => min + (i + 0.5) * bucketSize),
            yValues: distribution,
            label: 'Distribution of N',
            xLabel: 'N (Number of detectable civilizations)'
        };
    }
    
    /**
     * Process data for the heatmap visualization
     */
    processDataForHeatmap(trace) {
        if (!trace || !trace.calculations || trace.calculations.length === 0) {
            return {
                densityValues: [[0]],
                xLabel: 'X',
                yLabel: 'Y'
            };
        }
        
        // Create a heatmap showing intelligence vs communication correlation
        const gridSize = Math.min(10, Math.ceil(Math.sqrt(trace.calculations.length)));
        const heatmapData = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
        
        trace.calculations.forEach(calc => {
            // Use fi and fc as x and y coordinates
            const xIndex = Math.min(Math.floor(calc.f_i * gridSize), gridSize - 1);
            const yIndex = Math.min(Math.floor(calc.f_c * gridSize), gridSize - 1);
            heatmapData[yIndex][xIndex]++;
        });
        
        return {
            densityValues: heatmapData,
            xLabel: 'Intelligence (fi)',
            yLabel: 'Communication (fc)'
        };
    }
    
    /**
     * Process data for solar system visualization
     */
    processDataForSolarSystem(trace) {
        if (!trace || !trace.calculations || trace.calculations.length === 0) {
            return {
                stars: [],
                planets: []
            };
        }
        
        const latestCalc = trace.calculations[trace.calculations.length - 1];
        
        // Create a simple solar system visualization based on our parameters
        return {
            stars: [
                {
                    id: 1,
                    name: 'Star',
                    radius: 20 * Math.sqrt(latestCalc.R_star || 1),
                    color: '#FFD700',
                    x: 0,
                    y: 0
                }
            ],
            planets: [
                {
                    id: 1,
                    name: 'Habitable Planet',
                    radius: 8 * Math.sqrt(latestCalc.n_e || 1),
                    orbit: 100,
                    color: latestCalc.f_l > 0.5 ? '#6B8E23' : '#8B4513',
                    hasLife: latestCalc.f_l > 0.5,
                    hasIntelligence: latestCalc.f_i > 0.5
                }
            ]
        };
    }
}