// IDECEx visualizations.js

function createComparativeBarChart(data) {
    const ctx = document.getElementById('comparativeBarChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Number of Civilizations (N)',
                data: data.values,
                backgroundColor: 'rgba(75, 192, 192, 0.6)'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function createVariableRelationshipGraph(data) {
    Plotly.newPlot('variableRelationshipGraph', [{
        x: data.xValues,
        y: data.yValues,
        mode: 'markers',
        type: 'scatter'
    }], {
        title: `Relationship between ${data.xLabel} and ${data.yLabel}`,
        xaxis: { title: data.xLabel },
        yaxis: { title: data.yLabel }
    });
}

function createProbabilityDistributionCurve(data) {
    const ctx = document.getElementById('probabilityDistributionCurve').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.xValues,
            datasets: [{
                label: data.label,
                data: data.yValues,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: data.xLabel } },
                y: { title: { display: true, text: 'Probability' } }
            }k
        }
    });
}

function createGalaxyDensityHeatmap(data) {
    Plotly.newPlot('galaxyDensityHeatmap', [{
        z: data.densityValues,
        type: 'heatmap',
        colorscale: 'Viridis'
    }], {
        title: 'Galaxy Density Heatmap',
        xaxis: { title: 'X Position' },
        yaxis: { title: 'Y Position' }
    });
}

function createSolarSystemMap(data) {
    const width = 800;
    const height = 600;

    const svg = d3.select("#visualization-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const simulation = d3.forceSimulation(data.stars)
        .force("charge", d3.forceManyBody().strength(-50))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(d => d.radius));

    const stars = svg.selectAll("circle")
        .data(data.stars)
        .enter()
        .append("circle")
        .attr("r", d => d.radius)
        .attr("fill", d => d.color);

    simulation.on("tick", () => {
        stars
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });
}
