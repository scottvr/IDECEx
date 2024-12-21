// Data processing functions for each visualization
function processDataForBarChart(trace) {
    const latestResult = trace.calculations[trace.calculations.length - 1];
    return {
        labels: Object.keys(latestResult).filter(key => key !== 'timestamp'),
        values: Object.values(latestResult).filter((_, index) => Object.keys(latestResult)[index] !== 'timestamp')
    };
}

function processDataForRelationshipGraph(trace) {
    // Let's create a graph showing the relationship between R* and N
    return {
        xValues: trace.calculations.map(calc => calc.R_star),
        yValues: trace.calculations.map(calc => calc.N),
        xLabel: 'R* (Rate of star formation)',
        yLabel: 'N (Number of detectable civilizations)'
    };
}

function processDataForDistributionCurve(trace) {
    // Let's create a distribution of N values
    const nValues = trace.calculations.map(calc => calc.N);
    const min = Math.min(...nValues);
    const max = Math.max(...nValues);
    const range = max - min;
    const bucketSize = range / 10; // Divide into 10 buckets

    const distribution = Array(10).fill(0);
    nValues.forEach(n => {
        const bucketIndex = Math.min(Math.floor((n - min) / bucketSize), 9);
        distribution[bucketIndex]++;
    });

    return {
        xValues: Array(10).fill(0).map((_, i) => min + (i + 0.5) * bucketSize),
        yValues: distribution,
        label: 'Distribution of N',
        xLabel: 'N (Number of detectable civilizations)'
    };
}

function processDataForHeatmap(trace) {
    // Let's create a heatmap showing the relationship between f_i and f_c
    const gridSize = 10;
    const heatmapData = Array(gridSize).fill().map(() => Array(gridSize).fill(0));

    trace.calculations.forEach(calc => {
        const xIndex = Math.min(Math.floor(calc.f_i * gridSize), gridSize - 1);
        const yIndex = Math.min(Math.floor(calc.f_c * gridSize), gridSize - 1);
        heatmapData[yIndex][xIndex]++;
    });

    return {
        densityValues: heatmapData
    };
}
