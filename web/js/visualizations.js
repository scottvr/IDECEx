
// Object to store our chart instances
let chartInstances = {
  barChart: null,
  relationshipGraph: null,
  distributionCurve: null,
  densityHeatmap: null
};

// Mark that module version is active
window.moduleVersionActive = true;

export function createOrUpdateComparativeBarChart(data) {
  const ctx = document.getElementById('comparativeBarChart').getContext('2d');
  
  if (chartInstances.barChart) {
      chartInstances.barChart.destroy();
  }
  
  chartInstances.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: data.labels,
          datasets: [{
              label: 'Variable Values',
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

export function createOrUpdateVariableRelationshipGraph(data) {
  if (chartInstances.relationshipGraph) {
      Plotly.purge('variableRelationshipGraph');
  }
  
  // Handle multi-trace data
  const traces = data.datasets || [{
      x: data.xValues,
      y: data.yValues,
      mode: 'markers',
      type: 'scatter',
      name: 'Current Trace'
  }];
  
  Plotly.newPlot('variableRelationshipGraph', traces, {
      title: `Relationship between ${data.xLabel} and ${data.yLabel}`,
      xaxis: { title: data.xLabel },
      yaxis: { title: data.yLabel },
      legend: { 
          orientation: 'h',
          y: -0.2
      }
  });
  
  chartInstances.relationshipGraph = document.getElementById('variableRelationshipGraph');
}

export function createOrUpdateProbabilityDistributionCurve(data) {
  const ctx = document.getElementById('probabilityDistributionCurve').getContext('2d');
  
  if (chartInstances.distributionCurve) {
      chartInstances.distributionCurve.destroy();
  }
  
  // Handle multi-trace data
  const datasets = data.datasets || [{
      label: data.label || 'Current Trace',
      data: data.yValues || [],
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
      fill: false,
      pointRadius: 3
  }];
  
  const labels = data.datasets 
      ? Array.from({ length: Math.max(...datasets.map(d => d.data.length)) }, (_, i) => i + 1)
      : data.xValues || [];
  
  chartInstances.distributionCurve = new Chart(ctx, {
      type: 'line',
      data: {
          labels: labels,
          datasets: datasets
      },
      options: {
          responsive: true,
          plugins: {
              legend: {
                  position: 'top',
                  labels: {
                      boxWidth: 15
                  }
              },
              tooltip: {
                  mode: 'index',
                  intersect: false
              }
          },
          scales: {
              x: { 
                  title: { display: true, text: data.xLabel || 'Value' } 
              },
              y: { 
                  title: { display: true, text: data.yLabel || 'Value' },
                  beginAtZero: true
              }
          },
          elements: {
              line: {
                  tension: 0.2
              },
              point: {
                  radius: 3,
                  hoverRadius: 7
              }
          }
      }
  });
}

export function createOrUpdateGalaxyDensityHeatmap(data) {
  if (chartInstances.densityHeatmap) {
      Plotly.purge('galaxyDensityHeatmap');
  }
  
  Plotly.newPlot('galaxyDensityHeatmap', [{
      z: data.densityValues,
      type: 'heatmap',
      colorscale: 'Viridis'
  }], {
      title: 'Galaxy Density Heatmap',
      xaxis: { title: 'f_i' },
      yaxis: { title: 'f_c' }
  });
  
  chartInstances.densityHeatmap = document.getElementById('galaxyDensityHeatmap');
}

// Function to clear all charts
export function clearAllCharts() {
  if (chartInstances.barChart) {
      chartInstances.barChart.destroy();
  }
  if (chartInstances.relationshipGraph) {
      Plotly.purge('variableRelationshipGraph');
  }
  if (chartInstances.distributionCurve) {
      chartInstances.distributionCurve.destroy();
  }
  if (chartInstances.densityHeatmap) {
      Plotly.purge('galaxyDensityHeatmap');
  }
  
  // Reset chart instances
  chartInstances = {
      barChart: null,
      relationshipGraph: null,
      distributionCurve: null,
      densityHeatmap: null
  };
}

export function createComparativeBarChart(data) {
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

export function createVariableRelationshipGraph(data) {
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

export function createProbabilityDistributionCurve(data) {
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
          }
      }
  });
}

export function createGalaxyDensityHeatmap(data) {
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

export function createSolarSystemMap(data) {
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